export async function logVisit(path: string) {
  const webhook = import.meta.env.VITE_VISIT_WEBHOOK;
  if (!webhook) return; // no logger configured

  const payload = {
    path,
    ts: new Date().toISOString(),
    ua: typeof navigator !== "undefined" ? navigator.userAgent : "server",
  };

  try {
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon(webhook, blob);
    } else {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    }
  } catch (err) {
    // Fail silently to avoid impacting UX
    console.warn("Visit log failed", err);
  }
}
