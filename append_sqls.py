import os

postgres_sql = """
INSERT INTO ce_config
(config_id, config_type, config_key, config_value, enabled, created_at)
VALUES(13, 'DialogueActStep', 'SYSTEM_PROMPT', 'You are a dialogue-act classifier.
Return JSON only with:
{"dialogueAct":"AFFIRM|NEGATE|EDIT|RESET|QUESTION|NEW_REQUEST","confidence":0.0}', true, '2026-02-20 10:15:54.230');

INSERT INTO ce_config
(config_id, config_type, config_key, config_value, enabled, created_at)
VALUES(14, 'DialogueActStep', 'USER_PROMPT', 'User text:
%s', true, '2026-02-20 10:15:54.230');

INSERT INTO ce_config
(config_id, config_type, config_key, config_value, enabled, created_at)
VALUES(15, 'DialogueActStep', 'SCHEMA_PROMPT', '{
  "type":"object",
  "required":["dialogueAct","confidence"],
  "properties":{
    "dialogueAct":{"type":"string","enum":["AFFIRM","NEGATE","EDIT","RESET","QUESTION","NEW_REQUEST"]},
    "confidence":{"type":"number"}
  },
  "additionalProperties":false
}', true, '2026-02-20 10:15:54.230');
"""

sqlite_oracle_sql = """
INSERT INTO ce_config
(config_id, config_type, config_key, config_value, enabled)
VALUES(13, 'DialogueActStep', 'SYSTEM_PROMPT', 'You are a dialogue-act classifier.
Return JSON only with:
{"dialogueAct":"AFFIRM|NEGATE|EDIT|RESET|QUESTION|NEW_REQUEST","confidence":0.0}', 1);

INSERT INTO ce_config
(config_id, config_type, config_key, config_value, enabled)
VALUES(14, 'DialogueActStep', 'USER_PROMPT', 'User text:
%s', 1);

INSERT INTO ce_config
(config_id, config_type, config_key, config_value, enabled)
VALUES(15, 'DialogueActStep', 'SCHEMA_PROMPT', '{
  "type":"object",
  "required":["dialogueAct","confidence"],
  "properties":{
    "dialogueAct":{"type":"string","enum":["AFFIRM","NEGATE","EDIT","RESET","QUESTION","NEW_REQUEST"]},
    "confidence":{"type":"number"}
  },
  "additionalProperties":false
}', 1);
"""

files_to_update = {
    "src/main/resources/sql/ddl.sql": postgres_sql,
    "src/main/resources/sql/ddl_postgres.sql": postgres_sql,
    "src/main/resources/sql/ddl_sqlite.sql": sqlite_oracle_sql,
    "src/main/resources/sql/ddl_oracle.sql": sqlite_oracle_sql
}

base_dir = "/Users/salilvnair/workspace/git/salilvnair/convengine"

for rel_path, append_content in files_to_update.items():
    full_path = os.path.join(base_dir, rel_path)
    if os.path.exists(full_path):
        with open(full_path, "a") as f:
            f.write("\n" + append_content.strip() + "\n")
        print(f"Appended SQL to {rel_path}")
    else:
        print(f"Skipped {rel_path} (does not exist)")

