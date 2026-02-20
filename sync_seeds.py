import re

with open('/Users/salilvnair/workspace/git/salilvnair/convengine/src/main/resources/sql/seed.sql', 'r') as f:
    content = f.read()

# Remove the created_at column declaration
content = content.replace("enabled, created_at", "enabled")

# Replace the true boolean and the timestamp with the integer 1 for the enabled column
content = re.sub(r",\s*true,\s*'[^']+'\)", ", 1)", content)

with open('/Users/salilvnair/workspace/git/salilvnair/convengine/src/main/resources/sql/seed_sqlite.sql', 'w') as f:
    f.write(content.strip() + "\n")

with open('/Users/salilvnair/workspace/git/salilvnair/convengine/src/main/resources/sql/seed_oracle.sql', 'w') as f:
    f.write(content.strip() + "\n")

print("Synced seeds successfully.")
