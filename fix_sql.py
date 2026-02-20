import re
import os

files = [
    "ddl.sql",
    "ddl_postgres.sql",
    "ddl_sqlite.sql",
    "ddl_oracle.sql"
]

base_dir = "/Users/salilvnair/workspace/git/salilvnair/convengine/src/main/resources/sql"

for f in files:
    path = os.path.join(base_dir, f)
    if not os.path.exists(path):
        continue
        
    with open(path, "r") as file:
        content = file.read()
    
    # Simple regex to remove any INSERT INTO ce_config ... VALUES(10, 'SchemaExtractionStep' ... );
    # And 11 as well.
    # The statements look like:
    # INSERT INTO ce_config
    # (config_id, config_type, config_key, config_value, enabled, created_at)
    # VALUES(10, 'SchemaExtractionStep', 'SYSTEM_PROMPT', '...
    
    # We can match `INSERT INTO ce_config[\s\S]*?VALUES\(10,\s*'SchemaExtractionStep'[\s\S]*?\);\n*`
    
    content = re.sub(r'INSERT INTO ce_config[^;]*VALUES\(10,\s*\'SchemaExtractionStep\'[^;]*\);\n*', '', content)
    content = re.sub(r'INSERT INTO ce_config[^;]*VALUES\(11,\s*\'SchemaExtractionStep\'[^;]*\);\n*', '', content)
    
    replacements = {
        "VALUES(12,": "VALUES(10,",
        "VALUES(13,": "VALUES(11,",
        "VALUES(14,": "VALUES(12,",
        "VALUES(15,": "VALUES(13,"
    }
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(path, "w") as file:
        file.write(content)
        
    print(f"Processed {f}")

