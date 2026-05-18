---
title: "Fix Talk2MyData upload and chat, add multi-format (CSV/Excel/JSON/Parquet) ingestion"
type: fix+feat
date: 2026-05-14
status: ready
stack: Next.js 15, FastAPI, BigQuery, Gemini, Google Cloud Run
related_docs:
  - docs/plans/2026-02-21-feat-talk2mydata-chatbot-platform-plan.md
  - docs/solutions/implementation-guides/talk2mydata-ai-chatbot-platform.md
production_urls:
  frontend: https://talk2mydata-frontend-383411835156.us-central1.run.app
  backend: https://talk2mydata-backend-383411835156.us-central1.run.app
---

# Fix Talk2MyData upload and chat + multi-format file ingestion

## Enhancement Summary

**Deepened on:** 2026-05-14
**Reviewers run in parallel:** kieran-python, kieran-typescript, security-sentinel, architecture-strategist, code-simplicity-reviewer, pattern-recognition-specialist, best-practices-researcher

### Key resolved decisions

1. **Registration location:** single canonical import in `app/connectors/__init__.py` + a `lifespan()` assertion that the expected adapter keys are present (research-backed pattern). Deletes both `main.py:57` (current local diff) and the dead-weight import in `adapters/__init__.py`. Failure mode moves from "silent until first request" to "boot fails with explicit list of missing connectors".
2. **Error handling:** translate vendor exceptions (`gspread.exceptions.APIError`, `openpyxl` errors, `pandas.errors.ParserError`) into `Talk2MyDataError` subclasses **inside each adapter**. Router and service layers stop catching vendor exceptions. The centralized `Talk2MyDataError` handler in `main.py:82-88` already exists - extend `ERROR_STATUS_CODES`, delete the duplicate try/except blocks in routers.
3. **Body limit:** cap at 10MB, not unbounded. `--limit-request-body 10485760` in `Dockerfile`. Files larger than 10MB get rejected before they wedge a Cloud Run worker.
4. **gspread leakage (HIGH security):** never `str(exception)` to the client - the raw text contains GCP project number, internal API URLs, and SA internals. Whitelist exception classes and map to fixed user-facing strings; log raw text server-side.
5. **Allowlist removal (HIGH security):** do not ship Phase 4 (allowlist removal) without first confirming the GCP OAuth consent screen is in `Internal` org-mode or adding a domain-suffix gate. Otherwise anyone with a Google account gets a provisioned BQ dataset.
6. **Multi-format upload (NEW SCOPE):** extend the connector pattern to accept CSV, Excel (.xlsx), JSON/NDJSON, and Parquet via a new `POST /api/v1/connectors/upload` multipart endpoint. Reuses the existing schema inference pipeline.

### Scope note

This plan now covers two coupled efforts, intentionally bundled because both land on the same connector registry:

- **Fix (P0):** unblock production - registry registration, body limit, error clarity.
- **Feature (P1-P2):** add four file-format adapters (CSV, Excel, JSON, Parquet) + multipart upload endpoint + file-picker UX.

Phase 1 still ships independently and first as a same-day hotfix. Phases 2-4 ship as follow-up PRs on top of the same foundation.

---

## Overview

Production Talk2MyData has Google login working but every backend-dependent flow (connect a sheet, ask a question) fails because the hexagonal connector registry is empty at runtime - the `@ConnectorRegistry.register("google_sheets")` decorator never executes since nothing imports the adapter package at startup. The misleading "Failed to access spreadsheet" error masks the real exception and slows triage to a crawl.

Beyond the hotfix, the same architecture is the natural home for CSV / Excel / JSON / Parquet ingestion: a fifth adapter doesn't change the design, it just adds modules. We're fixing the registration mechanism *once* before adding the next four adapters, because shipping the same bug five times is not a plan.

## Problem Statement

### Symptoms verified via /qa-only against production

| # | Symptom | Where observed |
|---|---------|----------------|
| S1 | Google sign-in succeeds, user lands on /dashboard | works as designed |
| S2 | "Connect Data Source" dialog spins, then "Failed to access spreadsheet. Please check the URL and try again." | `POST /api/v1/connectors/discover` returns HTTP 400 with opaque body |
| S3 | Dashboard shows "No datasets yet" | `GET /api/v1/datasets` returns `{datasets: []}` |
| S4 | If a dataset existed, chat would still not stream an `answer` event | `POST /api/v1/query/ask` SSE blocked by missing dataset |

Infrastructure layer is healthy: `/health` returns 200, CORS preflight returns the correct origin, `NEXT_PUBLIC_API_URL` is correctly baked into the JS bundle, the auth middleware accepts valid Google ID tokens. The bug is application-level.

## Root Cause Analysis

### P0 - Connector registry is empty at runtime

The hexagonal connector pattern relies on a side-effect import to populate `ConnectorRegistry._connectors`:

```
backend/app/connectors/
├── __init__.py                 # EMPTY
├── registry.py                 # _connectors: dict[str, type[DataConnector]] = {}
├── router.py                   # uses ConnectorRegistry.get_connector(config)
├── service.py                  # uses ConnectorRegistry.get_connector(config)
└── adapters/
    ├── __init__.py             # imports google_sheets - but only if something imports adapters/
    └── google_sheets.py        # @ConnectorRegistry.register("google_sheets") class GoogleSheetsConnector
```

`backend/app/main.py` only imports `app.connectors.router`. The router imports `service` and `registry`, never `adapters/`. The adapter's inline imports inside `if not test_connection():` blocks are gated *behind* the registry lookup that fails first. Result: first call to `/connectors/discover` raises `ValueError("Unknown connector: google_sheets. Available: []")`, the router's catch-all returns HTTP 400 "Failed to access spreadsheet...", chat downstream has no datasets to query.

### P1 - Catch-all exception handler masks every failure mode

`backend/app/connectors/router.py:89-91` returns the same generic message for: registry miss, bad URL, permission error, API quota, schema parse error, and anything else. A user who shared their sheet with the wrong email sees the same UI as a user hitting the registry bug. Pattern-recognition review flagged that this duplicates the centralized exception mapping already present in `backend/app/main.py:72-88` (the `ERROR_STATUS_CODES` dict + `Talk2MyDataError` handler). Two parallel patterns for one concern.

### P1 - Gunicorn `--limit-request-body 1048576` rejects multi-tab sheet metadata

`backend/Dockerfile:8` had a 1MB cap. The local diff removes it entirely - **security review flagged that unbounded is wrong direction.** Cap should drop to **10MB** (`--limit-request-body 10485760`) so a few concurrent large POSTs can't wedge a Cloud Run worker.

### P2 - Tailwind v4 + shadcn theming wiring (uncommitted local diff)

`frontend/app/globals.css` adds an `@theme inline` block; `frontend/package.json` adds `@tailwindcss/postcss`. This is correct for shadcn-on-Tailwind-v4. Two corrections per framework-docs research:
- `@layer base { * { border-color: hsl(var(--border)); } }` should be `border-color: var(--color-border)` to reference the *theme token*, not the raw CSS var (lets `border-border` utility resolve cleanly).
- Verify `postcss.config.*` contains only `@tailwindcss/postcss` (no `autoprefixer`, no `postcss-import`, no v3 `tailwindcss` plugin form). Drop any leftover `tailwind.config.*` file - v4 reads config from CSS.

### P2 - Email allowlist quietly 403s non-listed testers

`backend/env.yaml:6` lists two emails. Other testers get HTTP 403 from `AuthMiddleware`, but the frontend's `try { catch {} }` on `/auth/verify` swallows the failure (`frontend/app/(auth)/login/page.tsx:28-32`), so it looks like a successful login that immediately breaks. If a teammate is reporting "upload and chat broken" and isn't in the allowlist, EVERY protected endpoint is failing for them - not just upload.

### P2 - Login page silently swallows auth/verify

The `catch {}` (no parameter, no log, no state) means the user has no signal when the backend rejects them. Combined with the allowlist gate, a 403 here looks identical to success until the next API call fails. Fix surfaces the error visibly.

### P3 (deferred) - ID tokens in localStorage / hand-rolled SSE reader / CSP report-only

- localStorage tokens are XSS-exposed and prevent Next.js middleware/Server Components from reading auth. Move to httpOnly cookie via Route Handler - track as separate follow-up.
- The chat SSE reader at `frontend/app/(app)/chat/[datasetId]/page.tsx:60-111` reinvents buffering, abort handling, and error surfacing. `@ai-sdk/react@^2` and `ai@^5` are already in deps. Switch to `useChat` with custom `DataUIPart` events - separate refactor.
- `Framing 'accounts.google.com' violates frame-ancestors 'self'` (report-only) is harmless GSI noise. Existing `x-frame-options: DENY` handles real clickjacking risk.

## Proposed Solution

Four phases. Phase 1 alone unblocks production for allow-listed users. Phases 2-4 are sequenced follow-ups; bundling them into one mega-PR was rejected by the architecture reviewer in favor of clean revertable diffs.

### Phase 1 - Hotfix (P0 + P1): registry + body limit + error clarity

**Files touched (backend only):**

- `backend/app/connectors/__init__.py` - replace empty file with:
  ```python
  # Side-effect import: triggers @ConnectorRegistry.register decorators.
  # Listed here so any code that touches app.connectors picks them up,
  # and so the startup assertion in main.lifespan() catches missing adapters at boot.
  from app.connectors.adapters import google_sheets  # noqa: F401
  ```
- `backend/app/main.py` - **delete the local diff at line 57** (the redundant `from app.connectors.adapters import google_sheets as _gs`). Add a startup assertion in `lifespan()`:
  ```python
  from app.connectors.registry import ConnectorRegistry
  EXPECTED_CONNECTORS = {"google_sheets"}  # Phase 3 adds csv/excel/json/parquet
  missing = EXPECTED_CONNECTORS - ConnectorRegistry._connectors.keys()
  if missing:
      raise RuntimeError(f"Connector registry missing at boot: {sorted(missing)}")
  ```
- `backend/app/connectors/adapters/__init__.py` - **delete** the redundant `from app.connectors.adapters.google_sheets import GoogleSheetsConnector` line (no longer needed; `connectors/__init__.py` is the single source of truth).
- `backend/app/connectors/registry.py` - drop `from typing import Type`; switch to `dict[str, type[DataConnector]]`. Add a `get_connector` runtime guard that raises a clearer error if `_connectors` is empty (so this class of bug is *impossible* to ship silently again).
- `backend/Dockerfile:8` - re-add the body limit at 10MB: `--limit-request-body 10485760`.
- `backend/app/common/exceptions.py` - add `SpreadsheetAccessError(ConnectorError)`, `SpreadsheetNotFoundError(ConnectorError)`, `SpreadsheetQuotaError(ConnectorError)`. Extend `ERROR_STATUS_CODES` in `main.py:72`:
  ```python
  ERROR_STATUS_CODES = {
      "connector_error": 400,
      "spreadsheet_not_found": 404,
      "spreadsheet_access_denied": 403,
      "spreadsheet_quota_exceeded": 429,
      # ... existing entries
  }
  ```
- `backend/app/connectors/adapters/google_sheets.py` - in `test_connection()` and `_get_spreadsheet()`, catch `gspread.exceptions.APIError` / `SpreadsheetNotFound` and raise the new domain errors with **fixed user-safe messages** (never `str(api_error)`). Log raw text server-side via `logger.exception`.
- `backend/app/connectors/router.py:34-42, 56-91` - **delete the try/except blocks**. Let domain exceptions bubble to the centralized handler. Move the inline `from app.connectors.adapters.google_sheets import get_service_account_email` to module-level (now safe because `connectors/__init__.py` triggers registration).
- `backend/app/connectors/service.py:32-43` - same: remove the try/except, lift the inline import.

**Net change vs the catch-all approach:** ~15 lines deleted from routers, ~10 lines added to the adapter, registry bug becomes a boot-time RuntimeError instead of a first-request 400, error messages are user-safe and per-cause.

### Phase 2 - Frontend hygiene: Tailwind v4 + typed ApiError + visible auth errors

**Files touched (frontend only):**

- `frontend/app/globals.css` - keep the local `@theme inline` block, but change `border-color: hsl(var(--border))` to `border-color: var(--color-border)` (references the theme token).
- `frontend/package.json` - keep the `@tailwindcss/postcss` addition.
- `frontend/postcss.config.*` - verify it contains only `{plugins: {"@tailwindcss/postcss": {}}}`. Remove any `autoprefixer`, `postcss-import`, or v3 form.
- `frontend/tailwind.config.*` - delete if present (v4 doesn't use it).
- `frontend/lib/api-client.ts` - introduce a typed `ApiError`:
  ```typescript
  export class ApiError extends Error {
    constructor(public status: number, message: string) { super(message); }
  }
  // in request(): throw new ApiError(response.status, detail || message || "Request failed")
  ```
- `frontend/app/(auth)/login/page.tsx` - replace the silent `catch {}` with the full fix:
  ```typescript
  const [loginError, setLoginError] = useState<string | null>(null);
  // ...
  try {
    await apiClient.post("/api/v1/auth/verify");
  } catch (err) {
    console.error("auth verify failed", err);
    clearAuth();  // imported from "@/lib/auth"
    if (err instanceof ApiError && err.status === 403) {
      setLoginError("Your account isn't on the access list yet. Contact your admin.");
    } else {
      setLoginError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    }
    return;  // do NOT push to /dashboard
  }
  ```
  Add the JSX:
  ```tsx
  {loginError && (
    <p role="alert" className="text-sm text-destructive mt-3 text-center">{loginError}</p>
  )}
  ```
- `frontend/app/(app)/chat/[datasetId]/page.tsx:11` - delete the duplicate `API_URL` constant; import from `@/lib/api-client` (single source of truth).

### Phase 3 - Multi-format file ingestion (CSV / Excel / JSON / Parquet)

This is the NEW SCOPE. The hexagonal pattern already supports it - we add adapter modules, a transport for multipart uploads, and frontend UX for file selection.

#### Backend additions

**New transport: `POST /api/v1/connectors/upload`**

```
Content-Type: multipart/form-data
Form fields:
  name        (string, required)            - display name for the dataset
  file        (binary, required)            - the uploaded file
  connector_type  (string, optional)        - csv | excel | json | parquet (auto-detect from extension if omitted)
  options     (JSON string, optional)       - delimiter override, sheet name for Excel, etc.
```

Backend implementation outline (`backend/app/connectors/router.py`):

```python
@router.post("/upload", response_model=ConnectResponse)
async def upload_file(
    request: Request,
    name: str = Form(..., max_length=200),
    file: UploadFile = File(..., max_size=10_485_760),  # 10MB at FastAPI boundary
    connector_type: str | None = Form(None),
    options: str | None = Form(None),
    service: ConnectorService = Depends(get_connector_service),
):
    user_id = request.state.user_id
    detected_type = connector_type or _detect_from_filename(file.filename)
    if detected_type not in {"csv", "excel", "json", "parquet"}:
        raise UnsupportedFileTypeError(file.filename)

    # Stream to /tmp (Cloud Run ephemeral, fine for ingestion-then-discard)
    tmp_path = await _stream_to_tmp(file, suffix=Path(file.filename).suffix)
    try:
        config = ConnectorConfig(
            name=name,
            connector_type=detected_type,
            credentials={},
            settings={"file_path": str(tmp_path), "options": json.loads(options or "{}")},
        )
        results = await service.connect_and_ingest(user_id, config, selected_sheets=None)
        return ConnectResponse(datasets=results, status="success")
    finally:
        tmp_path.unlink(missing_ok=True)
```

**New adapters** (`backend/app/connectors/adapters/`):

| File | Connector key | Implementation notes |
|------|--------------|----------------------|
| `csv.py` | `"csv"` | `pandas.read_csv(path)` with delimiter sniffing (csv.Sniffer) + encoding detection (chardet, but bounded - try utf-8, utf-8-sig, latin-1 in order). Single dataset per file. |
| `excel.py` | `"excel"` | `openpyxl` engine (drop `xlrd`, .xls is EOL). One worksheet = one dataset; user selects via `selected_sheets` like the existing GoogleSheets flow. |
| `json.py` | `"json"` | `pandas.read_json` with auto-detect of records vs NDJSON. Reject deeply nested structures (depth > 2) with a clear error - this is a tabular tool. |
| `parquet.py` | `"parquet"` | `pandas.read_parquet` via `pyarrow`. Pre-flight `pyarrow.parquet.read_metadata` to bounce huge files before loading. |

Each adapter follows the same shape:

```python
@ConnectorRegistry.register("csv")
class CsvConnector(DataConnector):
    def __init__(self, config: ConnectorConfig):
        self.config = config
        self.path = Path(config.settings["file_path"])

    async def test_connection(self) -> bool:
        return self.path.exists() and self.path.stat().st_size > 0

    async def discover_datasets(self) -> list[DatasetInfo]:
        # Read just the header + first 100 rows for preview
        ...

    async def extract_data(self, dataset_id: str) -> AsyncIterator[pd.DataFrame]:
        # Chunked read via pandas.read_csv(chunksize=10_000)
        ...

    async def get_schema(self, dataset_id: str) -> list[dict]: ...
```

Each adapter translates its native exceptions (`pandas.errors.ParserError`, `openpyxl.utils.exceptions.InvalidFileException`, `pyarrow.lib.ArrowInvalid`) into `Talk2MyDataError` subclasses (`FileParseError`, `FileFormatError`) - **never** propagates raw library exceptions to the client.

**Shared utilities** (`backend/app/connectors/adapters/_file_utils.py`):

```python
EXTENSION_MAP = {".csv": "csv", ".tsv": "csv", ".xlsx": "excel", ".xls": "excel",
                 ".json": "json", ".ndjson": "json", ".parquet": "parquet"}

def detect_from_filename(filename: str) -> str | None: ...
async def stream_to_tmp(upload: UploadFile, suffix: str) -> Path: ...
```

**Lifespan assertion updated:**
```python
EXPECTED_CONNECTORS = {"google_sheets", "csv", "excel", "json", "parquet"}
```

**Dependencies** (`backend/requirements.txt`):

- `openpyxl>=3.1.0` - already a transitive of `pandas[excel]` but pin it
- `pyarrow>=15.0.0` - for parquet; large dependency (~40MB), confirm Cloud Run cold-start is still acceptable
- `chardet>=5.0.0` - encoding detection for CSV

#### Frontend additions

**Connector dialog redesign** (`frontend/components/connectors/connect-dialog.tsx`):

Segmented control at the top of the dialog: `[ URL ]   [ File Upload ]`

```
URL mode (existing): Google Sheets URL input → /api/v1/connectors/discover → /api/v1/connectors/connect

File mode (new): drag-and-drop + file picker → /api/v1/connectors/upload
  - Accepted: .csv .tsv .xlsx .xls .json .ndjson .parquet
  - Client-side validation: size ≤ 10MB, extension in whitelist
  - Progress indicator during upload (XHR-based for progress events; fetch + ReadableStream is fine if we don't need progress)
  - Multi-sheet preview for Excel (call /discover after upload to list worksheets, then /connect with selected_sheets)
```

**File mode flow** (pseudocode):

```tsx
const handleFileSelect = async (file: File) => {
  if (file.size > 10 * 1024 * 1024) { setError("File too large (max 10MB)"); return; }
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) { setError(`Unsupported file type: .${ext}`); return; }

  const fd = new FormData();
  fd.append("name", file.name);
  fd.append("file", file);

  setStep("loading");
  try {
    const res = await fetch(`${API_URL}/api/v1/connectors/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: fd,
    });
    if (!res.ok) throw new ApiError(res.status, (await res.json()).message);
    onSuccess();
    handleClose();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Upload failed");
    setStep("file");
  }
};
```

**ALLOWED_EXTENSIONS** shared between frontend and backend - defined once in `frontend/lib/file-types.ts` as a constant, mirrored in `backend/app/connectors/adapters/_file_utils.py:EXTENSION_MAP`.

#### Acceptance criteria for Phase 3

- [ ] CSV upload (≤10MB, UTF-8 or Latin-1 encoded, comma/tab/semicolon delimited): creates a BQ table, dataset card appears, chat answers "How many rows?" correctly
- [ ] Excel upload (.xlsx with 2 worksheets): user is prompted to select sheets, both create separate datasets, both queryable via chat
- [ ] JSON upload (records-of-objects format): creates one BQ table; deeply nested objects rejected with clear "JSON must be flat tabular data" error
- [ ] NDJSON upload (one record per line): same as JSON
- [ ] Parquet upload: native types preserved (INT64, FLOAT64, TIMESTAMP, BOOL)
- [ ] File >10MB: rejected client-side with size error before any network request fires; if bypassed, rejected at FastAPI boundary with 413
- [ ] Unsupported extension (e.g. `.docx`): rejected with `UnsupportedFileTypeError` (specific message, not generic "Failed")
- [ ] Malformed CSV (mismatched quoting): adapter raises `FileParseError`, user sees "Could not parse CSV at row X: ..." (specific cause, no raw pandas traceback)
- [ ] Boot assertion fires if any of {google_sheets, csv, excel, json, parquet} fails to register - service refuses to start, log shows missing keys

### Phase 4 - Policy and security hardening (deferred to follow-up PRs)

These are intentionally **not** bundled with the hotfix or the multi-format feature. They are tracked here so they don't get forgotten:

1. **Allowlist decision** (config only, no code change): for now, add the requesting user's email to `backend/env.yaml:ALLOWED_EMAILS` and redeploy. If/when removing the allowlist entirely, first verify the GCP OAuth consent screen is `Internal` org-mode OR add a domain-suffix gate in `auth.py` (security review HIGH).
2. **httpOnly cookie for auth token** (frontend + backend): move the Google ID token out of `localStorage` and into a cookie set by a Next.js Route Handler that proxies to FastAPI. Enables `middleware.ts` route-level auth gating and removes the XSS exfiltration risk (security review MEDIUM).
3. **AI SDK `useChat` migration** (frontend): replace the hand-rolled SSE reader with `useChat` + custom `DataUIPart` events. Removes the abort/release-lock bugs in the current reader.
4. **Typed `ConnectorConfig`** (backend): replace `credentials: dict, settings: dict` with per-adapter Pydantic configs. Improves type safety and self-documents the contract for each adapter.

## File-Level Punch List

| Phase | Priority | File | Change |
|-------|----------|------|--------|
| 1 | P0 | `backend/app/connectors/__init__.py` | Add side-effect import for all adapters |
| 1 | P0 | `backend/app/connectors/adapters/__init__.py` | **Delete** redundant import line |
| 1 | P0 | `backend/app/main.py` | Delete the line-57 local diff; add startup assertion in `lifespan()` |
| 1 | P0 | `backend/Dockerfile:8` | Cap body at 10MB (`--limit-request-body 10485760`), not unbounded |
| 1 | P0 | `backend/app/common/exceptions.py` | Add `SpreadsheetAccessError`, `SpreadsheetNotFoundError`, `SpreadsheetQuotaError` |
| 1 | P0 | `backend/app/connectors/adapters/google_sheets.py` | Translate gspread errors to domain errors with fixed user-safe strings |
| 1 | P0 | `backend/app/connectors/router.py:34-91` | Delete try/except blocks; lift inline imports to module level |
| 1 | P0 | `backend/app/connectors/service.py:32-43` | Same: delete try/except, lift import |
| 1 | P0 | `backend/app/connectors/registry.py` | Drop `typing.Type`, use `type[]`; add empty-registry guard in `get_connector` |
| 1 | P1 | `backend/env.yaml:6` | Add requesting user's email(s) to `ALLOWED_EMAILS` |
| 2 | P1 | `frontend/lib/api-client.ts` | Introduce `ApiError extends Error` with `status: number` |
| 2 | P1 | `frontend/app/(auth)/login/page.tsx` | Add `loginError` state, `clearAuth` import, JSX `role="alert"`, 403-specific message |
| 2 | P1 | `frontend/app/globals.css` | Fix `border-color: var(--color-border)` (token, not raw var) |
| 2 | P2 | `frontend/postcss.config.*` | Verify only `@tailwindcss/postcss`; remove autoprefixer/postcss-import |
| 2 | P2 | `frontend/tailwind.config.*` | Delete if present (v4 doesn't use it) |
| 2 | P2 | `frontend/app/(app)/chat/[datasetId]/page.tsx:11` | Remove duplicate `API_URL`; import from `@/lib/api-client` |
| 3 | P1 | `backend/app/connectors/adapters/_file_utils.py` | NEW: `EXTENSION_MAP`, `detect_from_filename`, `stream_to_tmp` |
| 3 | P1 | `backend/app/connectors/adapters/csv.py` | NEW: `@register("csv") class CsvConnector(DataConnector)` |
| 3 | P1 | `backend/app/connectors/adapters/excel.py` | NEW: `@register("excel") class ExcelConnector(DataConnector)` |
| 3 | P1 | `backend/app/connectors/adapters/json.py` | NEW: `@register("json") class JsonConnector(DataConnector)` |
| 3 | P1 | `backend/app/connectors/adapters/parquet.py` | NEW: `@register("parquet") class ParquetConnector(DataConnector)` |
| 3 | P1 | `backend/app/connectors/__init__.py` | Add imports for csv/excel/json/parquet |
| 3 | P1 | `backend/app/main.py` | Update `EXPECTED_CONNECTORS` set |
| 3 | P1 | `backend/app/connectors/router.py` | Add `POST /upload` multipart endpoint |
| 3 | P1 | `backend/requirements.txt` | Pin `openpyxl`, `pyarrow`, `chardet` |
| 3 | P1 | `backend/app/common/exceptions.py` | Add `UnsupportedFileTypeError`, `FileParseError`, `FileFormatError` |
| 3 | P1 | `frontend/lib/file-types.ts` | NEW: `ALLOWED_EXTENSIONS` constant, accept-attribute helper |
| 3 | P1 | `frontend/components/connectors/connect-dialog.tsx` | Add segmented control + file picker + drag-and-drop + upload flow |
| 4 | P2 | `backend/env.yaml` | Allowlist policy decision (config only) |
| 4 | P3 | `frontend/lib/auth.ts`, `frontend/app/api/auth/route.ts` (new), `frontend/middleware.ts` (new) | Move token to httpOnly cookie |
| 4 | P3 | `frontend/app/(app)/chat/[datasetId]/page.tsx` | Migrate SSE reader to `@ai-sdk/react` `useChat` with custom `DataUIPart` |
| 4 | P3 | `backend/app/connectors/ports.py:9-13` | Typed per-adapter Pydantic configs |

## Acceptance Criteria (consolidated)

### Phase 1 - hotfix
- [ ] Service refuses to start if any expected connector key is missing (boot RuntimeError)
- [ ] `GET /api/v1/datasets` with valid token returns 200 (not 401/403/500) for an allow-listed user
- [ ] Google Sheets connect happy path works end-to-end: paste URL → discover sheets → import → dataset card appears with status=ready
- [ ] Sharing error returns the user-safe `"Cannot access this spreadsheet. Please share it with: <SA email>"` message - no raw gspread text in body
- [ ] Non-Sheets URL returns `"Only Google Sheets URLs (docs.google.com) are accepted"`
- [ ] POST body >10MB rejected with HTTP 413 at gunicorn boundary

### Phase 2 - frontend hygiene
- [ ] User not in `ALLOWED_EMAILS` sees a visible `role="alert"` on the login page with text `"Your account isn't on the access list yet..."` (not a silent redirect loop)
- [ ] Theme tokens render correctly in light AND dark mode (visual check vs design)
- [ ] No `border-color` regression: borders show up on cards, dialogs, inputs

### Phase 3 - multi-format upload
- [ ] CSV / Excel / JSON / Parquet upload paths all create BigQuery tables and Firestore dataset records
- [ ] Chat works on all four new formats (suggested questions return numeric answers matching ground truth)
- [ ] Adapter-specific error paths emit fixed, user-safe messages (no raw library tracebacks in HTTP body)
- [ ] Unsupported extension rejected client-side AND server-side (defense in depth)
- [ ] Excel multi-sheet flow: user can select a subset of worksheets to import

### Regression (all phases)
- [ ] `/health` still returns 200
- [ ] CORS preflight still returns the correct frontend origin
- [ ] No new JS console errors on dashboard / chat / login
- [ ] Bundle size delta < 50KB (frontend); Cloud Run cold start delta < 3s (backend, mostly due to pyarrow)

## QA Plan

Re-run `/qa-only https://talk2mydata-frontend-...run.app/` after each phase. Specific cases:

**After Phase 1:**
1. Happy path - sign in, paste shared Sheet URL, import, chat
2. Sharing error - paste un-shared Sheet URL, verify specific error message
3. Bad URL - paste random URL, verify Sheets-only error
4. Boot assertion - manually break a registration import, redeploy, verify Cloud Run startup fails with clear log

**After Phase 2:**
5. Allowlist deny - sign in with non-listed account, verify visible role="alert" message
6. Visual - verify light/dark theme borders, backgrounds, cards render correctly

**After Phase 3:**
7. CSV upload (UTF-8 with BOM, semicolon-delimited, ~5MB)
8. Excel upload with 3 worksheets, select 2
9. JSON upload (NDJSON, 1000 records)
10. Parquet upload (10MB, mixed numeric/string/timestamp columns)
11. File too large (>10MB) - client rejection then server rejection
12. Unsupported file (.docx) - client rejection
13. Malformed CSV - specific parse error surfaced to user

## Dependencies and Risks

- **Cloud Run cold start with pyarrow**: ~40MB dep, expect cold start to grow by ~2s. Acceptable for our usage profile. If too slow, move parquet behind a separate service or feature-flag it.
- **/tmp on Cloud Run is ephemeral and per-instance**: fine for ingestion-then-discard. Files are unlinked after `connect_and_ingest` completes; even if a worker dies mid-upload, the file is gone with the container.
- **OAuth Internal mode (security)**: confirm in GCP console before any allowlist removal.
- **No data migration**: existing Firestore docs and BQ tables are untouched.

## Open Questions for the user

These need answers before Phase 3 implementation starts:

1. **File size cap**: confirm 10MB is the right ceiling. Higher (50MB? 100MB?) means we need streaming-to-GCS instead of streaming-to-tmp. Default recommendation: ship 10MB, raise later if users hit it.
2. **Parquet priority**: pyarrow is a heavy dep (~40MB). Drop parquet for v1 and ship only CSV/Excel/JSON if cold-start is tight? Or include from the start?
3. **Multi-file upload at once**: accept one file per dialog action, or allow multi-select for batch import? Recommend single for v1.
4. **CSV options exposure**: do users get to override delimiter / encoding / header row, or do we just auto-detect? Recommend auto-detect, add overrides if support tickets come in.

## References

### Internal
- `backend/app/connectors/registry.py` - the registry class
- `backend/app/connectors/ports.py` - `DataConnector` ABC + `ConnectorConfig`
- `backend/app/connectors/adapters/google_sheets.py:49` - canonical adapter shape
- `backend/app/datasets/schema_inference.py` - pandas → BigQuery schema (reused for all new adapters)
- `backend/app/datasets/service.py:load_dataframe` - shared BQ load path
- `backend/app/main.py:72-88` - centralized `Talk2MyDataError` handler + `ERROR_STATUS_CODES`
- Existing plan: `docs/plans/2026-02-21-feat-talk2mydata-chatbot-platform-plan.md`
- Existing solution doc: `docs/solutions/implementation-guides/talk2mydata-ai-chatbot-platform.md`

### External (from framework-docs research, current 2026)
- PyPA - creating and discovering plugins: https://packaging.python.org/en/latest/guides/creating-and-discovering-plugins/
- FastAPI lifespan events: https://fastapi.tiangolo.com/advanced/events/
- Tailwind v4 `@theme` and `@theme inline` semantics: https://tailwindcss.com/docs/theme
- shadcn/ui Tailwind v4 migration: https://ui.shadcn.com/docs/tailwind-v4
- pandas IO reference (read_csv, read_excel, read_json, read_parquet): https://pandas.pydata.org/docs/user_guide/io.html
- FastAPI multipart file upload: https://fastapi.tiangolo.com/tutorial/request-files/
