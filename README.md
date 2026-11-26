# ZedStream — Live TV

A single-page live TV streaming web app with Firebase auth, subscription management,
multi-device limits, sports scores & fixtures, parental (18+) controls, favorites,
watch history, and an advanced HTML5 video player (HLS / Shaka / mpegts) with
picture-in-picture, quality selection, DRM (ClearKey / Widevine / PlayReady) and
fullscreen support.

## Features

- **Firebase Authentication** — email/password sign-in, sign-up and password reset
- **Subscription system** — subscription index stored on Pastefy, per-account expiry,
  status gating with a renewal screen
- **Device management** — device limit enforcement with a "remove other device" flow
- **Live TV** — channel grid/list views, category chips, search, hover preview tooltip
- **Coming Up Next** — upcoming events rail with live countdowns and auto-scroll
- **Sports Center** — live scores, upcoming fixtures, match reminders (5-minute toast),
  sport/status filters and match search
- **Favorites & Watch History** — persisted locally, synced against the channel list
- **Parental controls** — PIN-protected (default `6969`, session only) 18+ categories
- **Video player** — adaptive bitrate quality picker, aspect modes (Fit/Fill/Zoom),
  browser PiP + in-app floating mini-player, stream backup switching
- **Offline / no-data detection** — banner + toasts based on real connectivity probes

## Project structure

```
zedstream/
├── index.html            # markup + CDN library tags (Firebase, hls.js, Shaka, mpegts)
├── css/
│   └── style.css         # all styles
├── js/
│   ├── polyfills.js      # Android WebView / old-browser polyfills (load first)
│   ├── config.js         # API keys & Firebase config — GITIGNORED, see below
│   ├── config.example.js # template for config.js
│   ├── app-core.js       # auth, subscriptions, devices, channels, favorites,
│   │                     # history, sports, PIN, search, event channels, profile
│   ├── network.js        # online/offline/no-data detection + pull-to-refresh
│   ├── player.js         # video player, engines, DRM, PiP, quality, fullscreen
│   └── app.js            # boot / app init
├── .gitignore
├── LICENSE               # MIT
└── README.md
```

Script load order matters: shared state is declared in earlier files and used at
runtime by later ones — keep the order shown in `index.html`.

## Setup

1. Clone the repo.
2. Create your own `js/config.js` from the template:

   ```bash
   cp js/config.example.js js/config.js
   ```

3. Fill in `js/config.js`:
   - `PASTEFY_API_KEY` — your Pastefy API token (used to read/edit the subscription index)
   - `SUBSCRIPTION_PASTE_ID` — the Pastefy paste holding the subscription master index
   - `LIVE_TV_API` — URL returning the channels JSON
   - `firebaseConfig` — your Firebase web app credentials

   `js/config.js` is listed in `.gitignore` so it never gets committed.

4. Serve the folder over HTTP (or open `index.html` in a WebView/browser):

   ```bash
   npx serve .
   ```

## Subscription index format

The Pastefy paste referenced by `SUBSCRIPTION_PASTE_ID` must be JSON like:

```json
{
  "subscriptions": [
    {
      "subEmail": "user@example.com",
      "status": "active",
      "expiryDate": "2026-12-31T23:59:59Z",
      "planType": "premium",
      "price": 9.99,
      "billingCycle": "monthly",
      "deviceLimit": 2,
      "connectedDevices": ["dev_xxxx_yyyy"],
      "serviceName": "ZedStream",
      "updatedAt": "2026-11-01T00:00:00Z"
    }
  ]
}
```

## Channels JSON format

`LIVE_TV_API` should return either a bare array or an object with `channels`
(and optionally `comingUpNext`):

```json
{
  "channels": [
    {
      "id": "bbc-one",
      "name": "BBC One",
      "category": "entertainment",
      "badge": "Entertainment",
      "img": "https://…/logo.png",
      "link": "https://…/index.m3u8",
      "link2": "https://…/backup.m3u8"
    }
  ],
  "comingUpNext": [
    { "title": "Team A vs Team B", "time": "2026-11-27T20:00:00Z", "channel": "Sports", "note": "SS Football" }
  ]
}
```

Optional DRM fields per channel: `drm` (object), `clearKeys`, `keyId` + `key`,
`licenseUrl`, `drmScheme` (`clearkey` | `widevine` | `playready`), `drmHeaders`.
Inline URL params (`|drmScheme=…&clearkey=…`) are also parsed.

## Notes

- The 18+ PIN is client-side only (`6969` in `app-core.js`) — it is a parental
  convenience, not a security boundary.
- `go:payment` links are native-Android-WebView intents and do nothing in a browser.
- Streaming engines are loaded from CDN: hls.js, Shaka Player, mpegts.js.

## License

MIT — see [LICENSE](LICENSE).
