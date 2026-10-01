
import re

file_path = r"d:\laragon\www\gunas-herbal-products\lib\api.ts"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Regex for exports
export_pattern = re.compile(r"^export\s+(?:async\s+)?(function|const|let|var|class|interface|type|enum)\s+([a-zA-Z0-9_]+)", re.MULTILINE)
export_brace_pattern = re.compile(r"^export\s*\{([^}]+)\}", re.MULTILINE)
export_default_pattern = re.compile(r"^export\s+default", re.MULTILINE)

matches = export_pattern.findall(content)
print("Named Exports:")
for type_, name in matches:
    print(f"- {type_} {name}")

brace_matches = export_brace_pattern.findall(content)
print("\nBrace Exports:")
for m in brace_matches:
    print(f"- {m.strip()}")

default_matches = export_default_pattern.findall(content)
print("\nDefault Exports:", len(default_matches))
