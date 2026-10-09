"""Validate packaged documentation/provenance/templates; no sponsor or GitHub calls."""
from pathlib import Path
import hashlib
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
# Event-build dependency/output/runtime directories are not packaged handoff documentation.
GENERATED_DIRS = {'.git', 'node_modules', 'dist', 'runtime', 'test-results', 'playwright-report', '.scopewatch-run'}


def skipped(path):
    return any(part in GENERATED_DIRS for part in path.relative_to(ROOT).parts)


errors = []
markdown_count = 0
for path in ROOT.rglob('*.md'):
    if skipped(path):
        continue
    markdown_count += 1
    text = re.sub(r'```[\s\S]*?```', '', path.read_text())
    for target in re.findall(r'\]\(([^)]+)\)', text):
        if target.startswith('#') or re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', target):
            continue
        local = target.split('#', 1)[0].strip('<>')
        if not (path.parent / local).resolve().exists():
            errors.append(f'missing local link: {path.relative_to(ROOT)} -> {target}')

manifest = json.loads((ROOT / 'provenance/IMPORT_MANIFEST.json').read_text())
destinations = set()
for row in manifest['files']:
    target = ROOT / row['destination']
    if row['destination'] in destinations:
        errors.append('duplicate imported destination: ' + row['destination'])
    destinations.add(row['destination'])
    if not target.is_file():
        errors.append('missing import: ' + row['destination'])
    elif hashlib.sha256(target.read_bytes()).hexdigest() != row['packaged_sha256']:
        errors.append('packaged import hash changed: ' + row['destination'])

json_count = 0
for path in ROOT.rglob('*.json'):
    if skipped(path):
        continue
    if path == ROOT / 'provenance/HANDOFF_VALIDATION.json':
        continue
    try:
        json.loads(path.read_text())
        json_count += 1
    except (ValueError, UnicodeError) as exc:
        errors.append(f'invalid JSON: {path.relative_to(ROOT)}: {type(exc).__name__}')

for path in (ROOT / 'templates').glob('*.json'):
    data = json.loads(path.read_text())
    if data.get('template_only') is not True:
        errors.append('unmarked template: ' + path.name)
operator = json.loads((ROOT / 'templates/operator-manifest.template.json').read_text())
if 'content_sha256' in operator or 'immutable_manifest_ref' in operator:
    errors.append('self-referential manifest provenance; keep hash/ref in external wrapper')
if operator.get('ready_for_use') is not False:
    errors.append('operator template must remain not ready')
case = json.loads((ROOT / 'templates/case-evidence.template.json').read_text())
action = json.loads((ROOT / 'templates/action-receipt.template.json').read_text())
if case.get('action_eligible') is not False or action.get('scope_ready') is not False:
    errors.append('case/action templates must remain ineligible')

diagrams = list((ROOT / 'docs/architecture/diagrams').glob('*.mmd'))
if len(diagrams) != 7:
    errors.append('expected seven diagram sources')
for source in diagrams:
    for extension in ['.svg', '.png']:
        if not (ROOT / 'docs/architecture/rendered' / (source.stem + extension)).is_file():
            errors.append('missing diagram export: ' + source.stem + extension)
viewer = (ROOT / 'docs/architecture/architecture.html').read_text()
if '<script src=' in viewer or 'https://cdn' in viewer:
    errors.append('offline viewer has external script dependency')
if viewer.count('data-tab=') != 7 or viewer.count('class="panel"') != 7:
    errors.append('offline viewer does not expose seven tabs/panels')

# High-confidence secret shapes only; report locations/types, never matched values.
patterns = {
    'GitHub token': r'\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{30,})\b',
    'Anthropic secret': r'\bsk-ant-[A-Za-z0-9_-]{25,}\b',
    'OpenAI secret': r'\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{40,}\b',
    'Firecrawl secret': r'\bfc-[a-fA-F0-9]{32}\b',
    'AWS key': r'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b',
    'private key': r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----\s+(?:[A-Za-z0-9+/]{40,}=?=?\s+){2,}',
}
for path in ROOT.rglob('*'):
    if not path.is_file() or any(p in ('.git', 'node_modules', 'dist') for p in path.relative_to(ROOT).parts) or path.suffix in ['.png', '.jpg', '.jpeg']:
        continue
    try:
        text = path.read_text()
    except UnicodeError:
        continue
    for kind, pattern in patterns.items():
        match = re.search(pattern, text)
        if match:
            line = text[:match.start()].count('\n') + 1
            errors.append(f'potential {kind}: {path.relative_to(ROOT)}:{line}')
if list(ROOT.glob('.env')):
    errors.append('actual .env exists in handoff root')

report = {'validation_kind': 'handoff_documentation_only', 'markdown_files': markdown_count,
          'json_files': json_count, 'imported_artifacts': len(destinations), 'diagram_sources': len(diagrams),
          'diagram_exports': len(diagrams) * 2, 'sponsor_calls': False, 'application_tests': False,
          'errors': errors, 'passed': not errors}
print(json.dumps(report, indent=2))
sys.exit(bool(errors))
