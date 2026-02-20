import os
import re

STEPS = [
    ("LoadOrCreateConversationStep", "Fetch or bootstrap conversation row", "conversation, intent/state/context sync", "ce_conversation"),
    ("ResetConversationStep", "Early explicit reset", "intent/state/context/input params reset", "input flags, command text"),
    ("PersistConversationBootstrapStep", "Ensure conversation row persisted", "none/metadata", "ce_conversation"),
    ("AuditUserInputStep", "Persist user input audit", "none", "ce_audit"),
    ("PolicyEnforcementStep", "Policy block and stop", "payload + stop result on block", "ce_policy"),
    ("DialogueActStep", "Classify user turn action type", "dialogue_act in input params", "ce_config (dialogue act mode), ce_audit"),
    ("InteractionPolicyStep", "Decide runtime policy before intent", "policy_decision, skip_intent_resolution", "ce_config, session pending state"),
    ("ActionLifecycleStep", "Maintain pending action runtime TTL/status", "pending_action_runtime context", "ce_pending_action, ce_audit"),
    ("DisambiguationStep", "Ask question when multiple actions fit", "pending_clarification question/context", "ce_pending_action, ce_config, ce_audit"),
    ("GuardrailStep", "Apply guardrails and approval rules", "guardrail flags/sanitized text", "ce_config, ce_audit"),
    ("IntentResolutionStep", "Resolve intent with classifier+agent", "intent/state/clarification fields", "ce_intent, ce_intent_classifier, ce_config"),
    ("ResetResolvedIntentStep", "Reset on configured reset intent", "full reset", "ce_config RESET_INTENT_CODES"),
    ("FallbackIntentStateStep", "Fill missing intent/state defaults", "intent/state", "none"),
    ("AddContainerDataStep", "Fetch and attach container data", "containerData/context merge", "ce_container_config"),
    ("PendingActionStep", "Execute/reject pending action task", "pending_action_runtime status/result", "ce_pending_action, CeTaskExecutor, ce_audit"),
    ("ToolOrchestrationStep", "Run tool_group based orchestration", "tool_request/tool_result fields", "ce_tool, ce_mcp_tool, ce_audit"),
    ("McpToolStep", "MCP planner/tool loop", "context_json.mcp.*", "ce_mcp_tool, ce_mcp_db_tool, ce_config"),
    ("SchemaExtractionStep", "Schema-driven extraction and lock handling", "schema facts/context/lock", "ce_output_schema, ce_prompt_template"),
    ("AutoAdvanceStep", "Compute schema status facts", "schemaComplete/hasAny", "resolved schema + context"),
    ("RulesStep", "Match and apply transitions/actions", "intent/state/input params", "ce_rule"),
    ("StateGraphStep", "Validate state transition path", "state_graph_valid/reason", "ce_state_graph, ce_audit"),
    ("ResponseResolutionStep", "Resolve and generate output payload", "payload/last assistant json", "ce_response, ce_prompt_template"),
    ("MemoryStep", "Write memory/session summary", "memory.session_summary in context", "ce_memory, ce_audit"),
    ("PersistConversationStep", "Persist final conversation and result", "finalResult", "ce_conversation"),
    ("PipelineEndGuardStep", "Timing audit + terminal guard", "timings", "ce_audit"),
]

SOURCE_DIR = "/Users/salilvnair/workspace/git/salilvnair/convengine"

def extract_execute_method(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find public StepResult execute(EngineSession session)
    match = re.search(r'public\s+StepResult\s+execute\s*\(\s*EngineSession\s+\w+\s*\)\s*\{', content)
    if not match:
        return "// Execute method not found or signature differs\\n"
    
    start_idx = match.start()
    open_braces = 0
    end_idx = -1
    for i in range(start_idx, len(content)):
        if content[i] == '{':
            open_braces += 1
        elif content[i] == '}':
            open_braces -= 1
            if open_braces == 0:
                end_idx = i + 1
                break
    
    if end_idx != -1:
        # Strip exact leading spaces for formatting
        snippet = content[start_idx:end_idx]
        lines = snippet.split("\\n")
        # remove base indent based on first line inside block
        if len(lines) > 1:
            indent_match = re.match(r'^(\\s+)', lines[1])
            if indent_match:
                indent = indent_match.group(1)
                for j in range(1, len(lines)):
                    if lines[j].startswith(indent):
                        lines[j] = lines[j][len(indent):]
        return "\\n".join(lines).strip()
    return "// Failed to parse method block\\n"

def find_file(step_name):
    for root, dirs, files in os.walk(SOURCE_DIR):
        if f"{step_name}.java" in files:
            return os.path.join(root, f"{step_name}.java")
    return None

import textwrap

md_output = ""
for idx, step_info in enumerate(STEPS):
    step_name = step_info[0]
    responsibility = step_info[1]
    mutations = step_info[2]
    deps = step_info[3]
    
    file_path = find_file(step_name)
    snippet = ""
    relative_path = ""
    if file_path:
        snippet = extract_execute_method(file_path)
        relative_path = file_path.replace(SOURCE_DIR + "/", "")
    else:
        snippet = "// Source file not found in convengine repo"

    md_output += f"""
<div className=\"ce-step-badge-list\" role=\"list\" style={{{{ marginBottom: '1rem' }}}}>
  <div className=\"ce-step-badge-item\">
    <span className=\"ce-step-badge-index\">{idx+1}</span>
    <span className=\"ce-step-badge-label\" style={{{{ fontSize: '1.2rem', fontWeight: 'bold' }}}}>{step_name}</span>
  </div>
</div>

**Responsibility:** {responsibility}  
**Session Mutations:** `{mutations}`  
**Config/Table Dependencies:** `{deps}`  

<details open>
<summary>Detailed Execution Logic</summary>

This step executes dynamically in the pipeline loop. Depending on engine configuration, specific dependencies are inspected to resolve the outcome. 
If conditions require the pipeline to halt early, it generates a `Stop` result. Otherwise, it emits a `Continue` mutation affecting the `EngineSession`.

<CodeBlockToggle title=\"{step_name}.execute()\" language=\"java\" filePath=\"{relative_path}\" defaultOpen={{true}}>
{{`{snippet}`}}
</CodeBlockToggle>
</details>

---
"""

with open("step_details_part.mdx", "w") as f:
    f.write(md_output)

print("Generated step_details_part.mdx")
