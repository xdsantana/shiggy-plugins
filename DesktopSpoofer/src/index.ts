import { logger } from "@vendetta";
import { showToast } from "@vendetta/ui/toasts";

let originalSend: typeof WebSocket.prototype.send | null = null;
let patchedSend: typeof WebSocket.prototype.send | null = null;

function patchIdentify(data: unknown) {
    if (typeof data !== "string") return data;

    try {
        const payload = JSON.parse(data);
        if (payload?.op === 2 && payload?.d?.properties) {
            payload.d.properties = {
                ...payload.d.properties,
                browser: "Discord Client",
            };
            return JSON.stringify(payload);
        }
    } catch {}

    return data;
}

export default {
    onLoad() {
        try {
            const WS = globalThis.WebSocket;
            if (!WS?.prototype?.send) throw new Error("WebSocket.send unavailable");
            if (originalSend) return;

            originalSend = WS.prototype.send;
            patchedSend = function (data: any) {
                return originalSend!.call(this, patchIdentify(data));
            };
            WS.prototype.send = patchedSend;

            showToast("DesktopSpoofer enabled — restart Discord to apply");
            logger?.log?.("[DesktopSpoofer] Waiting for Gateway IDENTIFY");
        } catch (error) {
            logger?.error?.("[DesktopSpoofer] Failed to patch WebSocket.send", error);
            showToast("DesktopSpoofer failed to load");
            throw error;
        }
    },

    onUnload() {
        try {
            const WS = globalThis.WebSocket;
            if (originalSend && WS?.prototype?.send === patchedSend) {
                WS.prototype.send = originalSend;
            }
        } finally {
            originalSend = null;
            patchedSend = null;
        }
    },
};
