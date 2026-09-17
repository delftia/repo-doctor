# 🩺 Repo Doctor

A small, zero-runtime-dependency CLI that checks whether a Git repository is healthy and safe to publish. It scans documentation, Git hygiene, accidentally tracked environment files, common credential patterns, Node.js metadata, dependencies, CI configuration, oversized files and junk files, then produces a repository health score from 0 to 100.

## Features

- README quality check
- LICENSE detection
- `.gitignore` audit
- tracked `.env` detection
- common secret/token scan without printing secret values
- `package.json` metadata and test-script checks
- npm outdated dependency check
- CI/CD detection
- large tracked file detection
- junk/generated tracked file detection
- category and overall health scores
- terminal, summary and JSON output
- CI mode with a configurable minimum score
- security-only mode
- zero runtime npm dependencies

## Installation

Clone the repository, then build it:

```bash
npm install
npm run build
npm link
```

After that, `repo-doctor` is available as a global command. Node.js 18 or newer is required.

You can also run the compiled CLI directly:

```bash
node dist/cli.js .
```

## Usage

Scan the current repository:

```bash
repo-doctor .
```

Scan another repository:

```bash
repo-doctor ../my-project
```

Show only the summary:

```bash
repo-doctor . --summary
```

Run only security checks:

```bash
repo-doctor . --security
```

Machine-readable JSON:

```bash
repo-doctor . --json
```

Use it in CI and fail if the score is below 80:

```bash
repo-doctor . --ci --min-score 80
```

Create a configuration file:

```bash
repo-doctor init .
```

## Configuration

Create `.repo-doctor.json` in the repository root:

```json
{
  "minScore": 75,
  "maxFileSizeMb": 20,
  "ignore": [
    "fixtures/**",
    "dist/**"
  ]
}
```

`minScore` is used by `--ci`. `maxFileSizeMb` defines when a tracked file is reported as large. `ignore` excludes paths from filesystem scanning.

## Example output

```text
🩺 Repo Doctor
Repository: example-project

PASS     README
PASS     License
WARN     .gitignore
CRITICAL Possible OpenAI API key detected src/config.ts

Category scores
  Security        ████████░░  80/100
  Documentation   ██████████ 100/100
  Git hygiene     █████████░  90/100

Overall
  ████████░░ 82/100 Good
```

## Scoring

Findings reduce the score according to severity:

- `critical`: -20
- `error`: -9
- `warning`: -3
- `info`: no score penalty

The score is intentionally simple and understandable. A critical secret finding also causes `--ci` mode to fail regardless of the numerical score.

## Security notes

Repo Doctor does not upload repository contents anywhere. The secret scanner runs locally and reports the file containing a potential credential, but deliberately does not print the credential value. Pattern-based secret detection can produce false positives, so findings should always be reviewed before taking action.

## Development

```bash
npm install
npm run build
npm test
```

Source code lives in `src/`. Each audit is an independent `Check`, making new checks straightforward to add.

## License

MIT
