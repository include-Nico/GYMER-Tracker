// src/main.jsx: registra il service worker (solo in produzione)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js"));
}

// Da chiamare quando il timer arriva a 0
export async function notifyTimerDone() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const reg = await navigator.serviceWorker?.ready;
  // Su Android Chrome "new Notification()" non funziona: serve il service worker
  if (reg) reg.active?.postMessage({ type: "TIMER_DONE" });
}

// Da chiamare da un gesto dell'utente (es. pulsante in Impostazioni)
export const askNotificationPermission = () => Notification.requestPermission();
