---
title: About ConvEngine
sidebar_position: 0
---

# ConvEngine — Conversational Intelligence Platform

ConvEngine is an enterprise-grade **Conversational Intelligence Platform** built on Spring Boot. It gives product teams a structured, auditable, and extensible runtime for building stateful, intent-driven conversational experiences — without writing bespoke dialogue management code from scratch.

---

## What ConvEngine is

ConvEngine is a **pipeline engine**, not a chatbot SDK. It does not assume a chat widget or a single response format. Instead it resolves every incoming user turn through a sequence of well-defined pipeline steps — each responsible for one concern — and emits a structured response that the consumer's delivery layer (REST API, websocket, embedded widget, voice gateway) can render however it likes.

The engine is **intent-centric and state-centric**: every turn is evaluated against the user's recognized conversational intent and the current dialogue state. Transitions, guardrails, tool calls, and response selection are all conditioned on this resolved context.

---

## Core architectural capabilities

### Dialogue Intent Resolver

The Dialogue Intent Resolver sits at the heart of the pipeline. It maps raw natural-language input to a canonical intent code (`ce_intent`) using configurable LLM-backed resolution with fallback heuristics. Resolved intent is the primary key that gates tool selection, rule evaluation, and response resolution downstream.

Intent resolution is not a one-shot lookup. The resolver maintains semantic affinity across multi-turn exchanges — distinguishing a follow-up clarification from a topic change — so the engine never loses conversational context between turns.

### Dialogue Act Classifier

Before intent resolution, the Dialogue Act Classifier characterizes the *function* of the user turn: is this an assertion, a query, a confirmation, a rejection, a greeting? Dialogue act classification feeds the interaction policy layer, which governs what the engine is allowed to do on this turn (collect, confirm, execute, escalate).

### Agent Planner (ReAct-style planning loop)

The **Agent Planner** is a ReAct-pattern LLM agent embedded inside the pipeline. On each turn where tool use is required, the planner receives:

- the resolved intent and dialogue state
- the full set of available tools (both DB-registered Agent Tools and runtime-discovered MCP Server tools)
- prior turn observations accumulated in `context.agent.observations`

The planner emits either a `CALL_TOOL` decision (tool code + arguments) or an `ANSWER` decision (final text). `CALL_TOOL` triggers execution; the result is appended to observations; the planner loops. `ANSWER` terminates the loop and writes the final answer to `context.agent.finalAnswer`.

The planning loop is **bounded** by a configurable loop-guard limit, ensuring no runaway execution under adversarial or malformed inputs.

### Agent Tool Registry

The **Agent Tool Registry** is ConvEngine's own DB-backed capability registry (`ce_agent_tool`). Each tool record carries:

- a unique tool code and tool group (DB, HTTP_API, WORKFLOW_ACTION, DOCUMENT_RETRIEVAL, CALCULATOR_TRANSFORM, NOTIFICATION, FILES)
- intent and state scope (`intent_code`, `state_code`) — preventing tools from being surfaced outside their authorized conversational context
- description text visible to the planner's LLM

Typed executors implement each tool group: `DbToolExecutor`, `HttpApiToolExecutor`, `WorkflowActionToolExecutor`, `DocumentRetrievalToolExecutor`, etc. New tool groups can be added by implementing `AgentToolExecutor`.

### MCP Server Registry (Real Model Context Protocol)

ConvEngine connects to **external MCP servers** (any server implementing the Model Context Protocol JSON-RPC 2.0 specification) via the `McpRegistry`. Supported transports:

| Transport | Use case |
|---|---|
| STDIO | Local subprocess (Python, Node.js MCP servers) |
| HTTP | Remote HTTP endpoint |
| SSE | Server-Sent Events streaming |

At plan time, `McpRegistry.discoveredTools()` returns all tools currently advertised by connected external servers. These are merged transparently into the planner's tool list — the Agent Planner sees Agent Tools and MCP Server tools identically. `CALL_TOOL` works for either. External MCP tools do not require a `ce_agent_tool` DB entry.

Tool code format for discovered external tools: `mcp.{serverId}.{toolName}`

### SQL Execution with Guardrails and Preflight

DB-type Agent Tools execute SQL through a hardened execution path:

- **Preflight validation** (`DbSqlPreflightService`) runs the generated SQL against the DB engine's query planner before execution, catching structural errors and auto-repairing common patterns (for example, invalid epoch conversions on timestamp columns).
- **SQL Guardrail** (`AgentSqlGuardrail`) enforces an allowlist/blocklist on functions and statements. Write operations (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `TRUNCATE`, `ALTER`, `CREATE`, `MERGE`, `CALL`) are blocked unconditionally. Consumers can extend the guardrail via `ce_agent_sql_guardrail` rows without touching the runtime.
- **Query interceptors** (`PostgresQueryInterceptor`) give consumers a hook to inspect or transform SQL before guardrail + execution. The framework ships a default interceptor; consumers override by implementing the SPI.

### Semantic Query Pipeline

The Semantic Query pipeline allows natural-language queries to be translated into safe read-only SQL automatically, without hand-authored SQL templates. The chain runs inside the Agent Planner loop:

1. **`db.semantic.interpret`** — resolves the user's query to a canonical query class (`ce_semantic_query_class`), extracting structured intent from free-form text.
2. **`db.semantic.query`** — generates SQL from the resolved query class using the business field → table/column mapping (`ce_semantic_mapping`). Failures and corrections are recorded in `ce_semantic_query_failures` to improve future iterations.
3. **`postgres.query`** — executes the generated SQL through the full preflight + guardrail + interceptor stack.

The sequence is enforced: `db.semantic.query` cannot run before a successful `db.semantic.interpret`. A hard guardrail blocks out-of-order execution.

### Rules Engine (Phase-gated)

The Rules Engine evaluates `ce_rule` rows at specific lifecycle phases:

| Phase | When it runs |
|---|---|
| `PRE_RESPONSE_RESOLUTION` | Before final response is selected |
| `POST_AGENT_INTENT` | After intent resolution |
| `POST_AGENT_MCP` | After the Agent Planner loop completes |
| `POST_TOOL_EXECUTION` | After a direct (single) tool execution |

Rules use JSONPath match patterns evaluated against the full engine context, enabling conditional state transitions, escalations, and response overrides without code changes.

### Guardrail Layer

Beyond SQL guardrails, the framework ships a general-purpose `GuardrailStep` that evaluates configured guardrail rules before tool execution. Next-tool guardrails prevent the planner from selecting a tool that is not permitted given the current lifecycle state.

### Schema Extraction and Disambiguation

`SchemaExtractionStep` extracts structured data from user input against a configured schema (slot-filling). `DisambiguationStep` detects ambiguous input and triggers clarification flows before the pipeline proceeds to action resolution.

### Adaptive Learning Loop (Feedback + Knowledge)

ConvEngine captures **structured feedback** on tool results (`ce_agent_feedback`) — thumbs-up/down signals that can be used to retrain or tune the planner prompt, guardrails, and semantic mappings over time.

The **Query Knowledge Base** (`ce_agent_query_knowledge`) stores reusable, embedding-indexed query patterns. Semantic similarity search over this knowledge base accelerates interpretation and reduces LLM calls for previously-seen query shapes.

### Conversation Memory

`ConversationMemoryStore` maintains per-session memory across turns. The memory store is the source of truth for accumulated observations, state transitions, and prior tool results — giving the planner full situational awareness without requiring the consumer to pass history manually.

### Pending Action Lifecycle

Long-running or async operations are modelled as **Pending Actions** (`ce_pending_action`). `PendingActionStep` checks for unresolved pending actions at the start of each turn, enabling the engine to resume interrupted workflows (for example, awaiting a third-party API callback) without losing conversational state.

### Conversation Replay and Evaluation

`ConversationReplayService` enables offline evaluation: a recorded conversation transcript can be replayed through the engine to validate that pipeline changes do not regress the output. The eval framework produces structured comparison reports.

---

## Pipeline step order (default)

```
DialogueActStep
InteractionPolicyStep
IntentResolutionStep
SchemaExtractionStep
DisambiguationStep
GuardrailStep
PendingActionStep
RulesStep  (POST_AGENT_INTENT)
ToolOrchestrationStep  (direct tool path)
AgentToolStep          (planner loop path)
RulesStep  (POST_AGENT_MCP / POST_TOOL_EXECUTION)
MemoryStep
StateGraphStep
ResponseResolutionStep
```

Each step is independently versioned and can be replaced or skipped by the consumer's pipeline configuration.

---

## Example: Acme Corp FAQ Conversational Experience

Acme Corp needs a customer-facing conversational assistant capable of answering product and policy questions, looking up order status in real time, and escalating to a human agent when the conversation falls outside known territory.

**What the platform provides, not what Acme writes:**

**Dialogue Intent Resolver** — Acme authors intent definitions (PRODUCT_FAQ, ORDER_STATUS, ESCALATE_TO_AGENT) in `ce_intent`. The resolver maps every incoming customer message to one of these intents automatically, handling synonyms, misspellings, and multi-sentence inputs.

**Agent Planner with Knowledge-Base-backed FAQ Tool** — For PRODUCT_FAQ intent, the planner selects the `document.faq.search` Agent Tool (DOCUMENT_RETRIEVAL group). The tool searches Acme's embedded FAQ knowledge base. The planner receives the top-k retrieved passages as an observation and synthesizes a grounded, citation-backed answer.

**Real-Time Order Status via MCP Server** — Acme's order management system exposes a local MCP server (`mcp.acme-oms.get_order_status`). Once registered with `McpRegistry`, the tool appears in the planner's tool list automatically. When the customer asks "where is order ORD-7017?", the planner issues `CALL_TOOL` to `mcp.acme-oms.get_order_status` with `{"orderId":"ORD-7017"}`, receives the real-time status as an observation, and synthesizes a natural-language status summary — all without Acme writing any dialogue management code.

**Adaptive Feedback Loop** — Customers rate answers with thumbs-up/down. The Adaptive Learning Loop records these signals in `ce_agent_feedback`. Over time, query patterns that produced positive outcomes are indexed in the Query Knowledge Base, and the Semantic Query pipeline prioritizes them for similar future queries.

**Guardrail-Protected Escalation** — A `POST_AGENT_MCP` rule monitors `context.agent.lifecycle.outcome`. If the planner returns `BLOCKED` (no tool resolved the query satisfactorily) or if the guardrail detects an out-of-scope request, the rule fires a state transition to `ESCALATE_TO_AGENT`. The Response Resolution step renders an escalation message and the session is handed off — automatically, without Acme writing branching logic.

**What Acme's engineers write:** intent definitions, FAQ content, SQL templates for any custom DB queries, rule JSONPath patterns for escalation, and the MCP server for their order system. ConvEngine handles everything in between.

---

## Deployment model

ConvEngine is a Spring Boot library dependency. The consumer application wires ConvEngine beans via Spring auto-configuration, provides a `DataSource` for the CE tables, and exposes the engine's REST API endpoints (or integrates the `DefaultConversationalEngine` directly into their own API layer). No separate process or sidecar is required.

External MCP servers run as separate processes or remote services and are registered at runtime via the `McpRegistry` REST API. The engine does not need to be restarted when MCP servers are added, removed, or updated — tool discovery is live.
