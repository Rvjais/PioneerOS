import re
from collections import defaultdict

with open('/tmp/app_errors.log') as f:
    text = f.read()

# Match something like:
# src/app/api/finance/calendar/route.ts:121:7 - error TS2322: Type 'Date' is not assignable to type 'string'.
pattern = re.compile(r'([a-zA-Z0-9_\-\./]+)\(\d+,\d+\): error TS\d+: (.*?)(?=^[a-zA-Z0-9_\-\./]+\(\d+,\d+\):|\Z)', re.MULTILINE | re.DOTALL)
matches = pattern.findall(text)

files = defaultdict(list)
for path, error in matches:
    files[path].append(error.strip())

for path, errors in files.items():
    print(f"{path}: {len(errors)} errors")
    for e in errors[:2]: # preview first 2 errors
        print("  -", e.split('\n')[0][:100])
    if len(errors) > 2:
        print("  - ...")

