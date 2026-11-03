# GYMER – pacchetto PWA

Copia la cartella `public/` nella root del progetto (Vite o Next) e incolla gli snippet.

- `public/icons/`  icon.svg, icon-192, icon-512, icon-maskable-512, icon-monochrome-512 (Android icone a tema), apple-touch-icon (180)
- `public/favicon.ico`
- `public/manifest.webmanifest`
- `public/sw.js`   cache offline + notifica fine timer
- `snippets/index-head.html`  tag per <head>
- `snippets/register-sw.js`   registrazione SW e funzione notifyTimerDone()

Note
- La PWA è installabile solo in HTTPS (Vercel lo è) e dopo un deploy di produzione.
- iOS: le notifiche web funzionano solo se l'app è aggiunta alla schermata Home (iOS 16.4+).
- Con il telefono in standby il browser può sospendere la pagina: una notifica garantita
  a timer scaduto richiede Web Push da server (es. funzione Vercel + libreria web-push).
- Se cambi gli asset, incrementa CACHE ("gymer-v1" -> "gymer-v2") in sw.js.
