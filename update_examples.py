import sys

content = """---
title: Examples (ReactFlow)
sidebar_position: 3
hide_table_of_contents: true
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import { EngineDebugFlow, Conversation, User, Assistant, CodeBlockToggle, Highlight, DbTable, FileRef, MethodRef } from "@site/src/components/convengine";

export const faqNodes = [
  { id: "faq_intent", position: { x: 20, y: 60 }, data: { label: "IntentResolutionStep" } },
  { id: "faq_schema", position: { x: 300, y: 60 }, data: { label: "SchemaExtractionStep" } },
  { id: "faq_rules", position: { x: 580, y: 60 }, data: { label: "RulesStep" } },
  { id: "faq_resp", position: { x: 300, y: 220 }, data: { label: "ResponseResolutionStep" } },
  { id: "faq_mem", position: { x: 580, y: 220 }, data: { label: "MemoryStep" } },
];

export const faqEdges = [
  { id: "faq_e1", source: "faq_intent", target: "faq_schema" },
  { id: "faq_e2", source: "faq_schema", target: "faq_rules" },
  { id: "faq_e3", source: "faq_rules", target: "faq_resp" },
  { id: "faq_e4", source: "faq_resp", target: "faq_mem" },
];

export const faqDetails = {
  faq_intent: { title: "Intent resolution", file: "engine/steps/IntentResolutionStep.java", method: "execute(...) ", stage: "INTENT_RESOLVED", summary: "Classifier resolves FAQ intent.", session: ["intent=FAQ, state=IDLE"] },
  faq_schema: { title: "Fact extraction", file: "engine/steps/SchemaExtractionStep.java", method: "execute(...) ", stage: "SCHEMA_EVALUATED", summary: "Minimal schema evaluation.", session: ["schema complete"] },
  faq_rules: { title: "Rules evaluation", file: "engine/steps/RulesStep.java", method: "execute(...) ", stage: "RULE_NO_MATCH", summary: "No auto-advance transition required.", session: ["state unchanged"] },
  faq_resp: { title: "Response resolution", file: "engine/steps/ResponseResolutionStep.java", method: "execute(...) ", stage: "ASSISTANT_OUTPUT", summary: "Resolves DERIVED response text.", session: ["LLM synthesized string"] },
  faq_mem: { title: "Context memory", file: "engine/steps/MemoryStep.java", method: "execute(...) ", stage: "MEMORY_UPDATED", summary: "Records turn for future summaries.", session: ["memory summary updated"] },
};

export const transferNodes = [
  { id: "t_intent", position: { x: 20, y: 60 }, data: { label: "IntentResolutionStep" } },
  { id: "t_schema", position: { x: 300, y: 60 }, data: { label: "SchemaExtractionStep" } },
  { id: "t_rules1", position: { x: 580, y: 60 }, data: { label: "RulesStep (Turn 1)" } },
  { id: "t_resp1", position: { x: 860, y: 60 }, data: { label: "Ask for slots" } },
  { id: "t_schema2", position: { x: 300, y: 220 }, data: { label: "SchemaExtractionStep (Turn 2)" } },
  { id: "t_rules2", position: { x: 580, y: 220 }, data: { label: "RulesStep -> Confirm" } },
];

export const transferEdges = [
  { id: "t_e1", source: "t_intent", target: "t_schema" },
  { id: "t_e2", source: "t_schema", target: "t_rules1" },
  { id: "t_e3", source: "t_rules1", target: "t_resp1" },
  { id: "t_e4", source: "t_resp1", target: "t_schema2", style: { strokeDasharray: '5,5' }, label: 'Next Turn' },
  { id: "t_e5", source: "t_schema2", target: "t_rules2" },
];

export const transferDetails = {
  t_intent: { title: "Intent resolution", file: "engine/steps/IntentResolutionStep.java", method: "execute(...) ", stage: "INTENT_RESOLVED", summary: "CONNECTION_TRANSFER locked.", session: ["state=IDLE"] },
  t_schema: { title: "Slot extraction", file: "engine/steps/SchemaExtractionStep.java", method: "execute(...) ", stage: "SCHEMA_INCOMPLETE", summary: "Identifies missing slots.", session: ["missingFields tracked"] },
  t_rules1: { title: "Bootstrap state", file: "engine/steps/RulesStep.java", method: "execute(...) ", stage: "RULE_MATCH", summary: "Transitions IDLE -> COLLECT_INPUTS.", session: ["state -> COLLECT_INPUTS"] },
  t_resp1: { title: "Clarification", file: "engine/steps/ResponseResolutionStep.java", method: "execute(...) ", stage: "ASSISTANT_OUTPUT", summary: "Prompts for customerId, email, etc.", session: ["Prompt sent"] },
  t_schema2: { title: "Fill slots", file: "engine/steps/SchemaExtractionStep.java", method: "execute(...) ", stage: "SCHEMA_COMPLETE", summary: "User provides all missing slots.", session: ["schema locked"] },
  t_rules2: { title: "Advance", file: "engine/steps/RulesStep.java", method: "execute(...) ", stage: "RULE_MATCH", summary: "Transitions to AWAITING_CONFIRMATION.", session: ["state -> AWAITING_CONFIRMATION"] },
};

export const cancelNodes = [
  { id: "c_act", position: { x: 20, y: 60 }, data: { label: "DialogueActStep" } },
  { id: "c_policy", position: { x: 300, y: 60 }, data: { label: "InteractionPolicyStep" } },
  { id: "c_guard", position: { x: 580, y: 60 }, data: { label: "GuardrailStep" } },
  { id: "c_pending", position: { x: 860, y: 60 }, data: { label: "PendingActionStep" } },
  { id: "c_rules", position: { x: 300, y: 220 }, data: { label: "RulesStep" } },
  { id: "c_resp", position: { x: 580, y: 220 }, data: { label: "Finalizer" } },
];

export const cancelEdges = [
  { id: "c_e1", source: "c_act", target: "c_policy" },
  { id: "c_e2", source: "c_policy", target: "c_guard" },
  { id: "c_e3", source: "c_guard", target: "c_pending" },
  { id: "c_e4", source: "c_pending", target: "c_rules" },
  { id: "c_e5", source: "c_rules", target: "c_resp" },
];

export const cancelDetails = {
  c_act: { title: "Act check", file: "engine/steps/DialogueActStep.java", method: "execute(...) ", stage: "DIALOGUE_ACT_CLASSIFIED", summary: "User says 'yes'. Act=AFFIRM.", session: ["dialogueAct=AFFIRM"] },
  c_policy: { title: "Policy lock", file: "engine/steps/InteractionPolicyStep.java", method: "execute(...) ", stage: "INTERACTION_POLICY_DECIDED", summary: "Routes to pending task over intent.", session: ["policyDecision=EXECUTE_PENDING_ACTION"] },
  c_guard: { title: "Safety check", file: "engine/steps/GuardrailStep.java", method: "execute(...) ", stage: "GUARDRAIL_ALLOW", summary: "Ensures benign operation.", session: ["result=ALLOW"] },
  c_pending: { title: "Task execute", file: "engine/steps/PendingActionStep.java", method: "execute(...) ", stage: "PENDING_ACTION_EXECUTED", summary: "Triggers API cancellation bean.", session: ["status=EXECUTED"] },
  c_rules: { title: "Completion rule", file: "engine/steps/RulesStep.java", method: "execute(...) ", stage: "RULE_MATCH", summary: "EXECUTED -> CANCELLED state.", session: ["state -> CANCELLED"] },
  c_resp: { title: "Response", file: "engine/steps/ResponseResolutionStep.java", method: "execute(...) ", stage: "ASSISTANT_OUTPUT", summary: "Completion text.", session: ["done"] },
};

export const invNodes = [
  { id: "i_intent", position: { x: 20, y: 60 }, data: { label: "IntentResolutionStep" } },
  { id: "i_orch", position: { x: 300, y: 60 }, data: { label: "ToolOrchestrationStep" } },
  { id: "i_java", position: { x: 580, y: 60 }, data: { label: "Live MCP Tool Call" } },
  { id: "i_ret", position: { x: 300, y: 220 }, data: { label: "Orchestration Returns" } },
  { id: "i_resp", position: { x: 580, y: 220 }, data: { label: "ResponseResolutionStep" } },
];

export const invEdges = [
  { id: "i_e1", source: "i_intent", target: "i_orch" },
  { id: "i_e2", source: "i_orch", target: "i_java" },
  { id: "i_e3", source: "i_java", target: "i_ret" },
  { id: "i_e4", source: "i_ret", target: "i_resp" },
];

export const invDetails = {
  i_intent: { title: "Intent", file: "engine/steps/IntentResolutionStep.java", method: "execute(...) ", stage: "INTENT_RESOLVED", summary: "DATABASE_QUERY intent.", session: ["intent=DATABASE_QUERY"] },
  i_orch: { title: "Tool Dispatch", file: "engine/steps/ToolOrchestrationStep.java", method: "execute(...) ", stage: "TOOL_ORCHESTRATION_DISPATCH", summary: "Delegates to MCP runtime.", session: ["group=INVENTORY_DB"] },
  i_java: { title: "Execution", file: "external/java/Adapter.java", method: "execute(...) ", stage: "EXTERNAL", summary: "Java connector runs backend DB.", session: ["Fetching rows"] },
  i_ret: { title: "Tool Finish", file: "engine/steps/ToolOrchestrationStep.java", method: "execute(...) ", stage: "TOOL_ORCHESTRATION_RESULT", summary: "Assigns result to session context.", session: ["tool_result.dbList"] },
  i_resp: { title: "Interpolate", file: "engine/steps/ResponseResolutionStep.java", method: "execute(...) ", stage: "ASSISTANT_OUTPUT", summary: "LLM uses live tool data in response.", session: ["Synthesized text"] },
};

export const supportNodes = [
  { id: "s_mem1", position: { x: 20, y: 60 }, data: { label: "MemoryStep (Load)" } },
  { id: "s_intent", position: { x: 300, y: 60 }, data: { label: "IntentResolutionStep" } },
  { id: "s_resp", position: { x: 580, y: 60 }, data: { label: "ResponseResolutionStep" } },
  { id: "s_mem2", position: { x: 860, y: 60 }, data: { label: "MemoryStep (Compute)" } },
];

export const supportEdges = [
  { id: "s_e1", source: "s_mem1", target: "s_intent" },
  { id: "s_e2", source: "s_intent", target: "s_resp" },
  { id: "s_e3", source: "s_resp", target: "s_mem2" },
];

export const supportDetails = {
  s_mem1: { title: "Load summary", file: "engine/steps/MemoryStep.java", method: "execute(...) ", stage: "MEMORY_INJECTED", summary: "Injects context from 14 turns ago.", session: ["memory.session_summary available"] },
  s_intent: { title: "Guided AI", file: "engine/steps/IntentResolutionStep.java", method: "execute(...) ", stage: "INTENT_RESOLVED", summary: "Resolves meaning over ambiguous input.", session: ["intent=SUPPORT_DIAGNOSTIC"] },
  s_resp: { title: "Accurate query", file: "engine/steps/ResponseResolutionStep.java", method: "execute(...) ", stage: "ASSISTANT_OUTPUT", summary: "Answers with previous link text.", session: ["derived text"] },
  s_mem2: { title: "Update Rolling", file: "engine/steps/MemoryStep.java", method: "execute(...) ", stage: "MEMORY_UPDATED", summary: "Compresses latest turns into new summary.", session: ["re-evaluated summary"] },
};


# Examples (ReactFlow + DML + Audit)

This page is the practical E2E companion to the V2 architecture. Each example shows:
- conversation UX
- runtime flow graph (interactive)
- DML seed rows
- expected audit stages

## Canonical V2 Runtime Step Set

<Highlight type="info" title="Step loop behavior">
Step loop invokes each <MethodRef>execute(session)</MethodRef>. If a step returns <MethodRef>Stop</MethodRef>, response returns immediately; otherwise loop continues.
</Highlight>

<div className="ce-step-badge-list" role="list" aria-label="Canonical runtime step set">
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">1</span><span className="ce-step-badge-label">LoadOrCreateConversationStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">2</span><span className="ce-step-badge-label">ResetConversationStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">3</span><span className="ce-step-badge-label">PersistConversationBootstrapStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">4</span><span className="ce-step-badge-label">AuditUserInputStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">5</span><span className="ce-step-badge-label">PolicyEnforcementStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">6</span><span className="ce-step-badge-label">DialogueActStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">7</span><span className="ce-step-badge-label">InteractionPolicyStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">8</span><span className="ce-step-badge-label">ActionLifecycleStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">9</span><span className="ce-step-badge-label">DisambiguationStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">10</span><span className="ce-step-badge-label">GuardrailStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">11</span><span className="ce-step-badge-label">IntentResolutionStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">12</span><span className="ce-step-badge-label">ResetResolvedIntentStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">13</span><span className="ce-step-badge-label">FallbackIntentStateStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">14</span><span className="ce-step-badge-label">AddContainerDataStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">15</span><span className="ce-step-badge-label">PendingActionStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">16</span><span className="ce-step-badge-label">ToolOrchestrationStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">17</span><span className="ce-step-badge-label">McpToolStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">18</span><span className="ce-step-badge-label">SchemaExtractionStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">19</span><span className="ce-step-badge-label">AutoAdvanceStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">20</span><span className="ce-step-badge-label">RulesStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">21</span><span className="ce-step-badge-label">StateGraphStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">22</span><span className="ce-step-badge-label">ResponseResolutionStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">23</span><span className="ce-step-badge-label">MemoryStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">24</span><span className="ce-step-badge-label">PersistConversationStep</span></div>
  <div className="ce-step-badge-item"><span className="ce-step-badge-index">25</span><span className="ce-step-badge-label">PipelineEndGuardStep</span></div>
</div>

## FAQ

<Tabs groupId="example-faq">
  <TabItem value="conversation" label="Conversation + Flow" default>

<Conversation title="FAQ">
  <User>How do I transfer my electricity connection?</User>
  <Assistant>Share customerId, phone, email, source city, and target city. Then confirm to submit transfer.</Assistant>
</Conversation>

<EngineDebugFlow title="FAQ runtime flow" subtitle="Basic Intent + Memory retention" nodes={faqNodes} edges={faqEdges} detailsById={faqDetails} defaultSelectedId="faq_intent" />

  </TabItem>
  <TabItem value="dml" label="DML Entries">

<CodeBlockToggle title="FAQ seed SQL" language="sql" defaultOpen={true}>
{`INSERT INTO ce_intent (intent_code, description, priority, enabled)
VALUES ('FAQ', 'Answer informational questions from FAQ knowledge base', 10, true);

INSERT INTO ce_intent_classifier (intent_code, rule_type, pattern, priority, enabled)
VALUES ('FAQ', 'REGEX', '(?i)\\\\b(what|how|help|faq|information|details|explain)\\\\b', 10, true);

INSERT INTO ce_prompt_template (intent_code, state_code, response_type, system_prompt, user_prompt, temperature, enabled)
VALUES ('FAQ', 'IDLE', 'TEXT',
        'You are a concise FAQ assistant. Answer directly and clearly.',
        'User question: {{user_input}}\\nFAQ context: {{container_data}}\\nReturn short helpful answer.',
        0.10, true);

INSERT INTO ce_response (intent_code, state_code, output_format, response_type, derivation_hint, priority, enabled)
VALUES ('FAQ', 'IDLE', 'TEXT', 'DERIVED',
        'Answer FAQ using available context and user question.', 10, true);`}
</CodeBlockToggle>

  </TabItem>
  <TabItem value="audit" label="Audit Trail">

<DbTable
  title="Expected audit stages (ordered)"
  columns={["Order", "Stage", "Must contain"]}
  rows={[
    ["1", "USER_INPUT", "original user message"],
    ["2", "DIALOGUE_ACT_CLASSIFIED", "dialogueAct=QUESTION"],
    ["3", "INTERACTION_POLICY_DECIDED", "policyDecision=RECLASSIFY_INTENT"],
    ["4", "INTENT_RESOLVED", "intent=FAQ"],
    ["5", "RESOLVE_RESPONSE_SELECTED", "responseType=DERIVED"],
    ["6", "ASSISTANT_OUTPUT", "output text or json payload"],
    ["7", "MEMORY_UPDATED", "summaryChars/recalled flags"],
  ]}
/>

  </TabItem>
</Tabs>

## CONNECTION_TRANSFER

<Tabs groupId="example-transfer">
  <TabItem value="conversation" label="Conversation + Flow" default>

<Conversation title="Connection transfer conversation">
  <User>Move my electricity connection from City1 to City2.</User>
  <Assistant>Please provide customerId, phone, email, sourceCity, and targetCity.</Assistant>
  <User>customerId 9912, phone 9988776655, email user@zapper.com, sourceCity City1, targetCity City2</User>
  <Assistant>Do you want to move this connection right away?</Assistant>
</Conversation>

<EngineDebugFlow title="Connection Transfer Flow" subtitle="Slot fill auto advance" nodes={transferNodes} edges={transferEdges} detailsById={transferDetails} defaultSelectedId="t_schema" />

  </TabItem>
  <TabItem value="dml" label="DML Entries">

<CodeBlockToggle title="Schema & Rules SQL" language="sql" defaultOpen={true}>
{`INSERT INTO ce_intent (intent_code, enabled) VALUES ('CONNECTION_TRANSFER', true);

INSERT INTO ce_output_schema (intent_code, format_type, schema_json, enabled)
VALUES ('CONNECTION_TRANSFER', 'JSON', '{"properties":{"customerId":{},"phone":{},"email":{},"sourceCity":{},"targetCity":{}}, "required":["customerId","phone","email","sourceCity","targetCity"]}', true);

INSERT INTO ce_rule (phase, intent_code, state_code, rule_type, match_pattern, "action", action_value, priority, enabled)
VALUES
('PIPELINE_RULES', 'CONNECTION_TRANSFER', 'IDLE', 'REGEX', '.*', 'SET_STATE', 'COLLECT_INPUTS', 10, true),
('PIPELINE_RULES', 'CONNECTION_TRANSFER', 'COLLECT_INPUTS', 'JSON_PATH',
 '$[?(@.state == ''COLLECT_INPUTS'' && @.customerId && @.phone && @.email && @.sourceCity && @.targetCity)]',
 'SET_STATE', 'AWAITING_CONFIRMATION', 100, true);

INSERT INTO ce_response (intent_code, state_code, response_type, output_format, enabled)
VALUES ('CONNECTION_TRANSFER', 'COLLECT_INPUTS', 'DERIVED', 'TEXT', true);

INSERT INTO ce_response (intent_code, state_code, response_type, output_format, enabled)
VALUES ('CONNECTION_TRANSFER', 'AWAITING_CONFIRMATION', 'DERIVED', 'TEXT', true);`}
</CodeBlockToggle>

  </TabItem>
  <TabItem value="audit" label="Audit Trail">

<DbTable
  title="Collection Turn Expected Trace"
  columns={["Stage", "Meaning"]}
  rows={[
    ["INTENT_RESOLVED", "Intent locked to CONNECTION_TRANSFER"],
    ["SCHEMA_INCOMPLETE", "Signals partial JSON payload extraction"],
    ["RULE_MATCH", "Initial IDLE -> COLLECT_INPUTS switch"],
    ["ASSISTANT_OUTPUT", "Prompts for slot filling"]
  ]}
/>

  </TabItem>
</Tabs>

## ORDER_CANCELLATION

<Tabs groupId="example-cancel">
  <TabItem value="conversation" label="Conversation + Flow" default>

<Conversation title="Protected Order Cancellation">
  <User>Cancel my shoe order.</User>
  <Assistant>What is your order number?</Assistant>
  <User>It's 48392.</User>
  <Assistant>Are you sure you want to cancel order 48392?</Assistant>
  <User>Yes please do that.</User>
  <Assistant>Order 48392 has been completely cancelled.</Assistant>
</Conversation>

<EngineDebugFlow title="Action Execution Flow (Turn 3)" subtitle="Interaction Policy executing Pending Action" nodes={cancelNodes} edges={cancelEdges} detailsById={cancelDetails} defaultSelectedId="c_policy" />

  </TabItem>
  <TabItem value="dml" label="DML Entries">

<CodeBlockToggle title="Pending Action Assignment SQL" language="sql" defaultOpen={true}>
{`INSERT INTO ce_intent (intent_code, enabled) VALUES ('CANCEL_ORDER', true);

INSERT INTO ce_pending_action (intent_code, state_code, action_name, expiration_turns, priority, enabled)
VALUES ('CANCEL_ORDER', 'CONFIRM_CANCEL', 'stripeCancelTask', 3, 10, true);

INSERT INTO ce_rule (phase, intent_code, rule_type, action, priority, enabled)
VALUES ('POST_EVAL', 'CANCEL_ORDER', 'CONDITION', 'TRANSITION_STATE:CANCELLED', 10, true);

INSERT INTO ce_prompt_template (intent_code, response_type, system_prompt, user_prompt, template_id, enabled)
VALUES ('CANCEL_ORDER', 'DERIVED', 'Format cleanly.', 'Order {{context.orderNumber}} has been completely cancelled.', 'tmpl_cancelled', true);`}
</CodeBlockToggle>

  </TabItem>
  <TabItem value="audit" label="Audit Trail">

<DbTable
  title="Action Commit Expected Trace"
  columns={["Stage", "Required Contents"]}
  rows={[
    ["DIALOGUE_ACT_CLASSIFIED", "dialogueAct=AFFIRM"],
    ["INTERACTION_POLICY_DECIDED", "policyDecision=EXECUTE_PENDING_ACTION"],
    ["PENDING_ACTION_EXECUTED", "status=EXECUTED, pendingActionRef=stripeCancelTask"],
    ["RULE_APPLIED", "state -> CANCELLED"]
  ]}
/>

  </TabItem>
</Tabs>

## INVENTORY_LOOKUP

<Tabs groupId="example-inventory">
  <TabItem value="conversation" label="Conversation + Flow" default>

<Conversation title="DB Orchestration Flow">
  <User>How many running shoes are left in warehouse B?</User>
  <Assistant>Checking the inventory database...</Assistant>
  <User>*[System delay executing Tool]*</User>
  <Assistant>We currently have 421 units of running shoes allocated to warehouse B.</Assistant>
</Conversation>

<EngineDebugFlow title="Tool Request Flow" subtitle="Tool orchestration injects payload" nodes={invNodes} edges={invEdges} detailsById={invDetails} defaultSelectedId="i_orch" />

  </TabItem>
  <TabItem value="dml" label="DML Entries">

<CodeBlockToggle title="Virtual DB Binding SQL" language="sql" defaultOpen={true}>
{`INSERT INTO ce_mcp_tool (intent_code, tool_group, required_params_json, execution_timeout_ms, enabled)
VALUES ('DATABASE_QUERY', 'INVENTORY_DB', '["itemType", "warehouseId"]', 5000, true);

INSERT INTO ce_prompt_template (intent_code, response_type, system_prompt, user_prompt, template_id, enabled)
VALUES ('DATABASE_QUERY', 'DERIVED', 'You are an inventory assistant.', 'Answer from these database results: {{tool_result.dbList}}', 'tmpl_inventory_gen', true);

INSERT INTO ce_response (intent_code, state_code, response_type, template_id, priority, enabled)
VALUES ('DATABASE_QUERY', 'IDLE', 'DERIVED', 'tmpl_inventory_gen', 10, true);`}
</CodeBlockToggle>

  </TabItem>
  <TabItem value="audit" label="Audit Trail">

<DbTable
  title="Data Request Trace"
  columns={["Stage", "Context Checkpoint"]}
  rows={[
    ["TOOL_ORCHESTRATION_DISPATCH", "toolGroup=INVENTORY_DB"],
    ["TOOL_ORCHESTRATION_RESULT", "toolResult={'count': 421}"],
    ["ASSISTANT_OUTPUT", "Final text uses 421 units output"]
  ]}
/>

  </TabItem>
</Tabs>

## SUPPORT_DIAGNOSTIC

<Tabs groupId="example-support">
  <TabItem value="conversation" label="Conversation + Flow" default>

<Conversation title="Long Context Support Thread">
  <User>[Turn 15]: Wait, what link did you tell me to use for the firmware reset again?</User>
  <Assistant>Based on our previous troubleshooting, you should use http://router.local/admin_reset with the default PIN 1234.</Assistant>
</Conversation>

<EngineDebugFlow title="Memory Summary Flow" subtitle="Long-context retrieval during turn evaluation" nodes={supportNodes} edges={supportEdges} detailsById={supportDetails} defaultSelectedId="s_mem1" />

  </TabItem>
  <TabItem value="dml" label="DML Entries">

<CodeBlockToggle title="Memory Auto-Summarization Config" language="yaml" defaultOpen={true}>
{`convengine:
  flow:
    memory:
      enabled: true
      # Max token size for the compressed summary string
      summary-max-chars: 1200
      # Number of turns to trigger a new summary compression cycle
      recent-turns-for-summary: 3`}
</CodeBlockToggle>

  </TabItem>
  <TabItem value="audit" label="Audit Trail">

<DbTable
  title="Memory Trace"
  columns={["Stage", "Context Action"]}
  rows={[
    ["MEMORY_INJECTED", "old sequence of facts available to tool_result/intent logic"],
    ["INTENT_RESOLVED", "Supports historical context"],
    ["MEMORY_UPDATED", "newSummary generated and injected"]
  ]}
/>

  </TabItem>
</Tabs>

<Highlight type="tip" title="Fast validation">
For each example run, inspect both <FileRef>/api/v2/conversation/audit/{'{conversationId}'}</FileRef> and <FileRef>/api/v2/conversation/audit/{'{conversationId}'}/trace</FileRef>.
</Highlight>
"""

with open('docs/v2/examples.mdx', 'w') as f:
    f.write(content)

print('done')
