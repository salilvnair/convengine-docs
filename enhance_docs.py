import re

details = {
    "LoadOrCreateConversationStep": """
This is the **initial bootstrap step** of the runtime engine. It uses the `conversationId` provided in the HTTP request to lookup an existing `CeConversation` row in the Postgres database. 

If the conversation exists:
- The context JSON is hydrated into the runtime `EngineSession`.
- Previous `intent` and `state` codes are restored.
- All stored memory summaries and pending actions are fetched from the database and loaded into memory.

If the conversation is new:
- A new `CeConversation` entity is instantiated.
- The intent and state default to `UNKNOWN`.

This ensures that regardless of scale, the API is entirely stateless and can route requests to any pod.
""",
    "ResetConversationStep": """
Checks `EngineSession` properties to see if an explicit reset has been triggered by the invoking consumer (this is usually passed as a param like `_reset=true`).

When triggered, it clears:
- The `intent` and `state` trackers.
- The `contextJson` (wiping all extracted schema facts).
- The `inputParamsJson`.

The session is marked as \`RUNNING\` again, but completely fresh. An audit event `CONVERSATION_RESET` is logged.
""",
    "PersistConversationBootstrapStep": """
A simple lifecycle checkpoint to ensure the conversation has a `createdAt` timestamp. If the user session just started in `LoadOrCreateConversationStep`, this step performs the initial `INSERT (ce_conversation)` to the database to ensure foreign-key dependencies (like audit logs) don't fail later in the loop.
""",
    "AuditUserInputStep": """
Records the raw text query the user typed on this turn into the `ce_audit` table. This is purely for debug tracing and business analytics. It binds the `USER_INPUT` audit stage with the conversation ID and the text payload.
""",
    "PolicyEnforcementStep": """
Secures the pipeline against prohibited input using `ce_policy`.

It reads all active rows from `ce_policy`, executing either `REGEX`, `EXACT`, or `LLM` rules against the user's raw text. If a match occurs:
- The conversation is forced to a \`BLOCKED\` status.
- A `StepResult.Stop()` is returned immediately, skipping all remaining NLP and intent steps.
- The `ce_policy.response_text` is loaded as the final payload shipped back to the consumer.
""",
    "DialogueActStep": """
This is a core semantic classification step. Instead of jumping straight to domain Intents (like 'PAY_BILL'), the engine first classifies the **linguistic act** of the turn. 

Values are mapped to the Java `DialogueAct` enum:
- **`NEW_REQUEST`**: User is asking for a brand new topic.
- **`AFFIRM`**: User is saying "yes", "sure", "do it".
- **`NEGATE`**: User is saying "no", "stop", "cancel".
- **`QUESTION`**: User is asking a clarifying question.
- **`DATA_ENTRY`**: User is providing raw data like a phone number.

**Resolution flow (Config to LLM):**
1. Reads `convengine.flow.dialogue-act.resolute` from `application.yml` (e.g., `REGEX_THEN_LLM`).
2. Checks fast regexes first. For example, `(?i)^(yes|yep|sure)$` maps to `AFFIRM`.
3. If regex confidence is below `llm-threshold`, it fires an LLM prompt to probabilistically resolve the DialogueAct.
4. The result is stored as `DIALOGUE_ACT` in the session's input params.
""",
    "InteractionPolicyStep": """
Uses the identified `DialogueAct` to decide how the engine should route the turn. This step prevents the system from confusing follow-up answers (like saying "yes") with new intents.

The output maps to the `InteractionPolicyDecision` enum:
- **`EXECUTE_PENDING_ACTION`**: If the DialogueAct is `AFFIRM` and there's a background API task waiting.
- **`REJECT_PENDING_ACTION`**: If `NEGATE` and an action is waiting.
- **`FILL_PENDING_SLOT`**: If the user is currently answering a schema extraction question.
- **`RECLASSIFY_INTENT`**: If this is a `NEW_REQUEST`.

By mapping DialogueActs to these policies, the engine can "skip" intent resolution (skipping step 11 entirely) if the user is just answering "yes" to a confirmation.
""",
    "ActionLifecycleStep": """
Tracks time-to-live (TTL) for `CePendingAction` rows. If the user was asked "Are you sure you want to cancel?" 3 turns ago, but started talking about the weather instead, this step will mark the `pending_action_runtime` as `EXPIRED`.

Status transitions (Enum `PendingActionStatus`):
- `OPEN`: Task is created but waiting for user confirmation.
- `IN_PROGRESS`: The user affirmed, and the task is ready to execute.
- `REJECTED`: The user negated.
- `EXPIRED`: The TTL turn limit was reached before the user confirmed.
""",
    "DisambiguationStep": """
A smart conversational router. If multiple pending actions apply to the current context (e.g., "Cancel flight" vs "Cancel hotel" both valid), it pauses the pipeline.

It dynamically builds a multiple-choice prompt (or LLM synthesis) asking the user to clarify which action they meant. It emits an `ASSISTANT_OUTPUT` step, stalling the pipeline until the user clarifies.
""",
    "GuardrailStep": """
The last line of defense before intent triggers. Reads the `ce_config` guardrail thresholds and sanitize instructions.
If a command is flagged as "sensitive" (e.g., destructive actions like closing an account), it can force an explicit `SENSITIVE_ACTION_APPROVAL_REQUIRED` pause, blocking the pipeline from executing tasks until MFA or explicit user verification is acquired.
""",
    "IntentResolutionStep": """
The primary intent matching gateway. Uses the `CompositeIntentResolver` (which merges Regex, Semantic Search, and LLM classifiers based off `ce_intent_classifier`). 

If the interaction policy decided we are in `FILL_PENDING_SLOT` mode, this step is bypassed entirely (referred to as a "Locked Intent").

Otherwise:
- Queries `ce_intent_classifier` for matches.
- Uses `INTENT_RESOLVED` audit logs to map the `intentCode`.
- Sets the context state to `IDLE` (or whatever the initial configuration demands).
""",
    "ResetResolvedIntentStep": """
A quality of life check. If the resolved intent matches one of the `RESET_INTENT_CODES` configured in Spring configuration (e.g. `START_OVER`, `RESET`), this step immediately executes a session wipe akin to `ResetConversationStep`, returning the conversation to a clean slate.
""",
    "FallbackIntentStateStep": """
A safety net. If the classifier fails to return any confidence, or an exception occurred, this step forcibly binds the native engine defaults to `UNKNOWN` intent and `UNKNOWN` state so that `ce_rule` and `ce_response` tables can still define fallback messaging (e.g., "I didn't understand that").
""",
    "AddContainerDataStep": """
Bridges static tenant/consumer configurations. Evaluates `ce_container_config` to pull any global JSON context relevant to the intent and merges it directly into `session.contextJson`. This allows things like "Store Hours" or "Region Policies" to be globally attached to all LLM contexts without hardcoding.
""",
    "PendingActionStep": """
Executes Java code. If the InteractionPolicy is `EXECUTE_PENDING_ACTION` and the status is `IN_PROGRESS`, this step resolves the Spring Bean ID attached to the `ce_pending_action` row.

It invokes `CeTaskExecutor.execute()`, runs the backend transaction (e.g. Stripe Refund), and captures the boolean/json result back into the engine `EngineSession` context for downstream rules to evaluate.
""",
    "ToolOrchestrationStep": """
The gateway for Model Context Protocol (MCP) tooling. If `ce_tool` specifies that this intent requires a `tool_group`, this step binds the request and delegates to an external executor. It pauses the LLM, executes the backend SQL or REST fetch, and dumps the massive JSON result into `tool_result` dictionary in context.
""",
    "McpToolStep": """
Specifically iterates over `ce_mcp_tool` bindings. Instead of static grouped tools, this triggers an agent planner that interprets the input, selects an MCP tool, writes the payload, and executes it. This is the core of dynamic tool use in ConvEngine V2.
""",
    "SchemaExtractionStep": """
Evaluates `ce_output_schema`. It injects the missing required slots into an LLM extracting prompt using `ce_prompt_template`. The LLM returns a structured JSON map. This step merges it with `session.contextJson`.

It then runs `missingFieldEvaluator.evaluate()`. If fields are missing, it sets `session.setSchemaLocked(true)`.
""",
    "AutoAdvanceStep": """
In V1, rules had to manually check if schema extraction was done. In V2, this step computes the boolean flags `schemaComplete` and `hasAny` and binds them to the session context. This allows `ce_rule` to simply trigger on `schemaComplete == true`.
""",
    "RulesStep": """
The core state-machine driver. It queries `ce_rule` for the current Intent and State.
It evaluates expressions (like `JSON_PATH` or `REGEX`) against the `session.contextJson`.

If a rule matches, it executes the target `action` (e.g. `SET_STATE` to `CONFIRMATION`, or `SET_TASK`). It loops until no more rules match, effectively "auto-advancing" state machine nodes.
""",
    "StateGraphStep": """
A strict validater. Checks `ce_state_graph` to see if the transition that just occurred in `RulesStep` was legally defined by the developer. If a rule jumped from `IDLE` to `CANCELLED` but there is no edge in the graph, this step logs an error and optionally reverts the state to prevent invalid transitions.
""",
    "ResponseResolutionStep": """
The final output generator. Queries `ce_response` for the current intent and state.
- If `TEXT`: Returns a hardcoded string.
- If `DERIVED`: Loads `ce_prompt_template`, injects the `contextJson`, `tool_result`, and `schema`, and asks the LLM to write a fluid, contextual response to the user.
Sets `session.getConversation().setLastAssistantJson()` with the payload.
""",
    "MemoryStep": """
Evaluates the rolling history. If `ce_memory` is configured, and `recentTurns` exceeds the threshold, this step fires off a summarization prompt to the LLM. It compresses the last N turns into a dense paragraph and saves it as `memory.session_summary` in the context JSON, enabling infinite-context retention without blowing up token limits.
""",
    "PersistConversationStep": """
The database commit step. Writes the `CeConversation` row, saving the mutated `contextJson`, `inputParams`, new `intentCode`, and `stateCode`. The step is placed at the end so if an exception occurs mid-pipeline, the corrupted context is ignored and rolled back natively.
""",
    "PipelineEndGuardStep": """
Timing and safety metrics. Audits the total millisecond execution time from Step 1 to 25. Fires the `PIPELINE_COMPLETE` audit log. Verifies that the resulting payload isn't null.
"""
}

with open("step_details_part.mdx", "r") as f:
    content = f.read()

naive_text = """This step executes dynamically in the pipeline loop. Depending on engine configuration, specific dependencies are inspected to resolve the outcome. 
If conditions require the pipeline to halt early, it generates a `Stop` result. Otherwise, it emits a `Continue` mutation affecting the `EngineSession`."""

for step_name, detail_text in details.items():
    # Use regex to find the specific instances of the naive block before each step
    # We can match `<summary>Detailed Execution Logic</summary>\n\n<naive_text>\n\n<CodeBlockToggle title="{step_name}.execute()"`
    
    escaped_naive = re.escape(naive_text)
    pattern = r'(<summary>Detailed Execution Logic</summary>\s+)' + escaped_naive + r'(\s+<CodeBlockToggle title=\"' + re.escape(step_name) + r'\.execute\(\)\")'
    replacement = r'\1' + detail_text.strip().replace('\\', '\\\\') + r'\2'
    
    content = re.sub(pattern, replacement, content)

with open("step_details_enhanced.mdx", "w") as f:
    f.write(content)

print("Enhanced details complete.")
