# NAS Storage Setup — HR Documents, Video Orientations, IMISS Attachments

This documents how file storage for HR documents, video orientations, and IMISS ticket/comment attachments was moved off the local disk of `192.168.42.70` onto the network share `\\192.168.42.123\Telemedicine_files\1BGHMC Files`.

## Why not just point local storage at the UNC path directly

The IIS application pool for this site runs as `ApplicationPoolIdentity` — a virtual, machine-local account with no credentials of its own. It can't reliably authenticate to a *remote* SMB share, which is exactly the kind of problem this codebase had already hit before (see the old CMS-fallback comment in `ImissController.php`, "to bypass UNC permission issues"). Pointing Laravel's `local` filesystem driver straight at the UNC path would just repeat that failure for every upload, not only the one legacy case it was originally worked around for.

Instead, this uses two **separate, independently-credentialed paths** for writes and reads:

- **Writes** go directly from PHP to the UNC path via `copy()` (see `app/Services/NasStorage.php`) — this works because the app pool identity, despite lacking remote SMB credentials in general, was confirmed (via live testing) to be able to write to this specific share once its permissions were set up correctly. See the Troubleshooting section for what to do if writes stop working after a server change.
- **Reads** go through an **IIS Virtual Directory** (`/1bghmc_attachments`, physical path = the same UNC share, with explicit "Connect As" credentials — the `EMR_PLUS` account) rather than PHP reading the file directly. This is what actually solves the identity problem for reads: IIS's own static file handler uses the Virtual Directory's stored credentials, completely independent of the app pool identity, so it works even where direct PHP file reads over UNC do not.

## Architecture

```
Browser  --GET /storage/videos/xyz.mp4-->  IIS  --rewrite-->  /1bghmc_attachments/videos/xyz.mp4
                                                                (Virtual Directory, EMR_PLUS creds)
                                                                --> \\192.168.42.123\Telemedicine_files\1BGHMC Files\videos\xyz.mp4

Laravel  --NasStorage::store()/copy()-->  \\192.168.42.123\Telemedicine_files\1BGHMC Files\...
         (direct UNC write from PHP, app-pool identity)
```

## What's already done (code side)

- **`app/Services/NasStorage.php`** — the single place that knows how to talk to the NAS:
  - `basePath()` / `path($relative)` — builds the UNC path from `NAS_HOST`/`NAS_SHARE`/`NAS_FOLDER` env vars.
  - `store(UploadedFile $file, string $folder)` — writes via `copy()` (not `file_put_contents()` — see Troubleshooting for why that matters), auto-creates the target folder, returns a relative path like `videos/xxxx.mp4` for the DB column.
  - `exists($relativePath)` / `delete($relativePath)` — plain `file_exists()`/`unlink()` against the UNC path.
- **`.env`**:
  ```
  NAS_HOST=192.168.42.123
  NAS_SHARE=Telemedicine_files
  NAS_FOLDER="1BGHMC Files"
  ```
  Note the quotes around `NAS_FOLDER` — it contains a space, and an unquoted value with a space breaks Dotenv parsing for the *entire* `.env` file, not just this line. Same applies to `.env.example`.
- **Controllers switched from the local `public` disk to `NasStorage`**:
  - `app/Http/Controllers/HrDocumentController.php` — folder `hr_documents`
  - `app/Http/Controllers/VideoOrientationController.php` — folder `videos`
  - `app/Http/Controllers/ImissController.php` — folders `imiss_attachments`, `imiss_comment_attachments`
  - All `Storage::disk('public')->exists()/delete()` calls became `NasStorage::exists()/delete()`; all `$file->store(...)` calls became `NasStorage::store($file, $folder)`.
- **`ImissController::attachment()` and `openCommentAttachment()`** — these two methods *serve* files back to the browser (as opposed to the other controllers, which just generate a `/storage/{path}` link and let IIS handle serving). They don't read the UNC path directly; instead they make an internal HTTP call to the same `/1bghmc_attachments/...` Virtual Directory the `/storage/*` rewrite uses, and stream that response back:
  ```php
  $nasResponse = Http::timeout(10)->get(rtrim(env('APP_URL'), '/') . '/1bghmc_attachments/imiss_attachments/' . $file);
  if (!$nasResponse->successful()) { abort(404); }
  return response($nasResponse->body(), 200)->header('Content-Type', $nasResponse->header('Content-Type') ?: 'application/octet-stream');
  ```
  `openCommentAttachment()` does this in three tiers: `imiss_comment_attachments` folder, then `imiss_attachments` folder, then an external CMS server fallback (pre-existing, untouched). This pattern exists because a direct `file_exists()`/`response()->file()` read from PHP was confirmed unreliable (see Troubleshooting) even though `file_exists()` itself worked — routing through the Virtual Directory sidesteps the problem entirely.
- **`public/web.config`** — rewrite rule so every existing `/storage/{path}` link in the frontend keeps working unchanged:
  ```xml
  <rule name="NAS Proxy Storage Rewrite" stopProcessing="true">
      <match url="^storage/(.*)$" />
      <action type="Rewrite" url="1bghmc_attachments/{R:1}" />
  </rule>
  ```
  Placed before the catch-all `"1SYS Rewrite"` rule (order matters).

## Infra prerequisites (already set up on 192.168.42.70)

- **IIS Virtual Directory**: alias `1bghmc_attachments`, physical path `\\192.168.42.123\Telemedicine_files\1BGHMC Files`, "Connect As" credentials set to the `EMR_PLUS` account (confirmed working in `applicationHost.config`). If this ever needs recreating (new server, new site), it's IIS Manager → the site → Virtual Directories → Add Virtual Directory.
- **Write access**: the app pool identity must be able to write to the NAS share directly. This was confirmed working via live testing at the time of setup — if writes ever start failing (see Troubleshooting), this is the first thing to re-verify with a server admin, since it depends on share/NTFS permissions granted to whatever account IIS's app pool actually runs as.

## Migrating existing files

If moving to a fresh NAS path, copy the existing local folders across, preserving the relative structure so DB-stored paths (`file_path`, `video_path`, `attachments` JSON) keep resolving:
```
storage/app/public/imiss_attachments/*            -> \\192.168.42.123\Telemedicine_files\1BGHMC Files\imiss_attachments\
storage/app/public/imiss_comment_attachments/*    -> ...\imiss_comment_attachments\
storage/app/public/videos/*                       -> ...\videos\
```
Copy (don't move) so the local originals remain as a rollback safety net until the new setup is confirmed stable for a few days. Do this copy from a session/account already known to have working access to both ends (interactively, e.g. via Explorer or `robocopy`) rather than through the app itself.

## Verification

- **HR document**: upload a small test PDF, confirm it saves, then open it via its `/storage/{file_path}` link.
- **HR document delete**: delete it, confirm the file is actually gone from the NAS (not just the DB row).
- **Video orientation**: upload a real (not tiny) video file — confirms `NasStorage::store()`'s `copy()`-based write handles large files, which the original `file_put_contents()` approach did not (see Troubleshooting).
- **IMISS ticket attachment**: submit a ticket with an attachment, open it via `/imiss/attachment/{file}`.
- **IMISS comment attachment, all three tiers**: a fresh comment attachment resolves from `imiss_comment_attachments`; a filename only in `imiss_attachments` still falls back correctly; a filename in neither still falls through to the CMS fetch.
- **Direct check**: open `http://192.168.42.70:8002/storage/{a-known-path}` in a browser — should resolve via the Virtual Directory rewrite (Network tab: 200, correct `Content-Type`).

## Troubleshooting

- **`file_put_contents(...): Failed to open stream: Invalid argument` on upload** — this is a known PHP-on-Windows limitation streaming large files to a UNC path. `NasStorage::store()` uses `copy()` specifically to avoid this; if this error reappears, check that nothing has reverted `NasStorage.php` back to a `fopen`/`file_put_contents` pattern.
- **`File must be readable` (Symfony `BinaryFileResponse`) when serving an attachment** — this means something is trying to read the UNC path directly from PHP (`response()->file()` or similar) instead of going through the `/1bghmc_attachments` Virtual Directory. `file_exists()` can return `true` over UNC from the app pool identity even when actually opening/reading the file fails — that asymmetry is exactly why `attachment()`/`openCommentAttachment()` proxy through HTTP instead of reading directly.
- **`/storage/*` links suddenly 404 for everything** (not just NAS-related files) — check `public/web.config`'s rewrite rule order; the NAS proxy rule must come before the catch-all `"1SYS Rewrite"` rule, and the target virtual directory name (`1bghmc_attachments`) must exactly match what's actually configured in IIS — don't assume a name from another app's setup (a prior version of this rule pointed at `nas_files`, copied from a different, unrelated app, before being corrected).
- **Uploads fail with `Invalid argument` even after the `copy()` fix** — this points to the app pool identity's write access itself, not the PHP function used. Verify with a server admin that IIS's app pool identity still has write permission to `\\192.168.42.123\Telemedicine_files\1BGHMC Files` (permissions can change independently of anything in this codebase).
- **`.env` fails to load / whole app breaks after editing NAS config** — check for an unquoted value containing a space (e.g. `NAS_FOLDER=1BGHMC Files` without quotes). Dotenv treats the unescaped space as a parse error for the entire file, not just that line.
