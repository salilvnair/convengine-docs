import React from "react";
import { CePopup } from "./CePopup";

export const CANONICAL_PIPELINE_STEPS = [
  {
    name: "LoadOrCreateConversationStep",
    description: "Loads existing conversation row if present, otherwise initializes a new runtime conversation shell.",
  },
  {
    name: "ResetConversationStep",
    description: "Checks reset/restart controls and clears intent/state/context when reset is requested.",
  },
  {
    name: "PersistConversationBootstrapStep",
    description: "Ensures conversation bootstrap state is persisted early so downstream steps run with a durable row.",
  },
  {
    name: "AuditUserInputStep",
    description: "Writes audit entry for raw user input with current session metadata.",
  },
  {
    name: "PolicyEnforcementStep",
    description: "Applies policy checks and can short-circuit with guarded/safe response before intent logic.",
  },
  {
    name: "IntentResolutionStep",
    description: "Resolves intent via classifier + agent scoring + collision handling and updates session intent/state.",
  },
  {
    name: "ResetResolvedIntentStep",
    description: "Applies post-resolution reset command config so consumer-defined reset intent can wipe active session state.",
  },
  {
    name: "FallbackIntentStateStep",
    description: "Assigns fallback intent/state when no stable intent is available for deterministic downstream execution.",
  },
  {
    name: "AddContainerDataStep",
    description: "Injects configured container/context data into session before tools, schema, rules, and response steps.",
  },
  {
    name: "McpToolStep",
    description: "Runs MCP planner/tool loop for tool-assisted intents and merges tool outputs into session context.",
  },
  {
    name: "SchemaExtractionStep",
    description: "Extracts structured schema JSON for current intent/state and stores extracted values in session context.",
  },
  {
    name: "AutoAdvanceStep",
    description: "Advances state automatically when required schema/task conditions are satisfied.",
  },
  {
    name: "RulesStep",
    description: "Evaluates configured rules and executes rule actions (set state/intent/json/task/context).",
  },
  {
    name: "ResponseResolutionStep",
    description: "Builds final response payload via EXACT/DERIVED flow and output format factories.",
  },
  {
    name: "PersistConversationStep",
    description: "Persists final intent/state/context and assistant output back to conversation storage.",
  },
  {
    name: "PipelineEndGuardStep",
    description: "Final guard stage that emits terminal pipeline timing/audit envelope before returning result.",
  },
];

export function PipelineStepList({
  steps = CANONICAL_PIPELINE_STEPS,
  ariaLabel = "Pipeline steps",
  className = "",
}) {
  return (
    <div
      className={`ce-step-badge-list ce-step-badge-list-vertical ${className}`.trim()}
      role="list"
      aria-label={ariaLabel}
    >
      {steps.map((step, index) => (
        <CePopup key={step.name} title={`${index + 1}. ${step.name}`} description={step.description}>
          <div className="ce-step-badge-item">
            <span className="ce-step-badge-index">{index + 1}</span>
            <span className="ce-step-badge-label">{step.name}</span>
          </div>
        </CePopup>
      ))}
    </div>
  );
}
