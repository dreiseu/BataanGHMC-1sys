# Laravel Reverb Setup — IMISS Real-Time Chat & Notifications

This documents how real-time WebSocket updates (via [Laravel Reverb](https://reverb.laravel.com/)) were added to replace polling in the IMISS module (`resources/js/pages/imiss/index.tsx`, `admin.tsx`, and the notification bell). Reference implementation copied from the sibling app `emr_plus` (`\\192.168.42.45\emr_plus`), adapted for this app's LAN-only (no TLS) network profile and custom SOAP-backed auth model.

## Architecture

- **Reverb** is a standalone WebSocket server process (`php artisan reverb:start`), separate from the normal IIS/PHP request-response cycle. It listens on `0.0.0.0:8080` and brokers messages between the Laravel backend and connected browsers.
- Laravel broadcasts events (`CommentPosted`, `TicketStatusUpdated`, `NotificationCreated`) to Reverb, which pushes them to subscribed browsers over WebSocket.
- **IIS** reverse-proxies `/app/*` and `/apps/*` requests to `127.0.0.1:8080`, so browsers connect to the app's normal URL/port (`192.168.42.70:8002`) rather than needing to reach port 8080 directly.
- Because Reverb is a separate broker (not tied to one Laravel app), it's forward-compatible with a planned future split where the admin/technical side moves to its own server — that server would just point its own `.env` at the same Reverb host/port.

## What's already done (code side)

- `composer.json` — `laravel/reverb` installed.
- `config/reverb.php`, `config/broadcasting.php` — published, reverb connection configured for plain HTTP (`useTLS: false`), no TLS/wss needed since this app is LAN-only.
- `.env` — `REVERB_APP_ID/KEY/SECRET` generated, `REVERB_HOST=192.168.42.70`, `REVERB_PORT=8080`, `REVERB_SCHEME=http`, plus matching `VITE_REVERB_*` vars. **`BROADCAST_CONNECTION` is deliberately left as `log`** until the infra steps below are complete — flip to `reverb` last.
- `bootstrap/app.php` — `channels: __DIR__.'/../routes/channels.php'` wired into `withRouting()`.
- `routes/channels.php` — 3 private channels:
  - `imiss.ticket.{ticketId}` — per-ticket chat, authorized via the same ownership/role check as `ImissController::getComments()`.
  - `imiss.user.{bioId}` — per-user notifications and ticket status changes.
  - `imiss.admin` — role-gated (`admin`/`imiss_tech`/`imiss_admin`), feeds the admin ticket list.
- `app/Events/Imiss/` — `CommentPosted`, `TicketStatusUpdated`, `NotificationCreated`, all `ShouldBroadcastNow` (synchronous, no queue worker needed).
- `app/Http/Controllers/ImissController.php` — `storeComment()` and `updateStatus()` fire the events above, wrapped in try/catch so a broadcast failure never breaks the HTTP response.
- `resources/js/echo.ts` — Echo client bootstrap (plain `ws://`, no TLS), imported in `resources/js/app.tsx`.
- `resources/js/pages/imiss/index.tsx`, `admin.tsx`, `resources/js/components/app-global-header.tsx` — polling (`setInterval`) removed, replaced with `window.Echo.private(...).listen(...)` subscriptions.
- `public/web.config` — Reverb proxy rules added (see below).

## Remaining setup steps

### 1. Fix the Composer autoloader (one-time)

While `composer require`/`reverb:install` were run against a temporarily-mapped network drive, `optimize-autoloader: true` baked that drive letter into `vendor/composer/autoload_static.php`. Fix by running, **from the server itself**:

```
composer dump-autoload
```

### 2. Install npm packages and build

```
npm install laravel-echo@^2.3.7 pusher-js@^8.5.0
npm run build
```

`npm run build` (not just `dev`) is what bakes the `VITE_REVERB_*` env vars into the compiled frontend assets — Echo won't have a valid key/host without this.

### 3. Run Reverb as a Windows service (NSSM)

Reverb must run continuously in the background, surviving reboots and crashes — unlike the rest of the app, it isn't a per-request process IIS can manage natively. [NSSM](https://nssm.cc/) wraps it as a real Windows service.

Download NSSM from nssm.cc, extract `win64\nssm.exe` somewhere permanent (e.g. `C:\Tools\nssm\nssm.exe`), then run (adjust paths to match this server):

```
C:\Tools\nssm\nssm.exe install BGHMC-DEV-Reverb "C:\Program Files\php85\php.exe" "artisan reverb:start --host=0.0.0.0 --port=8080"
C:\Tools\nssm\nssm.exe set BGHMC-DEV-Reverb AppDirectory "C:\webapp\BataanGHMC-1sys - Dev"
C:\Tools\nssm\nssm.exe set BGHMC-DEV-Reverb AppStdout "C:\webapp\BataanGHMC-1sys - Dev\storage\logs\reverb-stdout.log"
C:\Tools\nssm\nssm.exe set BGHMC-DEV-Reverb AppStderr "C:\webapp\BataanGHMC-1sys - Dev\storage\logs\reverb-stderr.log"
C:\Tools\nssm\nssm.exe set BGHMC-DEV-Reverb AppExit Default Restart
C:\Tools\nssm\nssm.exe set BGHMC-DEV-Reverb Start SERVICE_AUTO_START
C:\Tools\nssm\nssm.exe start BGHMC-DEV-Reverb
```

Verify it's running:
```
C:\Tools\nssm\nssm.exe status BGHMC-DEV-Reverb
```
Should report `SERVICE_RUNNING`. If not, check the stdout/stderr log files above for the crash reason (e.g. port already in use, wrong PHP path).

Use a different service name (and a different `--port`) if this is ever repeated for the non-Dev production copy on the same server — they can't share port 8080.

### 4. Confirm IIS prerequisites

- **WebSocket Protocol feature** must be installed on the server:
  ```powershell
  Get-WindowsFeature Web-WebSockets
  ```
  If not installed, add it via Server Manager → Add Roles and Features → Web Server (IIS) → Application Development → WebSocket Protocol.
- **Port 8080 must be free** before starting the service:
  ```powershell
  netstat -ano | findstr :8080
  ```

### 5. IIS `web.config` rules (already added)

`public/web.config` now has, before the catch-all `"1SYS Rewrite"` rule:
```xml
<rule name="Reverb WebSockets Proxy" stopProcessing="true">
    <match url="^app/(.*)" />
    <action type="Rewrite" url="http://127.0.0.1:8080/app/{R:1}" />
</rule>
<rule name="Reverb API Proxy" stopProcessing="true">
    <match url="^apps/(.*)" />
    <action type="Rewrite" url="http://127.0.0.1:8080/apps/{R:1}" />
</rule>
```
No action needed here unless these are missing — just confirm they're present after any future `web.config` changes.

### 6. Go live

Once steps 1-4 are done, flip in `.env`:
```
BROADCAST_CONNECTION=reverb
```
No code change needed — this is the single switch that turns on real broadcasting (previously `log`, a no-op driver).

## Verification

Use **two separate logged-in browser sessions** — self-testing in one tab can look like it works even if delivery to *other* users is silently broken.

1. User A on `/imiss`, IMISS staff on `/imiss/admin` in a second browser. A posts a comment → appears in staff's chat panel within ~1s, no reload. Staff replies → appears live for A.
2. Staff changes a ticket's status → A sees the toast + updated timeline live, and the notification bell updates live — no page reload.
3. Two admin sessions open at once → a status change or new comment in one shows up live in the other's ticket list (validates the `imiss.admin` channel).
4. From browser devtools, try `window.Echo.private('imiss.ticket.{someone-elses-ticket-id}')` as a non-owner, non-staff user → subscription should be rejected (validates channel auth is actually enforced).

## Troubleshooting

- **Socket never connects**: DevTools → Network → filter `WS` → look for `ws://192.168.42.70:8002/app/{key}`.
  - `101 Switching Protocols` → chain is healthy.
  - `404` → IIS rewrite rule isn't matching (check rule order — it must sit above the catch-all rule).
  - No request at all / immediate close → check `forceTLS`/`enabledTransports` in `resources/js/echo.ts` (should be `false` / `['ws']` for this LAN-only app), or Reverb isn't running.
- **Pusher/Echo console errors** (`pusher:error`, auth failures) → usually a `/broadcasting/auth` problem. Confirm `routes/channels.php` is loaded (check `bootstrap/app.php`'s `withRouting()`).
- **Service won't start / crashes** → `nssm status BGHMC-DEV-Reverb`, then check the stdout/stderr logs configured in step 3 (common causes: port already in use, wrong PHP path, wrong `AppDirectory`).
- **Rollback**: set `BROADCAST_CONNECTION` back to `log` and stop the NSSM service — the app keeps working normally either way, since broadcasting failures are always caught and logged, never thrown to the user.
