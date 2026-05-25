
            // --- CONSTANTES E ACESSO ---
            const CATEGORIES = ["Cabos", "Áudio", "Vídeo", "Luz", "Outros"];

            let dashChartInstance = null;
            let insightsChartCat = null;
            let insightsChartTop = null;

            const destroyChartIfExists = (instance) => {
                try {
                    if (instance && typeof instance.destroy === "function") instance.destroy();
                } catch (error) {
                    console.warn("Falha ao destruir gráfico:", error);
                }
                return null;
            };

            const clearChartContainer = (canvasId) => {
                const canvas = document.getElementById(canvasId);
                if (!canvas) return null;
                const parent = canvas.parentElement;
                if (!parent) return canvas;
                parent.querySelectorAll("[data-chart-fallback='true']").forEach((el) => el.remove());
                parent.classList.remove("flex", "items-center", "justify-center");
                canvas.classList.remove("hidden");
                return canvas;
            };

            const renderDonutFallback = (canvasId, labels, values) => {
                const canvas = clearChartContainer(canvasId);
                if (!canvas || !canvas.parentElement) return;
                const parent = canvas.parentElement;
                const total = values.reduce((sum, value) => sum + value, 0);
                const colors = ["#ef4444", "#d946ef", document.documentElement.classList.contains("dark") ? "#3f3f46" : "#d4d4d8"];
                let current = 0;
                const segments = values
                    .map((value, index) => {
                        const fraction = total > 0 ? value / total : 0;
                        const start = current;
                        current += fraction;
                        if (fraction <= 0) return "";
                        const startAngle = start * Math.PI * 2 - Math.PI / 2;
                        const endAngle = current * Math.PI * 2 - Math.PI / 2;
                        const x1 = 50 + 36 * Math.cos(startAngle);
                        const y1 = 50 + 36 * Math.sin(startAngle);
                        const x2 = 50 + 36 * Math.cos(endAngle);
                        const y2 = 50 + 36 * Math.sin(endAngle);
                        const largeArc = fraction > 0.5 ? 1 : 0;
                        return `<path d="M 50 50 L ${x1.toFixed(3)} ${y1.toFixed(3)} A 36 36 0 ${largeArc} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z" fill="${colors[index % colors.length]}"></path>`;
                    })
                    .join("");
                canvas.classList.add("hidden");
                parent.classList.add("flex", "items-center", "justify-center");
                parent.insertAdjacentHTML(
                    "beforeend",
                    `<div data-chart-fallback="true" class="absolute inset-0 flex items-center justify-center">
                        <div class="w-full h-full flex items-center justify-center">
                            <svg viewBox="0 0 100 100" class="w-full h-full max-w-[220px] max-h-[220px]">
                                <circle cx="50" cy="50" r="36" fill="none" stroke="${document.documentElement.classList.contains("dark") ? "#18181b" : "#f4f4f5"}" stroke-width="18"></circle>
                                ${segments || ""}
                                <circle cx="50" cy="50" r="18" fill="${document.documentElement.classList.contains("dark") ? "#000000" : "#f3f4f7"}"></circle>
                            </svg>
                        </div>
                    </div>`
                );
            };

            const renderBarFallback = (canvasId, labels, values) => {
                const canvas = clearChartContainer(canvasId);
                if (!canvas || !canvas.parentElement) return;
                const parent = canvas.parentElement;
                const max = Math.max(...values, 1);
                canvas.classList.add("hidden");
                parent.insertAdjacentHTML(
                    "beforeend",
                    `<div data-chart-fallback="true" class="absolute inset-0 px-3 py-4 flex items-end gap-3">
                        ${values
                            .map((value, index) => {
                                const height = Math.max(10, Math.round((value / max) * 100));
                                return `
                                    <div class="flex-1 min-w-0 flex flex-col justify-end items-center gap-2">
                                        <div class="w-full rounded-t-xl bg-amber-300/90" style="height:${height}%"></div>
                                        <div class="text-[9px] font-black uppercase tracking-widest text-zinc-400 text-center leading-tight">${labels[index] || ""}</div>
                                    </div>
                                `;
                            })
                            .join("")}
                    </div>`
                );
            };

            const renderSafeDonutChart = (canvasId, labels, values, options = {}) => {
                const canvas = clearChartContainer(canvasId);
                if (!canvas) return null;
                if (window.Chart) {
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return null;
                    return new Chart(ctx, options);
                }
                renderDonutFallback(canvasId, labels, values);
                return null;
            };

            const renderSafeBarChart = (canvasId, labels, values, options = {}) => {
                const canvas = clearChartContainer(canvasId);
                if (!canvas) return null;
                if (window.Chart) {
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return null;
                    return new Chart(ctx, options);
                }
                renderBarFallback(canvasId, labels, values);
                return null;
            };

            const escapeHtml = (value) => {
                const stringValue = value == null ? "" : String(value);
                return stringValue
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;");
            };
            if (typeof window !== "undefined") window.escapeHtml = escapeHtml;
            if (typeof window !== "undefined") window.__AV_BOOT_READY__ = false;

            const COMPAT_ELEMENT_TAGS = {
                "nav-users": "button",
                "modal-form": "form",
                "f-select-item": "select",
                "f-qty": "input",
                "f-name": "input",
                "f-cat": "input",
                "f-price": "input",
                "f-initial-qty": "input",
                "f-user-name": "input",
                "f-user-email": "input",
                "f-user-role": "select",
                "f-user-status": "select",
                "f-purchase-item": "select",
                "f-purchase-qty": "input",
                "f-purchase-date": "input",
                "f-room-obs": "textarea",
                "f-room-obsLevel": "input",
                "btn-risk-ok": "button",
                "btn-risk-warning": "button",
                "btn-risk-danger": "button",
                "f-email-to": "input",
                "f-email-body": "textarea"
            };

            const ensureCompatElements = () => {
                if (typeof document === "undefined") return;
                let host = document.getElementById("compat-hidden-elements");
                if (!host) {
                    host = document.createElement("div");
                    host.id = "compat-hidden-elements";
                    host.setAttribute("hidden", "hidden");
                    host.setAttribute("aria-hidden", "true");
                    host.style.display = "none";
                    document.body.appendChild(host);
                }
                Object.entries(COMPAT_ELEMENT_TAGS).forEach(([id, tag]) => {
                    if (document.getElementById(id)) return;
                    const el = document.createElement(tag);
                    el.id = id;
                    if (tag === "input") el.type = "hidden";
                    if (tag === "button") el.type = "button";
                    host.appendChild(el);
                });
            };


            const warnMissingElement = (id) => {
                try {
                    console.warn(`[AV.Storage] Elemento ausente no DOM: #${id}`);
                } catch (_) {}
            };

            const getEl = (id, { warn = false } = {}) => {
                const element = document.getElementById(id);
                if (!element && warn) warnMissingElement(id);
                return element;
            };

            const setTextIfPresent = (id, value, { warn = false } = {}) => {
                const element = getEl(id, { warn });
                if (element) element.innerText = value;
                return element;
            };

            const setHtmlIfPresent = (id, value, { warn = false } = {}) => {
                const element = getEl(id, { warn });
                if (element) element.innerHTML = value;
                return element;
            };

            const setValueIfPresent = (id, value, { warn = false } = {}) => {
                const element = getEl(id, { warn });
                if (element) element.value = value;
                return element;
            };

            const toggleClasses = (id, classes = [], method = "add", { warn = false } = {}) => {
                const element = getEl(id, { warn });
                if (!element) return null;
                if (element.classList && typeof element.classList[method] === "function") {
                    element.classList[method](...classes);
                }
                return element;
            };


            const API_BASE = "/api";
            let remoteStateReady = false;
            let remotePersistTimer = null;
            let remotePersistRunning = false;
            let remotePullTimer = null;
            let remoteSyncInFlight = false;
            let remoteStateVersion = null;
            let remoteChangeCursor = 0;
            const seenRealtimeToastIds = new Set();
            const remoteDirtyKeys = new Set();
            let remoteApplyingState = false;
            const LOCAL_CACHE_KEY = "av.storage.cache.v16.0";
            const LOCAL_PENDING_QUEUE_KEY = "av.storage.pending.v16.0";
            const REMOTE_BOOKMARK_KEY = "av.storage.remote-bookmark.v16.5";
            const REMOTE_POLL_INTERVAL_MS = 3500;
            const REMOTE_BACKGROUND_POLL_INTERVAL_MS = 9000;
            const LOCAL_CACHE_TTL_MS = 1000 * 60 * 60 * 12;
            let bootedFromLocalCache = false;
            let lastAuthoritativeSyncAt = 0;
            const REMOTE_FORCE_FULL_SYNC_MS = 2500;
            let remoteRealtimeEnabled = false;
            let remoteBookmark = "";

            let remoteSocket = null;
            let remoteSocketReconnectTimer = null;
            let remoteSocketReconnectAttempts = 0;
            let remoteSocketConnecting = false;
            const REMOTE_SOCKET_RETRY_BASE_MS = 1200;
            const REMOTE_SOCKET_RETRY_MAX_MS = 10000;
            let remoteRefreshQueued = false;
            let logoutInFlight = false;
            let pendingRealtimeChanges = [];
            const localSyncChannel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("av-storage-sync") : null;

            const DEFAULT_BOOTSTRAP = {
                "users": [
                                {
                                                "id": "admin",
                                                "name": "Administrador",
                                                "email": "admin@avstorage.local",
                                                "role": "Administrador",
                                                "status": "active",
                                                "lastAccess": null,
                                                "isSystem": true,
                                                "isGuest": false
                                },
                                {
                                                "id": "dev.gui",
                                                "name": "Desenvolvedor",
                                                "email": "dev.gui@avstorage.local",
                                                "role": "Desenvolvedor",
                                                "status": "active",
                                                "lastAccess": null,
                                                "isSystem": true,
                                                "isGuest": false
                                },
                                {
                                                "id": "guest",
                                                "name": "Acesso rápido",
                                                "email": "guest@avstorage.local",
                                                "role": "Convidado",
                                                "status": "active",
                                                "lastAccess": null,
                                                "isSystem": true,
                                                "isGuest": true
                                }
                ],
                "inventory": [
                                {
                                                "id": "1",
                                                "name": "Cabo HDMI 2.0 5m",
                                                "category": "Cabos",
                                                "quantity": 45,
                                                "price": 35,
                                                "status": "ok",
                                                "manualPurchaseQty": 0,
                                                "deadline": null
                                },
                                {
                                                "id": "2",
                                                "name": "Microfone Sem Fio Duplo",
                                                "category": "Áudio",
                                                "quantity": 4,
                                                "price": 850,
                                                "status": "low",
                                                "manualPurchaseQty": 2,
                                                "deadline": "2026-04-01"
                                },
                                {
                                                "id": "3",
                                                "name": "Mesa de Som Analógica 12 Ch",
                                                "category": "Áudio",
                                                "quantity": 0,
                                                "price": 1600,
                                                "status": "zero",
                                                "manualPurchaseQty": 1,
                                                "deadline": "2026-03-25"
                                },
                                {
                                                "id": "4",
                                                "name": "Projetor Laser 5000 Lumens",
                                                "category": "Vídeo",
                                                "quantity": 2,
                                                "price": 14000,
                                                "status": "low",
                                                "manualPurchaseQty": 0,
                                                "deadline": null
                                },
                                {
                                                "id": "5",
                                                "name": "Refletor LED PAR 64",
                                                "category": "Luz",
                                                "quantity": 12,
                                                "price": 320,
                                                "status": "ok",
                                                "manualPurchaseQty": 0,
                                                "deadline": null
                                },
                                {
                                                "id": "6",
                                                "name": "Rolo Fita Gaffer Preta",
                                                "category": "Outros",
                                                "quantity": 15,
                                                "price": 85,
                                                "status": "ok",
                                                "manualPurchaseQty": 0,
                                                "deadline": null
                                }
                ],
                "movements": [
                                {
                                                "id": "m1",
                                                "itemId": "2",
                                                "type": "out",
                                                "quantity": 2,
                                                "date": "2026-03-25T13:08:42.721Z",
                                                "user": "Operador"
                                },
                                {
                                                "id": "m2",
                                                "itemId": "4",
                                                "type": "in",
                                                "quantity": 1,
                                                "date": "2026-03-25T12:08:42.721Z",
                                                "user": "Operador"
                                },
                                {
                                                "id": "m3",
                                                "itemId": "1",
                                                "type": "out",
                                                "quantity": 5,
                                                "date": "2026-03-24T14:08:42.721Z",
                                                "user": "Operador"
                                }
                ],
                "infraRooms": [
                                {
                                                "id": "u1-maker",
                                                "name": "Maker",
                                                "unit": 1,
                                                "floor": "Salas Especiais",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-quimica",
                                                "name": "Química",
                                                "unit": 1,
                                                "floor": "Salas Especiais",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-innovation",
                                                "name": "Innovation",
                                                "unit": 1,
                                                "floor": "Salas Especiais",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-devlab",
                                                "name": "Dev Lab",
                                                "unit": 1,
                                                "floor": "Salas Especiais",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-gamedev1",
                                                "name": "Game Dev1",
                                                "unit": 1,
                                                "floor": "Salas Especiais",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-ginastica",
                                                "name": "Ginástica",
                                                "unit": 1,
                                                "floor": "Salas Especiais",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-401",
                                                "name": "Sala 401",
                                                "unit": 1,
                                                "floor": "4º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-402",
                                                "name": "Sala 402",
                                                "unit": 1,
                                                "floor": "4º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-404",
                                                "name": "Sala 404",
                                                "unit": 1,
                                                "floor": "4º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-405",
                                                "name": "Sala 405",
                                                "unit": 1,
                                                "floor": "4º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-406",
                                                "name": "Sala 406",
                                                "unit": 1,
                                                "floor": "4º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-407",
                                                "name": "Sala 407",
                                                "unit": 1,
                                                "floor": "4º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-408",
                                                "name": "Sala 408",
                                                "unit": 1,
                                                "floor": "4º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-409",
                                                "name": "Sala 409",
                                                "unit": 1,
                                                "floor": "4º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-410",
                                                "name": "Sala 410",
                                                "unit": 1,
                                                "floor": "4º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-501",
                                                "name": "Sala 501",
                                                "unit": 1,
                                                "floor": "5º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-502",
                                                "name": "Sala 502",
                                                "unit": 1,
                                                "floor": "5º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-504",
                                                "name": "Sala 504",
                                                "unit": 1,
                                                "floor": "5º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-505",
                                                "name": "Sala 505",
                                                "unit": 1,
                                                "floor": "5º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-506",
                                                "name": "Sala 506",
                                                "unit": 1,
                                                "floor": "5º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-508",
                                                "name": "Sala 508",
                                                "unit": 1,
                                                "floor": "5º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-509",
                                                "name": "Sala 509",
                                                "unit": 1,
                                                "floor": "5º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-603",
                                                "name": "Sala 603",
                                                "unit": 1,
                                                "floor": "6º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-604",
                                                "name": "Sala 604",
                                                "unit": 1,
                                                "floor": "6º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-605",
                                                "name": "Sala 605",
                                                "unit": 1,
                                                "floor": "6º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-606",
                                                "name": "Sala 606",
                                                "unit": 1,
                                                "floor": "6º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-607",
                                                "name": "Sala 607",
                                                "unit": 1,
                                                "floor": "6º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-608",
                                                "name": "Sala 608",
                                                "unit": 1,
                                                "floor": "6º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-609",
                                                "name": "Sala 609",
                                                "unit": 1,
                                                "floor": "6º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-701",
                                                "name": "Sala 701",
                                                "unit": 1,
                                                "floor": "7º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-702",
                                                "name": "Sala 702",
                                                "unit": 1,
                                                "floor": "7º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-703",
                                                "name": "Sala 703",
                                                "unit": 1,
                                                "floor": "7º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-704",
                                                "name": "Sala 704",
                                                "unit": 1,
                                                "floor": "7º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-705",
                                                "name": "Sala 705",
                                                "unit": 1,
                                                "floor": "7º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-706",
                                                "name": "Sala 706",
                                                "unit": 1,
                                                "floor": "7º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-707",
                                                "name": "Sala 707",
                                                "unit": 1,
                                                "floor": "7º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-708",
                                                "name": "Sala 708",
                                                "unit": 1,
                                                "floor": "7º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-709",
                                                "name": "Sala 709",
                                                "unit": 1,
                                                "floor": "7º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u1-710",
                                                "name": "Sala 710",
                                                "unit": 1,
                                                "floor": "7º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-201",
                                                "name": "Sala 201",
                                                "unit": 2,
                                                "floor": "2º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-202",
                                                "name": "Sala 202",
                                                "unit": 2,
                                                "floor": "2º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-203",
                                                "name": "Sala 203",
                                                "unit": 2,
                                                "floor": "2º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-204",
                                                "name": "Sala 204",
                                                "unit": 2,
                                                "floor": "2º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-301",
                                                "name": "Sala 301",
                                                "unit": 2,
                                                "floor": "3º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-302",
                                                "name": "Sala 302",
                                                "unit": 2,
                                                "floor": "3º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-303",
                                                "name": "Sala 303",
                                                "unit": 2,
                                                "floor": "3º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-304",
                                                "name": "Sala 304",
                                                "unit": 2,
                                                "floor": "3º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-501",
                                                "name": "Sala 501",
                                                "unit": 2,
                                                "floor": "5º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-502",
                                                "name": "Sala 502",
                                                "unit": 2,
                                                "floor": "5º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-503",
                                                "name": "Sala 503",
                                                "unit": 2,
                                                "floor": "5º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-603",
                                                "name": "Sala 603",
                                                "unit": 2,
                                                "floor": "6º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-701",
                                                "name": "Sala 701",
                                                "unit": 2,
                                                "floor": "7º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-702",
                                                "name": "Sala 702",
                                                "unit": 2,
                                                "floor": "7º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-703",
                                                "name": "Sala 703",
                                                "unit": 2,
                                                "floor": "7º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-704",
                                                "name": "Sala 704",
                                                "unit": 2,
                                                "floor": "7º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-801",
                                                "name": "Sala 801",
                                                "unit": 2,
                                                "floor": "8º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-802",
                                                "name": "Sala 802",
                                                "unit": 2,
                                                "floor": "8º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-803",
                                                "name": "Sala 803",
                                                "unit": 2,
                                                "floor": "8º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-804",
                                                "name": "Sala 804",
                                                "unit": 2,
                                                "floor": "8º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-901",
                                                "name": "Sala 901",
                                                "unit": 2,
                                                "floor": "9º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-902",
                                                "name": "Sala 902",
                                                "unit": 2,
                                                "floor": "9º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-903",
                                                "name": "Sala 903",
                                                "unit": 2,
                                                "floor": "9º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "u2-904",
                                                "name": "Sala 904",
                                                "unit": 2,
                                                "floor": "9º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "setor-ss3",
                                                "name": "Terceiro Subsolo",
                                                "unit": 3,
                                                "floor": "Subsolo",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "setor-container",
                                                "name": "Container",
                                                "unit": 3,
                                                "floor": "Externa",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "setor-r1",
                                                "name": "Sala de Reunião 1",
                                                "unit": 3,
                                                "floor": "Salas de Reunião",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "setor-r2",
                                                "name": "Sala de Reunião 2",
                                                "unit": 3,
                                                "floor": "Salas de Reunião",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "setor-r3",
                                                "name": "Sala de Reunião 3",
                                                "unit": 3,
                                                "floor": "Salas de Reunião",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "setor-r4",
                                                "name": "Sala de Reunião 4",
                                                "unit": 3,
                                                "floor": "Salas de Reunião",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "setor-r5",
                                                "name": "Sala de Reunião 5",
                                                "unit": 3,
                                                "floor": "Salas de Reunião",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "setor-r6",
                                                "name": "Sala de Reunião 6",
                                                "unit": 3,
                                                "floor": "Salas de Reunião",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "setor-r7",
                                                "name": "Sala de Reunião 7",
                                                "unit": 3,
                                                "floor": "Salas de Reunião",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "setor-r8",
                                                "name": "Sala de Reunião 8",
                                                "unit": 3,
                                                "floor": "Salas de Reunião",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "setor-r9",
                                                "name": "Sala de Reunião 9",
                                                "unit": 3,
                                                "floor": "Salas de Reunião",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "setor-r10",
                                                "name": "Sala de Reunião 10",
                                                "unit": 3,
                                                "floor": "Salas de Reunião",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "setor-r11",
                                                "name": "Sala de Reunião 11",
                                                "unit": 3,
                                                "floor": "Salas de Reunião",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "setor-rooftop",
                                                "name": "Rooftop",
                                                "unit": 3,
                                                "floor": "Cobertura",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "setor-11",
                                                "name": "11º Andar",
                                                "unit": 3,
                                                "floor": "11º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "setor-4",
                                                "name": "4º Andar",
                                                "unit": 3,
                                                "floor": "4º Andar",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "setor-coord",
                                                "name": "Coordenação School",
                                                "unit": 3,
                                                "floor": "Administrativo",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                },
                                {
                                                "id": "setor-help",
                                                "name": "Help Center",
                                                "unit": 3,
                                                "floor": "Administrativo",
                                                "equip": {
                                                                "proj": "",
                                                                "amp": "",
                                                                "sender": "",
                                                                "recv": "",
                                                                "obs": "",
                                                                "obsLevel": "ok"
                                                }
                                }
                ],
                "settings": {
                                "threshold": 5,
                                "buyerEmail": "compras@suaempresa.com.br"
                }
};
            const seedUsers = () => structuredClone(DEFAULT_BOOTSTRAP.users || []);

            const normalizeRole = (role) => {
                const value = String(role || "").trim().toLowerCase();
                if (["admin", "administrator", "administrador"].includes(value)) return "Administrador";
                if (["dev", "developer", "desenvolvedor", "t1"].includes(value)) return "Desenvolvedor";
                if (["operator", "operador"].includes(value)) return "Operador";
                if (["guest", "visitante", "convidado"].includes(value)) return "Convidado";
                return role ? String(role) : "Convidado";
            };

            const SESSION_COLLABORATORS = Object.freeze(["Evandro", "Lucas", "Guilherme", "Marcos"]);
            let pendingAdminLoginPayload = null;
            const normalizeComparableName = (value = "") => String(value || "").trim().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
            const resolveSessionCollaboratorName = (value = "") => {
                const wanted = normalizeComparableName(value);
                return SESSION_COLLABORATORS.find((name) => normalizeComparableName(name) === wanted) || "";
            };
            const isPrivilegedRole = (role) => ["Administrador", "Desenvolvedor"].includes(normalizeRole(role));

            const isNamedAdminSession = (userLike = {}) => {
                const normalizedRole = normalizeRole(userLike?.role);
                const normalizedId = String(userLike?.id || "").trim().toLowerCase();
                const normalizedName = String(userLike?.name || "").trim().toLowerCase();
                return ["admin", "dev.gui"].includes(normalizedId) && isPrivilegedRole(normalizedRole) && !!normalizedName && !["admin", "administrador", "desenvolvedor", "dev.gui"].includes(normalizedName);
            };

            const getHeaderRoleLabel = (userLike = {}) => {
                if (isNamedAdminSession(userLike)) return normalizeRole(userLike?.role) === "Desenvolvedor" ? "Modo DEV" : "Modo ADM";
                return normalizeRole(userLike?.role);
            };

            let state = {
                currentUser: null,
                currentView: "dashboard",
                selectedItem: null,
                selectedRoomLogId: null,
                selectedUserLogId: null,
                usersFiltersOpen: false,
                infraFilter: "all",
                infraSearch: "",
                infraUnit: 1,
                infraToolbarCollapsed: false,
                users: seedUsers(),
                inventory: structuredClone(DEFAULT_BOOTSTRAP.inventory || []),
                movements: structuredClone(DEFAULT_BOOTSTRAP.movements || []),
                infraRooms: structuredClone(DEFAULT_BOOTSTRAP.infraRooms || []),
                settings: structuredClone(DEFAULT_BOOTSTRAP.settings || { threshold: 5, buyerEmail: "compras@suaempresa.com.br" }),
                maintenanceRecords: structuredClone(DEFAULT_BOOTSTRAP.settings?.maintenanceRecords || []),
                activityLogs: [],
                purchaseNeeds: [],
            };


            const readStoredBookmark = () => {
                try {
                    return localStorage.getItem(REMOTE_BOOKMARK_KEY) || "";
                } catch {
                    return "";
                }
            };

            const persistBookmark = (bookmark) => {
                const nextBookmark = typeof bookmark === "string" ? bookmark.trim() : "";
                remoteBookmark = nextBookmark;
                try {
                    if (nextBookmark) localStorage.setItem(REMOTE_BOOKMARK_KEY, nextBookmark);
                } catch {}
            };

            const fetchJson = async (url, options = {}) => {
                const headers = new Headers(options.headers || {});
                const response = await fetch(url, { cache: "no-store", credentials: "same-origin", ...options, headers });
                const payload = await response.json().catch(() => ({}));
                if (!response.ok) {
                    const error = new Error(payload.error || `HTTP ${response.status}`);
                    error.status = response.status;
                    error.payload = payload;
                    throw error;
                }
                return payload;
            };

            const readPendingQueue = () => {
                try {
                    const raw = localStorage.getItem(LOCAL_PENDING_QUEUE_KEY);
                    const parsed = raw ? JSON.parse(raw) : [];
                    return Array.isArray(parsed) ? parsed : [];
                } catch (error) {
                    console.warn("Falha ao ler fila offline.", error);
                    return [];
                }
            };

            const writePendingQueue = (queue) => {
                try {
                    localStorage.setItem(LOCAL_PENDING_QUEUE_KEY, JSON.stringify(Array.isArray(queue) ? queue : []));
                } catch (error) {
                    console.warn("Falha ao salvar fila offline.", error);
                }
            };

            const enqueuePendingMutation = (mutation) => {
                const queue = readPendingQueue();
                queue.push({
                    id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    createdAt: new Date().toISOString(),
                    ...mutation,
                });
                writePendingQueue(queue.slice(-50));
            };

            const clearPendingQueue = () => writePendingQueue([]);

            const enqueuePendingStateMutation = (keys, payload) => {
                const filteredKeys = Array.from(new Set((keys || []).filter(Boolean)));
                if (!filteredKeys.length || !payload || typeof payload !== "object") return;
                enqueuePendingMutation({ type: "state", keys: filteredKeys, payload, syncEvent: getLatestSyncEvent() });
            };

            const flushPendingMutations = async () => {
                if (!remoteStateReady || !state.currentUser?.id || !navigator.onLine) return false;
                const queue = readPendingQueue();
                if (!queue.length) return false;
                const remaining = [];
                let changed = false;
                for (const mutation of queue) {
                    try {
                        if (mutation.type === "state") {
                            const payload = await fetchJson(`${API_BASE}/state`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ state: mutation.payload || {}, syncEvent: mutation.syncEvent || null }),
                            });
                            if (payload?.state) {
                                remoteApplyingState = true;
                                applyRemoteState(payload.state || {});
                                remoteApplyingState = false;
                                setRemoteStateVersion(payload.stateVersion);
                                setRemoteChangeCursor(payload.lastChangeId);
                                syncCurrentUserFromState();
                                notifyLocalSyncChannel({ type: "mutation-applied", sourceUserId: state.currentUser?.id || null, at: Date.now() });
                                changed = true;
                            }
                        } else if (mutation.type === "infra-room") {
                            const payload = await fetchJson(`${API_BASE}/infra/rooms/${encodeURIComponent(mutation.roomId)}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ equip: mutation.equip || {} }),
                            });
                            if (payload?.state) {
                                remoteApplyingState = true;
                                applyRemoteState(payload.state || {});
                                remoteApplyingState = false;
                                setRemoteStateVersion(payload.stateVersion);
                                setRemoteChangeCursor(payload.lastChangeId);
                                syncCurrentUserFromState();
                                notifyLocalSyncChannel({ type: "mutation-applied", sourceUserId: state.currentUser?.id || null, at: Date.now() });
                                changed = true;
                            }
                        }
                    } catch (error) {
                        if (error?.status === 401 || error?.status === 403) {
                            remaining.push(mutation);
                            break;
                        }
                        remaining.push(mutation);
                    }
                }
                writePendingQueue(remaining);
                if (changed) {
                    computeData();
                    renderCurrentView();
                    showToast("Alterações locais sincronizadas com o servidor.", "success");
                }
                return changed;
            };

            const setRemoteStateVersion = (version) => {
                if (version !== undefined && version !== null && version !== "") remoteStateVersion = String(version);
            };

            const setRemoteChangeCursor = (cursor) => {
                const numericCursor = Number(cursor || 0);
                if (Number.isFinite(numericCursor) && numericCursor >= 0) remoteChangeCursor = numericCursor;
            };

            const rememberSeenRealtimeToast = (changeId) => {
                const numericId = Number(changeId || 0);
                if (!numericId) return false;
                if (seenRealtimeToastIds.has(numericId)) return false;
                seenRealtimeToastIds.add(numericId);
                if (seenRealtimeToastIds.size > 120) {
                    const first = seenRealtimeToastIds.values().next().value;
                    seenRealtimeToastIds.delete(first);
                }
                return true;
            };

            const getLatestSyncEvent = () => Array.isArray(state.activityLogs) && state.activityLogs.length ? state.activityLogs[0] : null;

            const notifyLocalSyncChannel = (payload) => {
                try {
                    if (localSyncChannel) localSyncChannel.postMessage(payload);
                } catch (error) {
                    console.warn("Falha ao notificar canal local de sincronização.", error);
                }
            };



            if (localSyncChannel) {
                localSyncChannel.onmessage = (event) => {
                    if (!state.currentUser?.id) return;
                    const data = event?.data || {};
                    if (data?.type === "mutation-applied" || data?.type === "remote-sync") {
                        runGlobalSync("broadcast", { emitRemoteToasts: true, forceState: true }).catch(() => {});
                    }
                };
            }

            const markRemoteStateDirty = (...keys) => {
                keys.flat().filter(Boolean).forEach((key) => remoteDirtyKeys.add(key));
            };

            const clearRemoteStateDirty = (keys = []) => {
                keys.forEach((key) => remoteDirtyKeys.delete(key));
            };

            const syncCurrentUserFromState = () => {
                if (!state.currentUser?.id) return;
                const fresh = getUserById(state.currentUser.id);
                if (!fresh || fresh.status !== "active") {
                    showToast("Sua sessão foi atualizada e o acesso não está mais disponível.", "error");
                    handleLogout();
                    return;
                }
                state.currentUser.role = normalizeRole(fresh.role);
                state.currentUser.name = state.currentUser.name || fresh.name || state.currentUser.id;
                syncSessionDisplayName();
                setTextIfPresent("header-username", state.currentUser.name || fresh.name || state.currentUser.id, { warn: true });
                setTextIfPresent("header-role", getHeaderRoleLabel({ id: state.currentUser.id, role: fresh.role, name: state.currentUser.name || fresh.name }), { warn: true });
                updatePermissionsUI();
                syncLocalCaches();
            };

            const getRealtimeSocketUrl = () => {
                const url = new URL(`${API_BASE}/realtime`, window.location.origin);
                url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
                return url.toString();
            };

            const stopRealtimeSocket = (code = 1000, reason = "client-close") => {
                if (remoteSocketReconnectTimer) {
                    clearTimeout(remoteSocketReconnectTimer);
                    remoteSocketReconnectTimer = null;
                }
                remoteSocketConnecting = false;
                if (remoteSocket) {
                    try {
                        remoteSocket.onopen = null;
                        remoteSocket.onmessage = null;
                        remoteSocket.onerror = null;
                        remoteSocket.onclose = null;
                        if (remoteSocket.readyState === WebSocket.OPEN || remoteSocket.readyState === WebSocket.CONNECTING) {
                            remoteSocket.close(code, reason);
                        }
                    } catch (error) {
                        console.warn("Falha ao encerrar WebSocket.", error);
                    }
                }
                remoteSocket = null;
            };

            const applyPushedGlobalSync = (payload, options = {}) => {
                if (!payload || typeof payload !== "object") return false;
                const pushedChanges = [];
                if (payload.change && typeof payload.change === "object") pushedChanges.push(payload.change);
                if (Array.isArray(payload.changes)) pushedChanges.push(...payload.changes.filter(Boolean));
                if (payload.stateVersion) setRemoteStateVersion(payload.stateVersion);
                if (payload.lastChangeId !== undefined) setRemoteChangeCursor(payload.lastChangeId);
                if (payload.state && typeof payload.state === "object") {
                    remoteApplyingState = true;
                    applyRemoteState(payload.state, {
                        emitRemoteToasts: options.emitRemoteToasts !== false,
                        source: options.source || "push",
                        changes: pushedChanges,
                    });
                    remoteApplyingState = false;
                    syncCurrentUserFromState();
                    computeData();
                    renderCurrentView();
                    syncLocalCaches();
                    lastAuthoritativeSyncAt = Date.now();
                    notifyLocalSyncChannel({ type: "remote-sync", sourceUserId: pushedChanges[0]?.actorId || null, at: Date.now(), lastChangeId: payload.lastChangeId || pushedChanges[0]?.id || 0 });
                    return true;
                }
                if (pushedChanges.length) {
                    emitRealtimeChangeToasts(pushedChanges, { emitRemoteToasts: options.emitRemoteToasts !== false });
                    return true;
                }
                return false;
            };

            const queueRealtimeRefresh = (payload) => {
                if (!payload) return;
                if (payload?.state && applyPushedGlobalSync(payload, { emitRemoteToasts: true, source: "realtime-push" })) {
                    return;
                }
                const change = payload?.change || payload;
                if (change?.id) setRemoteChangeCursor(Math.max(Number(remoteChangeCursor || 0), Number(change.id || 0)));
                pendingRealtimeChanges.push(change);
                if (remoteRefreshQueued) return;
                remoteRefreshQueued = true;
                setTimeout(async () => {
                    const batchedChanges = pendingRealtimeChanges.slice();
                    pendingRealtimeChanges = [];
                    remoteRefreshQueued = false;
                    try {
                        await runGlobalSync("realtime", { emitRemoteToasts: true, queuedChanges: batchedChanges, forceState: true });
                    } catch (error) {
                        console.warn("Falha ao aplicar atualização em tempo real.", error);
                    }
                }, 60);
            };

            const runGlobalSync = async (reason = "poll", options = {}) => {
                if (logoutInFlight) return null;
                if (!remoteStateReady || !state.currentUser?.id || !navigator.onLine) return null;
                if (remoteSyncInFlight && !options.forceState) return null;
                remoteSyncInFlight = true;
                try {
                    await flushPendingMutations();
                    const previousChangeCursor = Number(remoteChangeCursor || 0);
                    const previousStateVersion = String(remoteStateVersion || "");

                    const meta = await fetchJson(`${API_BASE}/state/meta?_ts=${Date.now()}`, { method: "GET" });
                    const metaChangeCursor = Number(meta?.lastChangeId || 0);
                    const metaStateVersion = String(meta?.stateVersion || previousStateVersion || "");
                    if (typeof meta?.realtimeEnabled === "boolean") remoteRealtimeEnabled = !!meta.realtimeEnabled;

                    const mustRefresh = !!options.forceState
                        || metaChangeCursor > previousChangeCursor
                        || (metaStateVersion && metaStateVersion !== previousStateVersion);

                    if (!mustRefresh) {
                        return meta;
                    }

                    const payload = await fetchJson(`${API_BASE}/changes?after=${encodeURIComponent(previousChangeCursor)}&_ts=${Date.now()}`, { method: "GET" });
                    const combinedChanges = Array.isArray(options.queuedChanges) ? options.queuedChanges.slice() : [];
                    if (Array.isArray(payload?.changes) && payload.changes.length) combinedChanges.push(...payload.changes);

                    if (payload?.stateVersion) setRemoteStateVersion(payload.stateVersion);
                    else if (metaStateVersion) setRemoteStateVersion(metaStateVersion);
                    if (payload?.lastChangeId !== undefined) setRemoteChangeCursor(payload.lastChangeId);
                    else setRemoteChangeCursor(metaChangeCursor);

                    let authoritativeState = payload?.state;
                    if (!authoritativeState || typeof authoritativeState !== "object") {
                        const statePayload = await fetchJson(`${API_BASE}/state?_ts=${Date.now()}`, { method: "GET" });
                        authoritativeState = statePayload?.state || null;
                        if (statePayload?.stateVersion) setRemoteStateVersion(statePayload.stateVersion);
                        if (statePayload?.lastChangeId !== undefined) setRemoteChangeCursor(statePayload.lastChangeId);
                    }

                    if (logoutInFlight) return null;
                    if (authoritativeState && typeof authoritativeState === "object") {
                        remoteApplyingState = true;
                        applyRemoteState(authoritativeState, {
                            emitRemoteToasts: !!options.emitRemoteToasts,
                            source: reason,
                            changes: combinedChanges,
                        });
                        remoteApplyingState = false;
                        syncCurrentUserFromState();
                        computeData();
                        renderCurrentView();
                        syncLocalCaches();
                        lastAuthoritativeSyncAt = Date.now();
                    } else if (combinedChanges.length && options.emitRemoteToasts) {
                        emitRealtimeChangeToasts(combinedChanges, { emitRemoteToasts: true });
                    }

                    return payload;
                } catch (error) {
                    remoteApplyingState = false;
                    throw error;
                } finally {
                    remoteSyncInFlight = false;
                }
            };

            const scheduleRealtimeReconnect = () => {
                if (!state.currentUser?.id || !navigator.onLine) return;
                if (remoteSocketReconnectTimer) return;
                const delay = Math.min(REMOTE_SOCKET_RETRY_MAX_MS, Math.round(REMOTE_SOCKET_RETRY_BASE_MS * Math.pow(1.6, remoteSocketReconnectAttempts || 0)));
                remoteSocketReconnectAttempts = Math.min(remoteSocketReconnectAttempts + 1, 8);
                remoteSocketReconnectTimer = setTimeout(() => {
                    remoteSocketReconnectTimer = null;
                    runGlobalSync("online", { emitRemoteToasts: false, forceState: true })
                        .catch(() => {})
                        .finally(() => {
                            connectRealtimeSocket();
                        });
                }, delay);
            };

            const connectRealtimeSocket = () => {
                if (logoutInFlight) return;
                if (!remoteRealtimeEnabled) return;
                if (!remoteStateReady || !state.currentUser?.id || !navigator.onLine) return;
                if (remoteSocketConnecting) return;
                if (remoteSocket && (remoteSocket.readyState === WebSocket.OPEN || remoteSocket.readyState === WebSocket.CONNECTING)) return;
                remoteSocketConnecting = true;
                try {
                    const socket = new WebSocket(getRealtimeSocketUrl());
                    remoteSocket = socket;
                    socket.onopen = () => {
                        remoteSocketConnecting = false;
                        remoteSocketReconnectAttempts = 0;
                        runGlobalSync("socket-open", { emitRemoteToasts: false, forceState: true }).catch((error) => console.warn("Falha ao alinhar estado após conexão em tempo real.", error));
                    };
                    socket.onmessage = async (event) => {
                        try {
                            const parsed = JSON.parse(event.data || "{}");
                            if (parsed?.type === "sync-event" && parsed.payload) {
                                queueRealtimeRefresh(parsed.payload);
                                return;
                            }
                            if (parsed?.type === "hello") {
                                return;
                            }
                        } catch (error) {
                            console.warn("Mensagem em tempo real inválida.", error);
                        }
                    };
                    socket.onerror = () => {
                        remoteSocketConnecting = false;
                    };
                    socket.onclose = () => {
                        remoteSocketConnecting = false;
                        if (remoteSocket === socket) remoteSocket = null;
                        scheduleRealtimeReconnect();
                    };
                } catch (error) {
                    remoteSocketConnecting = false;
                    console.warn("Falha ao iniciar WebSocket.", error);
                    scheduleRealtimeReconnect();
                }
            };

            const startRemotePolling = () => {
                if (logoutInFlight) return;
                if (remotePullTimer) clearInterval(remotePullTimer);
                if (!remoteStateReady || !state.currentUser?.id) return;

                connectRealtimeSocket();

                const pollRemoteChanges = async (emitRemoteToasts = true) => {
                    if (!state.currentUser?.id || !navigator.onLine) return;
                    try {
                        await runGlobalSync("poll", { emitRemoteToasts, forceState: false });
                    } catch (error) {
                        console.warn("Falha ao sincronizar alterações remotas.", error);
                    }
                };
                pollRemoteChanges(false);
                const interval = document.hidden ? REMOTE_BACKGROUND_POLL_INTERVAL_MS : REMOTE_POLL_INTERVAL_MS;
                remotePullTimer = setInterval(() => pollRemoteChanges(true), interval);
            };

            const stopRemotePolling = () => {
                if (remotePullTimer) clearInterval(remotePullTimer);
                remotePullTimer = null;
                stopRealtimeSocket();
            };

            const getRemoteStatePayload = (keys = []) => {
                const requestedKeys = Array.from(new Set((keys || []).filter(Boolean)));
                if (!requestedKeys.length) return {};
                const payload = {};
                if (requestedKeys.includes("inventory")) payload.inventory = state.inventory;
                if (requestedKeys.includes("movements")) payload.movements = state.movements;
                if (requestedKeys.includes("infraRooms")) payload.infraRooms = state.infraRooms;
                if (requestedKeys.includes("settings")) {
                    syncMaintenanceSettings();
                    payload.settings = state.settings;
                }
                if (requestedKeys.includes("activityLogs")) payload.activityLogs = state.activityLogs;
                return payload;
            };

            const clearLocalCache = () => {
                try {
                    localStorage.removeItem(LOCAL_CACHE_KEY);
                } catch (error) {
                    console.warn("Falha ao limpar cache local.", error);
                }
            };

            const buildLocalCacheSnapshot = () => ({
                schema: 1,
                cachedAt: new Date().toISOString(),
                stateVersion: remoteStateVersion,
                lastChangeId: remoteChangeCursor,
                currentUser: state.currentUser ? { id: state.currentUser.id, role: normalizeRole(state.currentUser.role), name: state.currentUser.name || state.currentUser.id } : null,
                currentView: state.currentView || null,
                data: {
                    users: state.users,
                    inventory: state.inventory,
                    movements: state.movements,
                    infraRooms: state.infraRooms,
                    settings: state.settings,
                    activityLogs: state.activityLogs,
                },
            });

            const loadLocalCache = () => {
                try {
                    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
                    if (!raw) return null;
                    const parsed = JSON.parse(raw);
                    if (!parsed?.data || !parsed?.currentUser) return null;
                    const ageMs = parsed?.cachedAt ? Date.now() - new Date(parsed.cachedAt).getTime() : Number.POSITIVE_INFINITY;
                    if (!Number.isFinite(ageMs) || ageMs > LOCAL_CACHE_TTL_MS) {
                        clearLocalCache();
                        return null;
                    }
                    return parsed;
                } catch (error) {
                    console.warn("Falha ao ler cache local.", error);
                    clearLocalCache();
                    return null;
                }
            };

            const syncLocalCaches = () => {
                try {
                    if (!state.currentUser?.id) return clearLocalCache();
                    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(buildLocalCacheSnapshot()));
                } catch (error) {
                    console.warn("Falha ao sincronizar cache local.", error);
                }
            };

            const getRemoteNotificationMessage = (log) => {
                if (!log) return null;
                if (log.section === "inventory" && log.action === "create") return "Um item foi adicionado.";
                if (log.section === "inventory" && ["in", "out", "edit", "delete", "movement", "update"].includes(log.action)) return "O estoque foi atualizado.";
                if (log.section === "maintenance") return "A manutencao foi atualizada.";
                if (log.section === "infra") return "Uma sala foi notificada.";
                if (log.section === "users") return "As permissões de um usuário foram atualizadas.";
                if (log.section === "purchases") return "Uma requisição foi atualizada.";
                return "O sistema recebeu uma atualização.";
            };

            const emitRemoteLogToasts = (previousLogs = [], nextLogs = [], options = {}) => {
                if (!options.emitRemoteToasts || !state.currentUser?.id) return;
                const previousIds = new Set((previousLogs || []).map((log) => log?.id).filter(Boolean));
                const incomingLogs = (nextLogs || [])
                    .filter((log) => log?.id && !previousIds.has(log.id))
                                        .slice(0, 3)
                    .reverse();
                incomingLogs.forEach((log) => {
                    const message = getRemoteNotificationMessage(log) || log.message || "O sistema recebeu uma atualização.";
                    showToast(message, "info");
                });
            };

            const emitRealtimeChangeToasts = (changes = [], options = {}) => {
                if (!options.emitRemoteToasts || !state.currentUser?.id || !Array.isArray(changes) || !changes.length) return;
                changes
                    .filter((change) => change)
                    .slice(-4)
                    .forEach((change) => {
                        const changeId = Number(change?.id || 0);
                        if (changeId && !rememberSeenRealtimeToast(changeId)) return;
                        const message = change.message || getRemoteNotificationMessage(change) || "O sistema recebeu uma atualização.";
                        showToast(message, "info");
                    });
            };

            const fetchAuthoritativeState = async (reason = "sync", options = {}) => {
                return runGlobalSync(reason, { emitRemoteToasts: !!options.emitRemoteToasts, queuedChanges: options.changes || [], forceState: true });
            };

            const applyRemoteState = (payload, options = {}) => {
                if (logoutInFlight) return;
                if (!payload || typeof payload !== "object") return;
                const previousLogs = Array.isArray(state.activityLogs) ? [...state.activityLogs] : [];
                if (Array.isArray(payload.users)) state.users = payload.users.map((user) => ({ ...user, role: normalizeRole(user.role) }));
                if (Array.isArray(payload.inventory)) state.inventory = normalizeInventoryItems(payload.inventory);
                if (Array.isArray(payload.movements)) state.movements = payload.movements;
                if (Array.isArray(payload.infraRooms)) state.infraRooms = normalizeInfraRooms(payload.infraRooms);
                if (payload.settings && typeof payload.settings === "object") {
                    state.settings = payload.settings;
                    state.maintenanceRecords = normalizeMaintenanceRecords(state.settings.maintenanceRecords || []);
                }
                if (Array.isArray(payload.activityLogs)) state.activityLogs = payload.activityLogs;
                syncSessionDisplayName();
                syncLocalCaches();
                if (Array.isArray(options.changes) && options.changes.length) {
                    emitRealtimeChangeToasts(options.changes || [], options);
                } else {
                    emitRemoteLogToasts(previousLogs, state.activityLogs, options);
                }
            };

            const persistRemoteState = async (force = false) => {
                if (logoutInFlight) return null;
                if (!remoteStateReady || remotePersistRunning) return null;
                if (!force && !state.currentUser?.id) return null;
                const dirtyKeys = Array.from(remoteDirtyKeys);
                if (!dirtyKeys.length) return null;
                const statePayload = getRemoteStatePayload(dirtyKeys);
                if (!navigator.onLine) {
                    enqueuePendingStateMutation(dirtyKeys, statePayload);
                    clearRemoteStateDirty(dirtyKeys);
                    showToast("Sem conexão. Alterações salvas localmente para sincronizar depois.", "info");
                    return { queued: true };
                }
                remotePersistRunning = true;
                try {
                    const payload = await fetchJson(`${API_BASE}/state`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ state: statePayload, syncEvent: getLatestSyncEvent() }),
                    });
                    clearRemoteStateDirty(dirtyKeys);
                    if (payload?.state) {
                        remoteApplyingState = true;
                        applyRemoteState(payload.state);
                        remoteApplyingState = false;
                        setRemoteStateVersion(payload.stateVersion);
                        setRemoteChangeCursor(payload.lastChangeId);
                        syncCurrentUserFromState();
                        notifyLocalSyncChannel({ type: "mutation-applied", sourceUserId: state.currentUser?.id || null, at: Date.now(), lastChangeId: payload.lastChangeId || 0 });
                    }
                    return payload;
                } catch (error) {
                    remoteApplyingState = false;
                    enqueuePendingStateMutation(dirtyKeys, statePayload);
                    clearRemoteStateDirty(dirtyKeys);
                    console.warn("Falha ao persistir estado remoto.", error);
                    showToast("Servidor indisponível. Alteração guardada para sincronização.", "warning");
                    return null;
                } finally {
                    remotePersistRunning = false;
                }
            };

            const queueRemoteStatePersist = (...keys) => {
                markRemoteStateDirty(...keys);
                syncLocalCaches();
                if (!remoteStateReady || !state.currentUser?.id) return;
                clearTimeout(remotePersistTimer);
                remotePersistTimer = setTimeout(() => {
                    persistRemoteState().catch((error) => console.warn("Persistência remota falhou.", error));
                }, 120);
            };

            const initializeRemoteSession = async () => {
                if (logoutInFlight) return null;
                try {
                    const payload = await fetchJson(`${API_BASE}/bootstrap?_ts=${Date.now()}`, { method: "GET" });
                    applyRemoteState(payload.state || payload, { source: "bootstrap" });
                    setRemoteStateVersion(payload.stateVersion);
                    setRemoteChangeCursor(payload.lastChangeId);
                    remoteRealtimeEnabled = !!payload.realtimeEnabled;
                    remoteStateReady = true;
                    if (payload.sessionUser?.id) await flushPendingMutations();
                    return payload.sessionUser || null;
                } catch (error) {
                    if (error?.status === 401) {
                        remoteStateReady = true;
                        return null;
                    }
                    console.warn("Modo remoto indisponível.", error);
                    remoteStateReady = false;
                    return bootedFromLocalCache && state.currentUser?.id ? { ...state.currentUser, offlineCache: true } : null;
                }
            };

            window.addEventListener("beforeunload", () => {
                if (!remoteStateReady || !state.currentUser?.id) return;
                const dirtyKeys = Array.from(remoteDirtyKeys);
                if (!dirtyKeys.length) return;
                try {
                    const blob = new Blob([JSON.stringify({ state: getRemoteStatePayload(dirtyKeys) })], { type: "application/json" });
                    navigator.sendBeacon(`${API_BASE}/state`, blob);
                } catch (error) {
                    console.warn("Falha no beacon de persistência.", error);
                }
            });

            setInterval(() => {
                if (remoteStateReady && state.currentUser?.id) persistRemoteState().catch(() => {});
            }, 6000);

            document.addEventListener("visibilitychange", () => {
                if (remoteStateReady && state.currentUser?.id) {
                    startRemotePolling();
                    connectRealtimeSocket();
                    if (!document.hidden) runGlobalSync("visible", { emitRemoteToasts: false, forceState: true }).catch(() => {});
                }
                if (!document.hidden && remoteStateReady && state.currentUser?.id) {
                    flushPendingMutations()
                        .catch(() => {})
                        .finally(() => {
                            runGlobalSync("focus", { emitRemoteToasts: false, forceState: true }).catch((error) => console.warn("Falha ao atualizar ao focar a aba.", error));
                        });
                }
            });

            window.addEventListener("online", () => {
                connectRealtimeSocket();
                flushPendingMutations()
                    .then(() => runGlobalSync("online", { emitRemoteToasts: false, forceState: true }))
                    .catch((error) => console.warn("Falha ao esvaziar fila offline.", error));
                runGlobalSync("online", { emitRemoteToasts: false, forceState: true }).catch(() => {});
            });

            window.addEventListener("offline", () => {
                stopRealtimeSocket(1000, "offline");
            });

            const EQUIPMENT_CONFIG = [
                { key: "proj", label: "Projetor", short: "Proj", icon: "projector" },
                { key: "amp", label: "Amp", short: "Amp", icon: "speaker" },
                { key: "sender", label: "Sender", short: "Send", icon: "router" },
                { key: "recv", label: "Receiver", short: "Recv", icon: "cast" },
            ];

            const QUALITY_META = {
                good: {
                    label: "Bom",
                    dot: "bg-green-500",
                    badge: "bg-green-500/15 text-green-700 dark:text-green-300 border-green-400/30",
                    card: "border-green-500/35 bg-green-500/[0.08]",
                },
                keep: {
                    label: "Dá pra manter",
                    dot: "bg-amber-500",
                    badge: "bg-amber-500/15 text-amber-300 border-amber-400/30",
                    card: "border-amber-500/40 bg-amber-500/[0.075]",
                },
                replace: {
                    label: "Trocar",
                    dot: "bg-red-500",
                    badge: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-400/30",
                    card: "border-red-500/40 bg-red-500/[0.08]",
                },
                absent: {
                    label: "Ausente",
                    dot: "bg-zinc-400 dark:bg-zinc-600",
                    badge: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700",
                    card: "border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/30",
                },
            };

            const QUALITY_BUTTON_ACTIVE_CLASSES = {
                good: "quality-state-good",
                keep: "quality-state-keep",
                replace: "quality-state-replace",
                absent: "quality-state-absent",
            };
            const QUALITY_BUTTON_IDLE_CLASS = "quality-state-idle";

            const getEquipmentQualityKey = (key) => `${key}Quality`;
            const normalizeEquipmentQuality = (value, fallback = "absent") => {
                const normalized = normalizeComparableName(value || "");
                const compact = normalized.replace(/[^a-z0-9]/g, "");
                if (["good", "ok", "bom", "boa", "verde", "green", "funcionando"].includes(normalized) || compact === "embomestado") return "good";
                if (["keep", "warning", "warn", "yellow", "amarelo"].includes(normalized) || compact.includes("manter") || compact.includes("atencao")) return "keep";
                if (["replace", "danger", "critical", "red", "vermelho"].includes(normalized) || compact.includes("trocar") || compact.includes("substituir")) return "replace";
                if (["absent", "none", "missing", "cinza", "ausente", "sem", "vazio"].includes(normalized)) return "absent";
                return fallback;
            };
            const getQualityMeta = (value) => QUALITY_META[normalizeEquipmentQuality(value)] || QUALITY_META.absent;
            const ensureRoomEquipmentState = (room) => {
                if (!room.equip) room.equip = {};
                EQUIPMENT_CONFIG.forEach(({ key }) => {
                    if (typeof room.equip[key] !== "string") room.equip[key] = "";
                    const qualityKey = getEquipmentQualityKey(key);
                    room.equip[qualityKey] = normalizeEquipmentQuality(room.equip[qualityKey], room.equip[key] ? "good" : "absent");
                });
                if (typeof room.equip.obs !== "string") room.equip.obs = "";
                room.equip.obsLevel = computeRoomObsLevel(room);
                return room;
            };
            const normalizeInfraRooms = (rooms) => (Array.isArray(rooms) ? rooms.map((room) => ensureRoomEquipmentState(room)) : []);
            const getRoomEquipmentEntries = (room) =>
                EQUIPMENT_CONFIG.map((config) => {
                    const quality = normalizeEquipmentQuality(room.equip[getEquipmentQualityKey(config.key)], room.equip[config.key] ? "good" : "absent");
                    return {
                        ...config,
                        value: room.equip[config.key] || "",
                        quality,
                        meta: getQualityMeta(quality),
                    };
                });
            const computeRoomObsLevel = (room) => {
                const levels = getRoomEquipmentEntries(room).map((entry) => entry.quality);
                if (levels.includes("replace")) return "danger";
                if (levels.includes("keep")) return "warning";
                if (levels.includes("good")) return "ok";
                return "ok";
            };
            const getRoomBorderColor = (room) => {
                const level = computeRoomObsLevel(room);
                if (level === "danger") return "border-red-500/70";
                if (level === "warning") return "border-amber-400/70";
                return "border-green-500/45";
            };
            const getRoomStatusIndicator = (room) => {
                const entries = getRoomEquipmentEntries(room);
                if (entries.some((entry) => entry.quality === "replace")) return '<span class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>';
                if (entries.some((entry) => entry.quality === "keep")) return '<span class="w-3 h-3 rounded-full bg-amber-400"></span>';
                if (entries.some((entry) => entry.quality === "good")) return '<span class="w-2 h-2 rounded-full bg-green-500"></span>';
                return '<span class="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>';
            };
            const saveInfraRooms = () => { queueRemoteStatePersist("infraRooms"); };
            const loadInfraRooms = () => { state.infraRooms = normalizeInfraRooms(state.infraRooms); };

            const saveUsers = () => {};
            const saveActivityLogs = () => { if (!remoteApplyingState) queueRemoteStatePersist("activityLogs"); };
            const seedActivityLogs = () =>
                state.users.map((user, index) => ({
                    id: `seed-log-${index + 1}`,
                    actorId: "admin",
                    targetUserId: user.id,
                    section: "users",
                    action: "seed",
                    message: `Conta ${user.id === state.currentUser?.id ? (state.currentUser?.name || user.name) : user.name} disponível para acesso no sistema.`,
                    createdAt: new Date(Date.now() - (index + 1) * 3600000).toISOString(),
                }));
            const loadUsers = () => { state.users = state.users.map((user) => ({ ...user, role: normalizeRole(user.role) })); };
            const loadActivityLogs = () => { if (!Array.isArray(state.activityLogs)) state.activityLogs = seedActivityLogs(); };
            const syncInfraRoomRemotely = async (roomId) => {
                const room = getRoomById(roomId);
                if (!state.currentUser?.id || !room) return false;
                if (!remoteStateReady || !navigator.onLine) {
                    enqueuePendingMutation({ type: "infra-room", roomId, equip: room.equip });
                    showToast("Sala salva localmente. Será sincronizada quando a conexão voltar.", "info");
                    return false;
                }
                try {
                    const payload = await fetchJson(`${API_BASE}/infra/rooms/${encodeURIComponent(roomId)}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ equip: room.equip }),
                    });
                    remoteApplyingState = true;
                    applyRemoteState(payload.state || {});
                    remoteApplyingState = false;
                    setRemoteStateVersion(payload.stateVersion);
                    setRemoteChangeCursor(payload.lastChangeId);
                    syncCurrentUserFromState();
                    notifyLocalSyncChannel({ type: "mutation-applied", sourceUserId: state.currentUser?.id || null, at: Date.now(), lastChangeId: payload.lastChangeId || 0 });
                    computeData();
                    renderCurrentView();
                    return true;
                } catch (error) {
                    enqueuePendingMutation({ type: "infra-room", roomId, equip: room.equip });
                    showToast("Falha ao sincronizar sala. Mudança guardada para envio automático.", "warning");
                    return false;
                }
            };
            const normalizeUserInput = (value) => value.trim().toLowerCase();
            const formatDisplayName = (value) =>
                value
                    .split(".")
                    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ""))
                    .join(" ");
            const getUserById = (id) => state.users.find((user) => user.id === id);
            const getRoomById = (id) => state.infraRooms.find((room) => room.id === id);
            const getCurrentRole = () => normalizeRole(state.currentUser?.role);
            const getActorName = () => String(state.currentUser?.name || state.currentUser?.id || "Operador");
            const resolveActorLabel = (entry, fallback = "Sistema") => {
                const label = String(entry?.sessionName || entry?.actorName || entry?.removedBy || entry?.withdrawnBy || entry?.user || entry?.actorId || fallback || "Sistema").trim();
                return label || fallback || "Sistema";
            };
            const getSessionActorMarkup = (label = "Usuário da sessão") => `
                            <div>
                                <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">${label}</label>
                                <div class="w-full p-4 bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-zinc-900 dark:text-white">${escapeHtml(getActorName())}</div>
                            </div>`;
            const syncSessionDisplayName = () => {
                const currentId = String(state.currentUser?.id || "").trim();
                const displayName = String(state.currentUser?.name || "").trim();
                if (!currentId || !displayName || !Array.isArray(state.users)) return;
                state.users = state.users.map((user) => (user.id === currentId ? { ...user, name: displayName } : user));
                const headerUsername = document.getElementById("header-username");
                if (headerUsername) headerUsername.innerText = displayName;
            };
            const isAdmin = () => getCurrentRole() === "Administrador";
            const isDeveloper = () => getCurrentRole() === "Desenvolvedor";
            const isOperator = () => getCurrentRole() === "Operador";
            const canManageUsers = () => isAdmin() || isDeveloper();
            const canEditInventory = () => isAdmin() || isDeveloper() || isOperator();
            const canEditInfra = () => isAdmin() || isDeveloper() || isOperator();
            const canManagePurchases = () => isAdmin() || isDeveloper() || isOperator();
            const canAccessSettings = () => isAdmin() || isDeveloper() || isOperator();
            const canAccessUsersView = () => isAdmin() || isDeveloper() || isOperator();
            const logActivity = ({ section, action, message, targetUserId = null, targetRoomId = null, actorId = getActorName() || "system" }) => {
                const actorLabel = String(actorId || getActorName() || "system").trim() || "system";
                state.activityLogs.unshift({
                    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    actorId: actorLabel,
                    actorName: actorLabel,
                    sessionName: actorLabel,
                    targetUserId,
                    targetRoomId,
                    section,
                    action,
                    message,
                    createdAt: new Date().toISOString(),
                });
                saveActivityLogs();
            };
            const getUserLogHistory = (userId) => state.activityLogs.filter((log) => log.actorId === userId || log.targetUserId === userId);
            const getRoomLogHistory = (roomId) => state.activityLogs.filter((log) => log.targetRoomId === roomId || (log.section === "infra" && typeof log.message === "string" && log.message.includes(roomId)));
            const requirePermission = (allowed, message = "Ação restrita ao administrador.") => {
                if (!allowed) {
                    showToast(message, "error");
                    return false;
                }
                return true;
            };
            const getRoleBadge = (role) => {
                const normalized = normalizeRole(role);
                if (normalized === "Administrador") return '<span class="px-2 py-1 text-[10px] uppercase font-black tracking-widest bg-amber-400/15 text-amber-600 dark:text-amber-300 rounded-md">Admin</span>';
                if (normalized === "Desenvolvedor") return '<span class="px-2 py-1 text-[10px] uppercase font-black tracking-widest bg-purple-500/10 text-purple-500 dark:text-purple-300 rounded-md border border-purple-500/20">Dev T1</span>';
                if (normalized === "Operador") return '<span class="px-2 py-1 text-[10px] uppercase font-black tracking-widest bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 rounded-md border border-fuchsia-500/20">Operador</span>';
                return '<span class="px-2 py-1 text-[10px] uppercase font-black tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-md border border-zinc-200 dark:border-zinc-700">Convidado</span>';
            };
            const getUserStatusBadge = (status) =>
                status === "active"
                    ? '<span class="px-2 py-1 text-[10px] uppercase font-black tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md">Ativo</span>'
                    : '<span class="px-2 py-1 text-[10px] uppercase font-black tracking-widest bg-fuchsia-500/10 text-fuchsia-500 rounded-md">Inativo</span>';
            const INLINE_ACTION_ICONS = {
                pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"></path></svg>',
                logs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M15 12h-5"></path><path d="M15 8h-9"></path><path d="M19 16H9"></path><path d="M3 5v14a2 2 0 0 0 2 2h14"></path><path d="M3 5a2 2 0 0 1 2-2h14v14a2 2 0 0 1-2 2H3"></path></svg>',
                userX: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M16 21a4 4 0 0 0-8 0"></path><circle cx="12" cy="7" r="4"></circle><path d="m17 8 5 5"></path><path d="m22 8-5 5"></path></svg>',
                userCheck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M16 21a4 4 0 0 0-8 0"></path><circle cx="12" cy="7" r="4"></circle><path d="m16 11 2 2 4-4"></path></svg>',
            };
            const getActionIcon = (name) => INLINE_ACTION_ICONS[name] || "";
            const updatePermissionsUI = () => {
                const usersBtn = document.getElementById("nav-users");
                if (usersBtn) usersBtn.classList.toggle("hidden", !canAccessUsersView());
            };

            // --- SISTEMA DE LOGIN E AUTENTICAÇÃO ---
            const createRemoteUser = async (payload) => {
                const result = await fetchJson(`${API_BASE}/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (result?.state) {
                    applyRemoteState(result.state);
                    setRemoteStateVersion(result.stateVersion);
                    setRemoteChangeCursor(result.lastChangeId);
                    syncCurrentUserFromState();
                    renderCurrentView();
                }
                return result;
            };

            const updateRemoteUser = async (userId, payload) => {
                const result = await fetchJson(`${API_BASE}/users/${encodeURIComponent(userId)}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (result?.state) {
                    applyRemoteState(result.state);
                    setRemoteStateVersion(result.stateVersion);
                    setRemoteChangeCursor(result.lastChangeId);
                    syncCurrentUserFromState();
                    renderCurrentView();
                }
                return result;
            };

            const needsSessionNaming = (userLike = null) => {
                const user = userLike || state.currentUser;
                const name = normalizeComparableName(user?.name || "");
                return isPrivilegedRole(user?.role) && (!name || ["administrador", "admin", "desenvolvedor", "dev.gui"].includes(name));
            };

            window.openSessionNamingModal = () => {
                const modal = document.getElementById("session-name-modal");
                if (!modal) return;
                modal.classList.remove("hidden");
                modal.classList.add("flex");
                requestAnimationFrame(() => refreshIcons());
            };

            window.closeSessionNamingModal = () => {
                const modal = document.getElementById("session-name-modal");
                if (!modal) return;
                modal.classList.add("hidden");
                modal.classList.remove("flex");
            };

            window.handleSessionNaming = async (e) => {
                e.preventDefault();
                const selectedName = e?.submitter?.dataset?.collaborator || e?.target?.dataset?.collaborator || "";
                if (!selectedName) return showToast("Selecione um colaborador válido.", "error");
                return window.selectSessionCollaborator(selectedName);
            };

            window.selectSessionCollaborator = async (displayName) => {
                const collaboratorName = resolveSessionCollaboratorName(displayName);
                if (!collaboratorName) return showToast("Selecione Evandro, Lucas, Guilherme ou Marcos.", "error");

                const buttons = Array.from(document.querySelectorAll(".collaborator-choice-btn"));
                buttons.forEach((button) => {
                    button.disabled = true;
                    button.classList.add("opacity-60", "pointer-events-none");
                });
                const selectedButton = buttons.find((button) => button.dataset.collaborator === collaboratorName);
                const originalSelectedHtml = selectedButton?.innerHTML;
                if (selectedButton) selectedButton.innerHTML = `<span class="flex items-center gap-2 font-black"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Entrando como ${collaboratorName}...</span>`;
                refreshIcons();

                try {
                    const nameRes = await fetch(`${API_BASE}/auth/name-session`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ displayName: collaboratorName }),
                    });
                    const payload = await nameRes.json().catch(() => ({}));
                    if (!nameRes.ok) throw new Error(payload.error || "Falha ao identificar a sessão com o colaborador selecionado.");

                    applyRemoteState(payload.state || pendingAdminLoginPayload?.state || {});
                    setRemoteStateVersion(payload.stateVersion ?? pendingAdminLoginPayload?.stateVersion);
                    setRemoteChangeCursor(payload.lastChangeId ?? pendingAdminLoginPayload?.lastChangeId);
                    remoteStateReady = true;
                    state.currentUser = { ...(state.currentUser || {}), id: payload.user?.id || pendingAdminLoginPayload?.user?.id || "admin", role: payload.user?.role || pendingAdminLoginPayload?.user?.role || "Administrador", name: payload.user?.name || collaboratorName };

                    executeLogin(state.currentUser.id, state.currentUser.role, null, { displayName: state.currentUser.name, requireNaming: false });
                    setTextIfPresent("header-username", state.currentUser.name);
                    setTextIfPresent("header-role", getHeaderRoleLabel(state.currentUser));
                    closeSessionNamingModal();
                    pendingAdminLoginPayload = null;
                    startRemotePolling();
                    fetchAuthoritativeState("login", { emitRemoteToasts: false }).catch(() => {});
                    showToast(payload.successMessage || `Sessão iniciada como ${state.currentUser.name}.`);
                } catch (error) {
                    console.error(error);
                    showToast(error.message || "Não foi possível iniciar a sessão do colaborador.", "error");
                } finally {
                    buttons.forEach((button) => {
                        button.disabled = false;
                        button.classList.remove("opacity-60", "pointer-events-none");
                    });
                    if (selectedButton && originalSelectedHtml) selectedButton.innerHTML = originalSelectedHtml;
                    refreshIcons();
                }
            };

            window.setLoginStep = (step = "choice") => {
                const choiceStep = document.getElementById("login-choice-step");
                const adminStep = document.getElementById("admin-name-step");
                const collaboratorStep = document.getElementById("session-collaborator-step");
                if (!choiceStep || !adminStep || !collaboratorStep) return;
                choiceStep.classList.toggle("hidden", step !== "choice");
                adminStep.classList.toggle("hidden", step !== "admin");
                collaboratorStep.classList.toggle("hidden", step !== "collaborator");
                if (step === "admin") {
                    const input = document.getElementById("admin-login-input");
                    requestAnimationFrame(() => input?.focus());
                }
                refreshIcons();
            };

            window.resetLoginAccess = async () => {
                pendingAdminLoginPayload = null;
                ["admin-login-input", "admin-password-input"].forEach((id) => { const input = document.getElementById(id); if (input) input.value = ""; });
                try {
                    await fetch(`${API_BASE}/auth/logout`, { method: "POST" });
                } catch (_) {}
                window.setLoginStep("choice");
            };

            window.startAdminAccess = async () => {
                window.setLoginStep("admin");
                const loginInput = document.getElementById("admin-login-input");
                if (loginInput && !loginInput.value) loginInput.value = "admin";
                const passwordInput = document.getElementById("admin-password-input");
                if (passwordInput) passwordInput.value = "";
                showToast("Informe o login e a senha para validar o acesso.");
            };

            window.handleLogin = async (e) => {
                e.preventDefault();
                const adminLoginInput = String(document.getElementById("admin-login-input")?.value || "").trim();
                const adminPasswordInput = String(document.getElementById("admin-password-input")?.value || "");
                const btn = document.getElementById("login-submit-btn");

                if (!adminLoginInput) return showToast("Informe o login administrativo.", "error");
                if (!adminPasswordInput) return showToast("Informe a senha administrativa.", "error");

                if (btn) btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 mr-2 animate-spin"></i> Validando...`;
                refreshIcons();

                try {
                    const loginRes = await fetch(`${API_BASE}/auth/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ login: adminLoginInput, password: adminPasswordInput }),
                    });
                    const loginPayload = await loginRes.json().catch(() => ({}));
                    if (!loginRes.ok) throw new Error(loginPayload.error || "Falha ao autenticar o acesso administrativo.");

                    applyRemoteState(loginPayload.state || {});
                    setRemoteStateVersion(loginPayload.stateVersion);
                    setRemoteChangeCursor(loginPayload.lastChangeId);
                    remoteStateReady = true;
                    pendingAdminLoginPayload = loginPayload;
                    state.currentUser = { id: loginPayload.user?.id || "admin", role: loginPayload.user?.role || "Administrador", name: loginPayload.user?.name || "Administrador" };

                    const label = document.getElementById("collaborator-step-login-label");
                    if (label) label.innerText = `${loginPayload.user?.role || "Acesso"} validado. Clique no seu nome para o sistema reconhecer suas ações.`;
                    window.setLoginStep("collaborator");
                    showToast(loginPayload.successMessage || "Login validado. Selecione o colaborador da sessão.");
                } catch (error) {
                    console.error(error);
                    showToast(error.message || "Não foi possível autenticar com o servidor.", "error");
                } finally {
                    if (btn) btn.innerHTML = "Validar acesso";
                    refreshIcons();
                }
            };

            window.handleGuestLogin = async () => {
                logoutInFlight = false;
                const btn = document.getElementById("quick-access-btn");
                const adminBtn = document.getElementById("admin-access-btn");
                if (btn) btn.innerHTML = `<span class="flex items-center gap-3"><span class="w-11 h-11 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-800 flex items-center justify-center"><i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i></span><span class="flex-1"><span class="block text-sm font-black tracking-tight">Acesso rápido</span><span class="block text-xs text-zinc-500 mt-1">Preparando visualização somente leitura...</span></span></span>`;
                if (btn) btn.disabled = true;
                if (adminBtn) adminBtn.disabled = true;
                refreshIcons();
                try {
                    const response = await fetch(`${API_BASE}/auth/guest`, { method: "POST" });
                    const payload = await response.json().catch(() => ({}));
                    if (!response.ok) return showToast(payload.error || "Acesso rápido indisponível.", "error");
                    applyRemoteState(payload.state || {});
                    setRemoteStateVersion(payload.stateVersion);
                    setRemoteChangeCursor(payload.lastChangeId);
                    remoteStateReady = true;
                    state.currentUser = payload.user || { id: "guest", role: "Convidado", name: "Acesso rápido" };
                    executeLogin(payload.user?.id || "guest", payload.user?.role || "Convidado", "infra", { displayName: payload.user?.name || "Acesso rápido", requireNaming: false });
                    startRemotePolling();
                    fetchAuthoritativeState("guest-login", { emitRemoteToasts: false }).catch(() => {});
                    showToast(payload.successMessage || "Acesso rápido liberado em modo leitura.");
                } catch (error) {
                    console.error(error);
                    showToast("Não foi possível liberar o acesso rápido no Supabase.", "error");
                } finally {
                    if (btn) {
                        btn.disabled = false;
                        btn.innerHTML = `<span class="flex items-center gap-3"><span class="w-11 h-11 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-800 flex items-center justify-center"><i data-lucide="eye" class="w-5 h-5"></i></span><span class="flex-1"><span class="block text-sm font-black tracking-tight">Acesso rápido</span><span class="block text-xs text-zinc-500 mt-1">Entrar sem nome e sem permissão de modificação.</span></span><i data-lucide="arrow-right" class="w-4 h-4 text-zinc-400"></i></span>`;
                    }
                    if (adminBtn) adminBtn.disabled = false;
                    refreshIcons();
                }
            };

            window.openRegisterModal = () => {
                showToast("O cadastro de novas contas foi desativado.", "error");
                return;

                const modal = document.getElementById("register-modal");
                if (!modal) return;
                modal.classList.remove("hidden");
                modal.classList.add("flex");
                requestAnimationFrame(() => {
                    document.getElementById("register-user")?.focus();
                    if (window.lucide) lucide.createIcons();
                });
            };

            window.closeRegisterModal = () => {
                const modal = document.getElementById("register-modal");
                if (!modal) return;
                modal.classList.add("hidden");
                modal.classList.remove("flex");
                const emailField = document.getElementById("register-email");
                const userField = document.getElementById("register-user");
                const passField = document.getElementById("register-pass");
                if (emailField) emailField.value = "";
                if (userField) userField.value = "";
                if (passField) passField.value = "";
            };

            window.handleRegister = async (e) => {
                e.preventDefault();
                const emailInput = String(document.getElementById("register-email")?.value || "").trim().toLowerCase();
                const userInput = normalizeUserInput(document.getElementById("register-user")?.value || "");
                const passInput = String(document.getElementById("register-pass")?.value || "");

                if (!emailInput || !userInput || !passInput) return showToast("Preencha e-mail, login e senha.", "error");

                try {
                    const response = await fetch(`${API_BASE}/auth/register`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: emailInput, userId: userInput, password: passInput }),
                    });
                    const payload = await response.json().catch(() => ({}));
                    if (!response.ok) return showToast(payload.error || "Não foi possível criar a conta.", "error");

                    applyRemoteState(payload.state || {});
                    setRemoteStateVersion(payload.stateVersion);
                    setRemoteChangeCursor(payload.lastChangeId);
                    remoteStateReady = true;
                    closeRegisterModal();
                    executeLogin(payload.user?.id || userInput, payload.user?.role || "Convidado", payload.redirectView || "infra");
                    startRemotePolling();
                    fetchAuthoritativeState("register", { emitRemoteToasts: false }).catch(() => {});
                    showToast(payload.successMessage || "Conta criada com sucesso.");
                } catch (error) {
                    console.error(error);
                    showToast("Não foi possível criar a conta no Supabase.", "error");
                }
            };

            const getDefaultViewForRole = (role) => (isPrivilegedRole(role) ? "dashboard" : "infra");

            const executeLogin = (username, role, preferredView = null, displayNameOrOptions = null) => {
                logoutInFlight = false;
                const user = getUserById(username);
                const normalizedRole = normalizeRole(role);
                const options = (displayNameOrOptions && typeof displayNameOrOptions === "object") ? displayNameOrOptions : {};
                const displayName = (typeof displayNameOrOptions === "string") ? displayNameOrOptions : options.displayName;
                const resolvedDisplayName = String(displayName || user?.name || username || "Operador").trim();
                state.currentUser = { id: username, role: normalizedRole, name: resolvedDisplayName };
                const fallbackView = getDefaultViewForRole(normalizedRole);
                state.currentView = preferredView === "users" ? fallbackView : (preferredView || state.currentView || fallbackView);

                syncSessionDisplayName();
                setTextIfPresent("header-username", resolvedDisplayName, { warn: true });
                setTextIfPresent("header-role", getHeaderRoleLabel({ id: username, role: normalizedRole, name: resolvedDisplayName }));
                updatePermissionsUI();
                syncLocalCaches();
                startRemotePolling();
                setTimeout(() => {
                    runGlobalSync("login-open", { emitRemoteToasts: false, forceState: true }).catch(() => {});
                }, 120);

                const finishOpenApp = () => {
                    toggleClasses("login-view", ["hidden"], "add", { warn: true });
                    toggleClasses("app-view", ["hidden"], "remove", { warn: true });
                    toggleClasses("app-view", ["opacity-0"], "remove", { warn: true });
                    computeData();
                    switchView(state.currentView || fallbackView);
                    if (options.requireNaming || needsSessionNaming(state.currentUser)) {
                        openSessionNamingModal(options.suggestedName || "");
                    }
                };

                if (options.instant) {
                    toggleClasses("login-view", ["hidden", "opacity-0", "pointer-events-none"], "add", { warn: true });
                    finishOpenApp();
                    return;
                }

                toggleClasses("login-view", ["opacity-0", "pointer-events-none"], "add", { warn: true });
                setTimeout(() => {
                    finishOpenApp();
                }, 500);
            };

            window.handleLogout = async () => {
                if (logoutInFlight) return;
                logoutInFlight = true;

                const actorName = state.currentUser?.name || getActorName();
                const previousUserId = state.currentUser?.id || null;
                if (previousUserId) {
                    logActivity({ section: "auth", action: "logout", targetUserId: previousUserId, actorId: actorName, message: `${actorName} encerrou a sessão.` });
                }

                stopRemotePolling();
                stopRealtimeSocket();
                clearTimeout(remotePersistTimer);
                remotePersistTimer = null;
                remoteSyncInFlight = false;
                remotePersistRunning = false;
                remoteDirtyKeys.clear();

                const resetLoginUi = () => {
                    remoteStateReady = false;
                    remoteRealtimeEnabled = false;
                    state.currentUser = null;
                    state.currentView = "dashboard";
                    clearPendingQueue();
                    clearLocalCache();
                    updatePermissionsUI();
                    window.setLoginStep?.("choice");
                    ["admin-password-input", "admin-login-input"].forEach((id) => {
                        const input = document.getElementById(id);
                        if (!input) return;
                        input.value = id === "admin-login-input" ? "admin" : "";
                    });
                    const loginSubmitBtn = document.getElementById("login-submit-btn");
                    if (loginSubmitBtn) loginSubmitBtn.innerHTML = "Validar acesso";
                    closeSessionNamingModal();

                    const appView = document.getElementById("app-view");
                    const loginView = document.getElementById("login-view");
                    const headerUsername = document.getElementById("header-username");
                    const headerRole = document.getElementById("header-role");
                    if (headerUsername) headerUsername.innerText = "Usuário";
                    if (headerRole) headerRole.innerText = "Operador";
                    if (headerRole) headerRole.classList.add("hidden");

                    if (appView) {
                        appView.classList.add("opacity-0", "pointer-events-none", "hidden");
                        appView.classList.remove("pointer-events-none");
                    }
                    if (loginView) {
                        loginView.classList.remove("hidden", "opacity-0", "pointer-events-none");
                    }
                    const firstInput = document.getElementById("admin-login-input");
                    requestAnimationFrame(() => firstInput?.focus());
                };

                try {
                    const logoutRequest = fetch(`${API_BASE}/auth/logout`, {
                        method: "POST",
                        credentials: "same-origin",
                        keepalive: true,
                    }).catch((error) => {
                        console.warn("Falha ao encerrar sessão remota.", error);
                        return null;
                    });
                    await Promise.race([
                        logoutRequest,
                        new Promise((resolve) => setTimeout(resolve, 1200)),
                    ]);
                } finally {
                    resetLoginUi();
                    logoutInFlight = false;
                    showToast("Sessão terminada com sucesso.");
                }
            };

            // --- COMPUTAR DADOS ---
            const computeData = () => {
                state.inventory = normalizeInventoryItems(state.inventory);
                state.inventory.forEach((i) => {
                    i.status = i.quantity === 0 ? "zero" : i.quantity <= state.settings.threshold ? "low" : "ok";
                });
                state.infraRooms = normalizeInfraRooms(state.infraRooms);
                syncMaintenanceSettings();
                state.purchaseNeeds = state.inventory.filter((i) => i.manualPurchaseQty > 0).sort((a, b) => b.manualPurchaseQty * b.price - a.manualPurchaseQty * a.price);

                const b = document.getElementById("badge-purchases");
                if (b && state.purchaseNeeds.length > 0) {
                    b.innerText = state.purchaseNeeds.length;
                    b.classList.remove("hidden");
                } else if (b) {
                    b.classList.add("hidden");
                }
                const maintenanceBadge = document.getElementById("badge-maintenance");
                const lateMaintenance = state.maintenanceRecords.filter((record) => record.status !== "returned" && isMaintenanceLate(record)).length;
                if (maintenanceBadge && lateMaintenance > 0) {
                    maintenanceBadge.innerText = lateMaintenance;
                    maintenanceBadge.classList.remove("hidden");
                } else if (maintenanceBadge) {
                    maintenanceBadge.classList.add("hidden");
                }
            };

            // --- NAVEGAÇÃO ---
            window.switchView = (viewId, itemId = null) => {
                if (viewId === "users") viewId = "dashboard";
                if (viewId === "settings") viewId = "dashboard";
                state.currentView = viewId;
                if (itemId) state.selectedItem = state.inventory.find((i) => i.id === itemId);

                if (viewId === "settings" && !requirePermission(canAccessSettings(), "Somente operadores, desenvolvedores e administradores acessam Configurações.")) return;
                if (viewId === "infra") {
                    if (![1, 2, 3].includes(Number(state.infraUnit))) state.infraUnit = 1;
                    state.infraToolbarCollapsed = false;
                    infraLastScrollTop = 0;
                }

                const views = ["dashboard", "inventory", "purchases", "maintenance", "infra", "insights", "detail"];
                views.forEach((v) => {
                    const el = document.getElementById(`view-${v}`);
                    if (el) el.classList.add("hidden");
                });

                const target = document.getElementById(`view-${viewId}`);
                if (target) {
                    target.classList.remove("hidden");
                    if (viewId === "infra") target.classList.add("flex"); // Infra requires flex
                }

                document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.remove("nav-btn-active"));
                const activeNav = document.getElementById(`nav-${viewId === "detail" ? "inventory" : viewId}`);
                if (activeNav) activeNav.classList.add("nav-btn-active");

                const titles = {
                    dashboard: ["Painel Geral", "Monitoramento estratégico de ativos."],
                    inventory: ["Inventário Ativo", "Controle total da base física."],
                    purchases: ["Requisições", "Gestão de compras e orçamentos."],
                    maintenance: ["Manutencao", "Controle de itens enviados para manutencao."],
                    infra: ["Infraestrutura", "Distribuição unificada de equipamentos por salas."],
                    insights: ["Analíticos", "Visão econômica e financeira do patrimônio."],
                    detail: ["Ficha de Ativo", "Informação detalhada e histórico completo."],
                };

                setTextIfPresent("view-title", titles[viewId]?.[0] || "Gestão", { warn: true });
                setTextIfPresent("view-subtitle", titles[viewId]?.[1] || "", { warn: true });

                computeData();
                renderCurrentView();
                syncLocalCaches();
            };

            let iconRefreshFrame = null;
            const refreshIcons = () => {
                if (!window.lucide) return;
                if (iconRefreshFrame) cancelAnimationFrame(iconRefreshFrame);
                iconRefreshFrame = requestAnimationFrame(() => {
                    iconRefreshFrame = null;
                    try {
                        lucide.createIcons();
                    } catch (_) {}
                });
            };

            const renderCurrentView = () => {
                if (state.currentView === "dashboard") renderDashboard();
                if (state.currentView === "inventory") renderInventory();
                if (state.currentView === "purchases") renderPurchases();
                if (state.currentView === "maintenance") renderMaintenance();
                if (state.currentView === "infra") renderInfra();
                if (state.currentView === "users") renderUsers();
                if (state.currentView === "insights") renderInsights();
                if (state.currentView === "detail") renderDetail();

                if (state.currentView === "infra") {
                    if (!state.selectedRoomLogId || !getRoomById(state.selectedRoomLogId)) state.selectedRoomLogId = null;
                    renderInfraRoomHistoryPanel();
                    initInfraAutoToolbar();
                }
                refreshIcons();
            };

            const getStatusBadge = (status) => {
                if (status === "zero") return '<span class="px-2 py-1 text-[10px] uppercase font-black tracking-widest bg-fuchsia-500/15 text-fuchsia-300 rounded-md">Zerado</span>';
                if (status === "low") return '<span class="px-2 py-1 text-[10px] uppercase font-black tracking-widest bg-amber-400/10 text-amber-300 rounded-md">Baixo</span>';
                return '<span class="px-2 py-1 text-[10px] uppercase font-black tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-md border border-zinc-200 dark:border-zinc-700">Normal</span>';
            };

            // --- RADAR OPERACIONAL LOGIC ---
            window.executeRadarAction = (type, targetId, param) => {
                if (type === "purchase") {
                    switchView("inventory");
                    const searchBox = document.getElementById("inventory-search");
                    if (searchBox) {
                        searchBox.value = param;
                        renderInventory();
                    }
                } else if (type === "infra") {
                    switchInfraTab(param); // param holds unit number
                    switchView("infra");
                    setTimeout(() => {
                        const roomEl = document.getElementById("room-" + targetId);
                        if (roomEl) {
                            roomEl.scrollIntoView({ behavior: "smooth", block: "center" });
                            // Abre a "aba da sala" (o modal da sala) automaticamente
                            openModal("edit-room", targetId);
                        }
                    }, 150);
                }
            };

            const getDashboardIconSvg = (icon, classes = "") => {
                const cls = classes || "";
                const icons = {
                    "package": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>`,
                    "trending-down": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M16 17h5v-5"></path><path d="m21 12-7 7-4-4-7 7"></path></svg>`,
                    "alert-triangle": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="m10.29 3.86-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.71-3.14l-8-14a2 2 0 0 0-3.42 0Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>`,
                    "dollar-sign": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
                    "arrow-down-left": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M17 7 7 17"></path><path d="M17 17H7V7"></path></svg>`,
                    "arrow-up-right": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M7 17 17 7"></path><path d="M7 7h10v10"></path></svg>`,
                    "check-circle": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg>`,
                    "chevron-right": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="m9 18 6-6-6-6"></path></svg>`,
                    "shopping-cart": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2h3l2.68 12.39A2 2 0 0 0 9.68 16H19a2 2 0 0 0 1.95-1.57L23 6H6"></path></svg>`,
                    "users": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><path d="M20 8v6"></path><path d="M23 11h-6"></path></svg>`,
                    "shield-check": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"></path><path d="m9 12 2 2 4-4"></path></svg>`,
                    "user-check": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><path d="m17 11 2 2 4-4"></path></svg>`,
                    "wrench": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M14.7 6.3a4 4 0 0 0-5 5L3 18v3h3l6.7-6.7a4 4 0 0 0 5-5l-2.4 2.4-3-3 2.4-2.4Z"></path></svg>`,
                    "timer": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M10 2h4"></path><path d="M12 14v-4"></path><path d="M4 13a8 8 0 1 0 8-8"></path></svg>`
                };
                return icons[icon] || `<span class="${cls}"></span>`;
            };

            const getMovementActorLine = (movement) => {
                if (!movement) return "";
                return `Usuário da sessão: ${resolveActorLabel(movement, "Não informado")}`;
            };

            const getLatestWithdrawalName = (itemId) => {
                const move = [...state.movements]
                    .filter((entry) => entry.itemId === itemId && entry.type === "out")
                    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                return move ? resolveActorLabel(move, "—") : "—";
            };

            const createAssetUnit = (data = {}, index = 0) => {
                const patrimony = String(data.patrimony ?? data.patrimonio ?? data.assetTag ?? "").trim();
                const serialNumber = String(data.serialNumber ?? data.serial ?? data.numeroSerie ?? "").trim();
                const noIdentifier = Boolean(data.noIdentifier || data.isNull || data.nullIdentifier || (!patrimony && !serialNumber));
                return {
                    id: String(data.id || `asset-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`),
                    patrimony: noIdentifier ? "" : patrimony,
                    serialNumber: noIdentifier ? "" : serialNumber,
                    noIdentifier,
                    createdAt: data.createdAt || new Date().toISOString(),
                };
            };

            const getAssetUnits = (item, options = {}) => {
                if (!item) return [];
                if (!item.metadata || typeof item.metadata !== "object") item.metadata = {};
                const desiredQty = Math.max(0, Number(item.quantity || 0));
                const rawUnits = Array.isArray(item.metadata.assetUnits) ? item.metadata.assetUnits : [];
                let units = rawUnits.map((unit, index) => createAssetUnit(unit, index));
                if (options.matchQuantity !== false) {
                    while (units.length < desiredQty) units.push(createAssetUnit({ noIdentifier: true }, units.length));
                    if (units.length > desiredQty) units = units.slice(0, desiredQty);
                }
                item.metadata.assetUnits = units;
                return units;
            };

            const normalizeInventoryItems = (items) => (Array.isArray(items) ? items.map((item) => {
                if (!item.metadata || typeof item.metadata !== "object") item.metadata = {};
                item.quantity = Math.max(0, Number(item.quantity || 0));
                getAssetUnits(item);
                return item;
            }) : []);

            const getAssetIdentityStats = (item) => {
                const units = getAssetUnits(item);
                const identified = units.filter((unit) => !unit.noIdentifier && (unit.patrimony || unit.serialNumber)).length;
                return { total: units.length, identified, nullCount: units.length - identified };
            };

            const getAssetIdentitySummary = (item) => {
                const stats = getAssetIdentityStats(item);
                if (!stats.total) return "Sem unidades em estoque";
                if (!stats.identified) return `${stats.total} sem patrimonio/serie`;
                return `${stats.identified}/${stats.total} identificadas${stats.nullCount ? `, ${stats.nullCount} nulas` : ""}`;
            };

            const renderAssetIdentityRows = (quantity, units = []) => {
                const qty = Math.max(0, Number(quantity || 0));
                if (!qty) {
                    return `<div class="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-4 text-center text-xs font-bold text-zinc-500">Nenhuma unidade para identificar.</div>`;
                }
                return `
                    <div class="rounded-[1.4rem] border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-black/40 p-4 space-y-3">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Patrimonio / Numero de serie</p>
                                <p class="text-xs font-semibold text-zinc-500 mt-1">Preencha por unidade ou marque como nulo.</p>
                            </div>
                            <button type="button" onclick="setAllAssetIdentityNull()" class="rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:border-amber-400 transition-colors">Todos nulos</button>
                        </div>
                        <div class="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                            ${Array.from({ length: qty }).map((_, index) => {
                                const unit = createAssetUnit(units[index] || { noIdentifier: true }, index);
                                return `
                                    <div data-asset-row data-asset-id="${escapeHtml(unit.id)}" class="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3">
                                        <div class="mb-3 flex items-center justify-between gap-3">
                                            <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Unidade ${index + 1}</span>
                                            <label class="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                <input type="checkbox" data-asset-null class="rounded border-zinc-300 text-amber-400 focus:ring-amber-400" ${unit.noIdentifier ? "checked" : ""} onchange="toggleAssetIdentityNull(this)" />
                                                Nulo
                                            </label>
                                        </div>
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <input data-asset-patrimony value="${escapeHtml(unit.patrimony)}" ${unit.noIdentifier ? "disabled" : ""} placeholder="Patrimonio" class="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black p-3 text-sm font-bold outline-none focus:border-amber-400 disabled:opacity-50" />
                                            <input data-asset-serial value="${escapeHtml(unit.serialNumber)}" ${unit.noIdentifier ? "disabled" : ""} placeholder="Numero de serie" class="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black p-3 text-sm font-bold outline-none focus:border-amber-400 disabled:opacity-50" />
                                        </div>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>
                `;
            };

            window.renderAssetIdentityFields = (quantityInputId = "f-qty") => {
                const container = document.getElementById("asset-identity-fields");
                if (!container) return;
                const qty = parseInt(document.getElementById(quantityInputId)?.value || "0") || 0;
                const currentRows = document.querySelectorAll("[data-asset-row]").length;
                const currentUnits = currentRows ? readAssetIdentityRows(currentRows) : [];
                container.innerHTML = renderAssetIdentityRows(qty, currentUnits);
            };

            window.toggleAssetIdentityNull = (checkbox) => {
                const row = checkbox?.closest?.("[data-asset-row]");
                if (!row) return;
                const isNull = Boolean(checkbox.checked);
                row.querySelectorAll("[data-asset-patrimony], [data-asset-serial]").forEach((input) => {
                    input.disabled = isNull;
                    if (isNull) input.value = "";
                });
            };

            window.setAllAssetIdentityNull = () => {
                document.querySelectorAll("[data-asset-row]").forEach((row) => {
                    const checkbox = row.querySelector("[data-asset-null]");
                    if (checkbox) {
                        checkbox.checked = true;
                        window.toggleAssetIdentityNull(checkbox);
                    }
                });
            };

            const readAssetIdentityRows = (expectedQty = 0) => {
                const rows = Array.from(document.querySelectorAll("[data-asset-row]"));
                const units = rows.slice(0, expectedQty).map((row, index) => {
                    const patrimony = String(row.querySelector("[data-asset-patrimony]")?.value || "").trim();
                    const serialNumber = String(row.querySelector("[data-asset-serial]")?.value || "").trim();
                    const noIdentifier = Boolean(row.querySelector("[data-asset-null]")?.checked || (!patrimony && !serialNumber));
                    return createAssetUnit({ id: row.dataset.assetId, patrimony, serialNumber, noIdentifier }, index);
                });
                while (units.length < expectedQty) units.push(createAssetUnit({ noIdentifier: true }, units.length));
                return units;
            };

            const appendAssetUnitsToItem = (item, units = []) => {
                const current = getAssetUnits(item, { matchQuantity: false });
                item.metadata.assetUnits = [...current, ...units.map((unit, index) => createAssetUnit(unit, current.length + index))];
            };

            const removeAssetUnitsFromItem = (item, quantity = 0) => {
                const units = getAssetUnits(item, { matchQuantity: false });
                const removed = units.splice(Math.max(0, units.length - quantity), quantity);
                item.metadata.assetUnits = units;
                return removed;
            };

            const todayDateOnly = () => new Date().toISOString().slice(0, 10);
            const parseDateOnly = (value) => {
                if (!value) return null;
                const date = new Date(`${value}T00:00:00`);
                return Number.isNaN(date.getTime()) ? null : date;
            };
            const formatDateOnly = (value) => {
                const date = parseDateOnly(value);
                return date ? date.toLocaleDateString("pt-BR") : "Sem data";
            };
            const getMaintenanceDelayDays = (record) => {
                if (!record || record.status === "returned" || !record.returnDate) return 0;
                const expected = parseDateOnly(record.returnDate);
                const today = parseDateOnly(todayDateOnly());
                if (!expected || !today || today <= expected) return 0;
                return Math.ceil((today - expected) / 86400000);
            };
            const isMaintenanceLate = (record) => getMaintenanceDelayDays(record) > 0;
            const normalizeMaintenanceRecords = (records = []) => (Array.isArray(records) ? records.map((record, index) => {
                const item = state.inventory.find((entry) => String(entry.id) === String(record.itemId));
                return {
                    id: String(record.id || `maint-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`),
                    itemId: String(record.itemId || ""),
                    itemName: String(record.itemName || item?.name || "Item removido"),
                    category: String(record.category || item?.category || "Outros"),
                    assetUnitId: String(record.assetUnitId || ""),
                    assetIndex: Number(record.assetIndex || 0),
                    patrimony: String(record.patrimony || record.patrimonio || ""),
                    serialNumber: String(record.serialNumber || record.serial || ""),
                    noIdentifier: Boolean(record.noIdentifier || (!record.patrimony && !record.patrimonio && !record.serialNumber && !record.serial)),
                    sentDate: String(record.sentDate || todayDateOnly()).slice(0, 10),
                    returnDate: String(record.returnDate || "").slice(0, 10),
                    notes: String(record.notes || ""),
                    delayEffect: String(record.delayEffect || ""),
                    status: record.status === "returned" ? "returned" : "active",
                    returnedAt: record.returnedAt || null,
                    createdAt: record.createdAt || new Date().toISOString(),
                    createdBy: String(record.createdBy || ""),
                };
            }) : []);
            const syncMaintenanceSettings = () => {
                if (!state.settings || typeof state.settings !== "object") state.settings = {};
                state.maintenanceRecords = normalizeMaintenanceRecords(state.maintenanceRecords || state.settings.maintenanceRecords || []);
                state.settings.maintenanceRecords = state.maintenanceRecords;
                return state.maintenanceRecords;
            };
            const getMaintenanceStatusBadge = (record) => {
                if (record.status === "returned") return '<span class="px-2 py-1 rounded-md bg-amber-400/10 text-amber-300 text-[10px] font-black uppercase tracking-widest">Retornou</span>';
                if (isMaintenanceLate(record)) return '<span class="px-2 py-1 rounded-md bg-fuchsia-500/15 text-fuchsia-300 text-[10px] font-black uppercase tracking-widest">Atrasado</span>';
                return '<span class="px-2 py-1 rounded-md bg-amber-500/10 text-amber-300 text-[10px] font-black uppercase tracking-widest">Em manutencao</span>';
            };
            const getMaintenanceUnitOptionsHtml = (itemId) => {
                const item = state.inventory.find((entry) => String(entry.id) === String(itemId));
                if (!item) return '<option value="">Selecione um item primeiro</option>';
                const units = getAssetUnits(item);
                if (!units.length) return '<option value="null">Sem unidades em estoque</option>';
                return units.map((unit, index) => {
                    const label = unit.noIdentifier
                        ? `Unidade ${index + 1} - patrimonio/serie nulos`
                        : `Unidade ${index + 1} - ${unit.patrimony || "sem patrimonio"} / ${unit.serialNumber || "sem serie"}`;
                    return `<option value="${escapeHtml(unit.id)}">${escapeHtml(label)}</option>`;
                }).join("");
            };
            const resolveMaintenanceUnit = (item, unitId) => {
                const units = getAssetUnits(item);
                const index = Math.max(0, units.findIndex((unit) => String(unit.id) === String(unitId)));
                const unit = units[index] || createAssetUnit({ noIdentifier: true }, 0);
                return { unit, index };
            };

            window.refreshMaintenanceUnitOptions = () => {
                const itemId = document.getElementById("f-maint-item")?.value || "";
                const select = document.getElementById("f-maint-unit");
                if (select) select.innerHTML = getMaintenanceUnitOptionsHtml(itemId);
            };

            window.completeMaintenance = (recordId) => {
                const record = state.maintenanceRecords.find((entry) => entry.id === recordId);
                if (!record) return;
                record.status = "returned";
                record.returnedAt = new Date().toISOString();
                if (!record.returnDate) record.returnDate = todayDateOnly();
                syncMaintenanceSettings();
                logActivity({ section: "maintenance", action: "return", message: `${getActorName()} marcou retorno de ${record.itemName}.` });
                queueRemoteStatePersist("settings", "activityLogs");
                renderMaintenance();
                showToast("Retorno registrado.");
            };

            // --- DASHBOARD ---
            const getDashboardHealthColors = (percent) => {
                const healthyGreen = percent >= 80 ? "#22c55e" : "#16a34a";
                return ["#ef4444", "#f59e0b", healthyGreen];
            };

            const getDashboardHealthTextClass = (percent) => {
                if (percent >= 80) return "text-green-500 dark:text-green-300";
                if (percent >= 50) return "text-amber-400";
                return "text-red-500 dark:text-red-300";
            };

            const renderDashboard = () => {
                const totalVal = state.inventory.reduce((a, b) => a + b.quantity * b.price, 0);
                const lowStock = state.inventory.filter((i) => i.status === "low").length;
                const zeroStock = state.inventory.filter((i) => i.status === "zero").length;
                const okStock = state.inventory.length - lowStock - zeroStock;

                setHtmlIfPresent("dash-stats", `
                    ${renderStatCard("Total de Ativos", state.inventory.length, "package", "bg-amber-400/10 text-amber-300")}
                    ${renderStatCard("Estoque Baixo", lowStock, "trending-down", "bg-amber-500/15 text-amber-300")}
                    ${renderStatCard("Itens Zerados", zeroStock, "alert-triangle", "bg-fuchsia-500/15 text-fuchsia-300")}
                    ${renderStatCard("Capital em Estoque", `R$ ${totalVal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "dollar-sign", "bg-fuchsia-500/10 text-fuchsia-200")}
                `);

                // Render Recent Moves
                const recentMoves = [...state.movements].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
                setHtmlIfPresent("dash-recent-moves", recentMoves.length
                    ? recentMoves
                          .map((m) => {
                              const item = state.inventory.find((i) => i.id === m.itemId);
                              const isIn = m.type === "in";
                              return `
                        <div class="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
                            <div class="flex items-center space-x-4">
                                <div class="w-10 h-10 rounded-xl flex items-center justify-center ${isIn ? "bg-amber-400/10 text-amber-300" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}">
                                    ${getDashboardIconSvg(isIn ? "arrow-down-left" : "arrow-up-right", "w-5 h-5")}
                                </div>
                                <div>
                                    <p class="font-bold text-sm text-zinc-900 dark:text-white">${item?.name || "Item Excluído"}</p>
                                    <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-400">${new Date(m.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • ${getMovementActorLine(m)}</p>
                                </div>
                            </div>
                            <p class="text-lg font-black ${isIn ? "text-amber-300" : "text-zinc-900 dark:text-white"}">${isIn ? "+" : "-"}${m.quantity}</p>
                        </div>
                    `;
                          })
                          .join("")
                    : '<p class="text-center py-6 text-xs font-bold text-zinc-500">Nenhuma movimentação hoje.</p>');

                // Render Radar Operacional
                renderRadarFeed();

                document.getElementById("dashboard-quick-add")?.classList.toggle("hidden", !canEditInventory());
                document.getElementById("dashboard-quick-in")?.classList.toggle("hidden", !canEditInventory());

                // Chart & Percent Info
                dashChartInstance = destroyChartIfExists(dashChartInstance);

                const percent = state.inventory.length === 0 ? 0 : Math.round((okStock / state.inventory.length) * 100);
                setTextIfPresent("dash-health-percent", `${percent}%`, { warn: true });
                const healthPercent = document.getElementById("dash-health-percent");
                if (healthPercent) healthPercent.className = `text-3xl font-black leading-none ${getDashboardHealthTextClass(percent)}`;
                const healthColors = getDashboardHealthColors(percent);

                if (window.Chart) {
                    Chart.defaults.color = document.documentElement.classList.contains("dark") ? "#a1a1aa" : "#52525b";
                    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
                }

                dashChartInstance = renderSafeDonutChart(
                    "dash-health-chart",
                    ["Zerado", "Baixo", "Normal"],
                    [zeroStock, lowStock, okStock],
                    {
                        type: "doughnut",
                        data: {
                            labels: ["Zerado", "Baixo", "Normal"],
                            datasets: [
                                {
                                    data: [zeroStock, lowStock, okStock],
                                    backgroundColor: healthColors,
                                    borderWidth: 0,
                                    hoverOffset: 4,
                                },
                            ],
                        },
                        options: { responsive: true, maintainAspectRatio: false, cutout: "80%", plugins: { legend: { display: false } } },
                    }
                );
            };

            const renderRadarFeed = () => {
                const feed = [];

                // 1. Pedidos de Compras (Itens já estão no state.purchaseNeeds como exemplo funcional)
                state.purchaseNeeds.forEach((item) => {
                    feed.push({
                        type: "purchase",
                        id: item.id,
                        param: item.name,
                        title: `Falta de Estoque: ${item.name}`,
                        desc: `Aguardando reposição: ${item.manualPurchaseQty} un.`,
                        icon: "shopping-cart",
                        color: "text-amber-300",
                        bg: "bg-amber-400/10",
                    });
                });

                // 2. Salas de Infraestrutura precisando de revisão
                state.infraRooms.forEach((room) => {
                    ensureRoomEquipmentState(room);
                    if (room.equip.obsLevel === "warning" || room.equip.obsLevel === "danger") {
                        const isDanger = room.equip.obsLevel === "danger";
                        const equipmentIssue = getRoomEquipmentEntries(room)
                            .filter((entry) => entry.quality === "replace" || entry.quality === "keep")
                            .map((entry) => `${entry.label}: ${entry.meta.label}`)
                            .join(" · ");
                        feed.push({
                            type: "infra",
                            id: room.id,
                            param: room.unit,
                            title: `Revisão ${room.name}`,
                            desc: room.equip.obs || equipmentIssue || "Revisão necessária.",
                            icon: "alert-triangle",
                            color: isDanger ? "text-fuchsia-300" : "text-amber-300",
                            bg: isDanger ? "bg-fuchsia-500/15" : "bg-amber-400/10",
                        });
                    }
                });

                const container = document.getElementById("dash-radar-feed");
                if (!container) return;
                if (feed.length === 0) {
                    container.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-10 text-zinc-400">
                            ${getDashboardIconSvg("check-circle", "w-10 h-10 mb-3 opacity-20")}
                            <p class="text-xs font-bold uppercase tracking-widest">Tudo operando normalmente</p>
                        </div>`;
                    return;
                }

                container.innerHTML = feed
                    .map(
                        (f) => `
                    <div onclick="executeRadarAction('${f.type}', '${f.id}', '${f.param}')" class="interactive-surface flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 hover:border-fuchsia-400/50 cursor-pointer transition-colors group">
                        <div class="flex items-center space-x-4">
                            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.bg} ${f.color}">
                                ${getDashboardIconSvg(f.icon, "w-5 h-5")}
                            </div>
                            <div>
                                <p class="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-amber-300 transition-colors">${f.title}</p>
                                <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-0.5 line-clamp-1">${f.desc}</p>
                            </div>
                        </div>
                        ${getDashboardIconSvg("chevron-right", "w-4 h-4 text-zinc-400 group-hover:text-amber-300 transition-colors flex-shrink-0 ml-2")}
                    </div>
                `,
                    )
                    .join("");
            };

            const renderStatCard = (title, val, icon, colorClass) => `
                <div class="interactive-surface bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm hover:border-fuchsia-400/50 transition-colors">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-10 h-10 ${colorClass} rounded-xl flex items-center justify-center">${getDashboardIconSvg(icon, "w-5 h-5")}</div>
                    </div>
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">${title}</p>
                        <p class="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">${val}</p>
                    </div>
                </div>
            `;

            // --- INVENTORY ---
            const renderInventory = () => {
                const query = document.getElementById("inventory-search")?.value.toLowerCase() || "";
                state.inventory = normalizeInventoryItems(state.inventory);
                let filtered = state.inventory.filter((i) => {
                    const assetText = getAssetUnits(i).map((unit) => `${unit.patrimony} ${unit.serialNumber}`).join(" ").toLowerCase();
                    return i.name.toLowerCase().includes(query) || i.category.toLowerCase().includes(query) || assetText.includes(query);
                });

                // Sort by name A-Z
                filtered.sort((a, b) => a.name.localeCompare(b.name));

                const totalVal = filtered.reduce((a, b) => a + b.quantity * b.price, 0);
                setTextIfPresent("inventory-total-value", `R$ ${totalVal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, { warn: true });

                document.getElementById("inventory-add-btn")?.classList.toggle("hidden", !canEditInventory());

                const tbody = document.getElementById("inventory-table-body");
                if (!tbody) return;
                if (!filtered.length) {
                    tbody.innerHTML = `<tr><td colspan="6" class="py-10 text-center text-zinc-500 font-bold text-sm">Nenhum produto encontrado.</td></tr>`;
                    return;
                }

                tbody.innerHTML = filtered
                    .map(
                        (item, idx) => {
                            const stats = getAssetIdentityStats(item);
                            const sampleUnits = getAssetUnits(item).filter((unit) => !unit.noIdentifier && (unit.patrimony || unit.serialNumber)).slice(0, 2);
                            return `
                    <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group cursor-pointer" onclick="switchView('detail', '${item.id}')">
                        <td class="px-6 py-4">
                            <div class="flex items-start space-x-3">
                                <span class="text-xs font-mono text-zinc-400 font-bold w-4 pt-1">${idx + 1}</span>
                                <div>
                                    <span class="text-sm font-bold text-zinc-900 dark:text-white block">${item.name}</span>
                                    <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mt-1">Usuário da sessão: ${getLatestWithdrawalName(item.id)}</span>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4"><span class="text-[10px] font-black uppercase bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 px-2 py-1 rounded-md tracking-wider">${item.category}</span></td>
                        <td class="px-6 py-4">
                            <div class="space-y-1">
                                <span class="text-[10px] font-black uppercase tracking-widest ${stats.identified ? "text-amber-600 dark:text-amber-400" : "text-zinc-400"}">${getAssetIdentitySummary(item)}</span>
                                ${sampleUnits.length ? `<div class="text-[10px] font-bold text-zinc-500">${sampleUnits.map((unit) => `${unit.patrimony || "sem pat."} / ${unit.serialNumber || "sem serie"}`).join("<br>")}</div>` : ""}
                            </div>
                        </td>
                        <td class="px-6 py-4 font-black text-lg ${item.quantity === 0 ? "text-fuchsia-500" : "text-zinc-900 dark:text-white"}">${item.quantity}</td>
                        <td class="px-6 py-4">${getStatusBadge(item.status)}</td>
                        <td class="px-6 py-4 text-right">
                            ${canEditInventory() ? `<div class="inline-flex items-center gap-1"><button type="button" data-open-modal="in" data-item-id="${item.id}" class="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-500 hover:bg-amber-500/20 rounded-lg transition-colors" title="Entrada"><i data-lucide="arrow-down-left" class="w-4 h-4"></i></button><button type="button" data-open-modal="out" data-item-id="${item.id}" class="p-2 bg-amber-400/10 text-amber-600 dark:text-amber-400 hover:bg-amber-400/20 rounded-lg transition-colors" title="Saída"><i data-lucide="arrow-up-right" class="w-4 h-4"></i></button><button type="button" data-open-modal="delete" data-item-id="${item.id}" class="p-2 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-500 hover:bg-fuchsia-500/20 rounded-lg transition-colors" title="Apagar"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>` : `<span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Leitura</span>`}
                        </td>
                    </tr>
                `;
                        },
                    )
                    .join("");
            };

            const updateUsersFilterCount = () => {
                const countEl = document.getElementById("users-filter-count");
                const filters = [document.getElementById("users-role-filter")?.value, document.getElementById("users-status-filter")?.value, document.getElementById("users-sort-filter")?.value];
                const activeCount = filters.filter((value) => value && !["all", "name-asc"].includes(value)).length;
                if (!countEl) return;
                countEl.textContent = activeCount;
                countEl.classList.toggle("hidden", activeCount === 0);
                countEl.classList.toggle("inline-flex", activeCount > 0);
            };

            const renderUserLogsPanel = () => {
                const panel = document.getElementById("users-log-panel");
                if (!panel) return;
                const selectedUser = getUserById(state.selectedUserLogId);
                if (!selectedUser) {
                    panel.innerHTML = `<div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm text-zinc-500 text-sm font-semibold">Clique em um usuário para abrir o histórico completo de logs.</div>`;
                    return;
                }
                const logs = getUserLogHistory(selectedUser.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                panel.innerHTML = `
                    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-5">
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Histórico completo</p>
                                <h3 class="text-xl font-black text-zinc-900 dark:text-white">${selectedUser.id === state.currentUser?.id ? (state.currentUser?.name || selectedUser.name) : selectedUser.name}</h3>
                                <p class="text-sm font-medium text-zinc-500 mt-1">${selectedUser.email} · ${normalizeRole(selectedUser.role)}</p>
                            </div>
                            <div class="flex items-center gap-2">
                                ${getRoleBadge(selectedUser.role)}
                                ${getUserStatusBadge(selectedUser.status)}
                            </div>
                        </div>
                        <div class="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                            ${logs.length ? logs.map((log) => {
                                const actor = getUserById(log.actorId);
                                const isTarget = log.targetUserId === selectedUser.id;
                                return `
                                    <div class="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/80 dark:bg-black/30">
                                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                                            <div class="flex flex-wrap items-center gap-2">
                                                <span class="px-2 py-1 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-black text-[10px] font-black uppercase tracking-widest">${log.section}</span>
                                                <span class="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest">${isTarget ? "na conta" : "ação do usuário"}</span>
                                            </div>
                                            <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">${new Date(log.createdAt).toLocaleString("pt-BR")}</span>
                                        </div>
                                        <p class="text-sm font-bold text-zinc-900 dark:text-white leading-relaxed">${log.message}</p>
                                        <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-3">Responsável: ${log?.actorName || log?.sessionName || actor?.name || log.actorId || "Sistema"}</p>
                                    </div>
                                `;
                            }).join("") : `<div class="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-6 text-sm font-semibold text-zinc-500 text-center">Nenhum log encontrado para este usuário.</div>`}
                        </div>
                    </div>
                `;
            };

            const renderUsers = () => {
                if (!canAccessUsersView()) return;
                const search = (document.getElementById("users-search")?.value || "").toLowerCase().trim();
                const rawRoleFilter = document.getElementById("users-role-filter")?.value || "all";
                const roleFilter = rawRoleFilter === "all" ? "all" : normalizeRole(rawRoleFilter);
                const statusFilter = document.getElementById("users-status-filter")?.value || "all";
                const sortFilter = document.getElementById("users-sort-filter")?.value || "name-asc";
                let users = state.users
                    .filter((user) => {
                        const normalizedRole = normalizeRole(user.role);
                        const hitSearch = !search || user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search) || user.id.toLowerCase().includes(search);
                        const hitRole = roleFilter === "all" || normalizedRole === roleFilter;
                        const hitStatus = statusFilter === "all" || user.status === statusFilter;
                        return hitSearch && hitRole && hitStatus;
                    });

                users.sort((a, b) => {
                    if (sortFilter === "lastAccess-desc") return new Date(b.lastAccess || 0) - new Date(a.lastAccess || 0);
                    if (sortFilter === "role") return normalizeRole(a.role).localeCompare(normalizeRole(b.role)) || a.name.localeCompare(b.name);
                    if (sortFilter === "status") return a.status.localeCompare(b.status) || a.name.localeCompare(b.name);
                    return a.name.localeCompare(b.name);
                });

                const active = state.users.filter((user) => user.status === "active").length;
                const admins = state.users.filter((user) => normalizeRole(user.role) === "Administrador").length;
                const operators = state.users.filter((user) => normalizeRole(user.role) === "Operador").length;
                setHtmlIfPresent("users-stats", `
                    ${renderStatCard("Total de usuários", state.users.length, "users", "bg-fuchsia-500/10 text-fuchsia-500")}
                    ${renderStatCard("Admins", admins, "shield-check", "bg-amber-400/10 text-amber-400")}
                    ${renderStatCard("Usuários ativos", active, "user-check", "bg-amber-500/10 text-amber-500")}
                `);

                const tbody = document.getElementById("users-table-body");
                if (!tbody) {
                    updateUsersFilterCount();
                    renderUserLogsPanel();
                    return;
                }
                if (!users.length) {
                    tbody.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-zinc-500 font-bold text-sm">Nenhum utilizador encontrado.</td></tr>`;
                    updateUsersFilterCount();
                    renderUserLogsPanel();
                    return;
                }

                if (!state.selectedUserLogId || !getUserById(state.selectedUserLogId)) state.selectedUserLogId = users[0]?.id || null;

                tbody.innerHTML = users
                    .map((user) => {
                        const isSelected = state.selectedUserLogId === user.id;
                        return `
                        <tr onclick="openUserLogs('${user.id}')" class="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer ${isSelected ? "bg-amber-400/5" : ""}">
                            <td class="px-6 py-4">
                                <div>
                                    <p class="text-sm font-bold text-zinc-900 dark:text-white">${user.id === state.currentUser?.id ? (state.currentUser?.name || user.name) : user.name}</p>
                                    <p class="text-[10px] uppercase tracking-widest font-black text-zinc-400 mt-1">${user.email}</p>
                                </div>
                            </td>
                            <td class="px-6 py-4">${getRoleBadge(user.role)}</td>
                            <td class="px-6 py-4">${getUserStatusBadge(user.status)}</td>
                            <td class="px-6 py-4 text-sm font-bold text-zinc-500">${user.lastAccess ? new Date(user.lastAccess).toLocaleString("pt-BR") : "Nunca acessou"}</td>
                            <td class="px-6 py-4 text-right">
                                <div class="inline-flex items-center gap-2">
                                    ${canManageUsers() ? `<button onclick="event.stopPropagation(); openModal('user-edit', '${user.id}')" class="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-amber-400 rounded-lg transition-colors" title="Editar">${getActionIcon("pencil")}</button>` : ``}
                                    <button onclick="event.stopPropagation(); openUserLogs('${user.id}')" class="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-fuchsia-500 rounded-lg transition-colors" title="Ver logs">${getActionIcon("logs")}</button>
                                    ${canManageUsers() && user.id !== state.currentUser?.id ? `<button onclick="event.stopPropagation(); toggleUserStatus('${user.id}')" class="p-2 ${user.status === "active" ? "bg-fuchsia-500/10 text-fuchsia-500 hover:bg-fuchsia-500/20" : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"} rounded-lg transition-colors" title="${user.status === "active" ? "Desativar" : "Ativar"}">${getActionIcon(user.status === "active" ? "userX" : "userCheck")}</button>` : `<span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">${user.id === state.currentUser?.id ? "Sessão atual" : "Somente leitura"}</span>`}
                                </div>
                            </td>
                        </tr>
                    `}).join("");

                updateUsersFilterCount();
                renderUserLogsPanel();
                if (window.lucide) { lucide.createIcons(); requestAnimationFrame(() => lucide.createIcons()); }
            };

            window.openUserLogs = (id) => {
                state.selectedUserLogId = id;
                renderUsers();
            };

            window.toggleUsersFilters = () => {
                state.usersFiltersOpen = !state.usersFiltersOpen;
                document.getElementById("users-filter-panel")?.classList.toggle("hidden", !state.usersFiltersOpen);
            };

            window.clearUsersFilters = () => {
                setValueIfPresent("users-role-filter", "all");
                setValueIfPresent("users-status-filter", "all");
                setValueIfPresent("users-sort-filter", "name-asc");
                state.usersFiltersOpen = false;
                document.getElementById("users-filter-panel")?.classList.add("hidden");
                renderUsers();
            };

            window.toggleUserStatus = async (id) => {
                if (!requirePermission(canManageUsers(), "Somente administradores ou desenvolvedores podem alterar utilizadores.")) return;
                const user = getUserById(id);
                if (!user) return;
                const nextStatus = user.status === "active" ? "inactive" : "active";
                try {
                    if (remoteStateReady) {
                        await updateRemoteUser(user.id, { status: nextStatus });
                    } else {
                        user.status = nextStatus;
                        saveUsers();
                        logActivity({ section: "users", action: "status", targetUserId: user.id, message: `${getActorName()} alterou o status de ${user.name} para ${nextStatus === "active" ? "ativo" : "inativo"}.` });
                    }
                    renderUsers();
                    showToast(`Utilizador ${nextStatus === "active" ? "ativado" : "desativado"} com sucesso.`);
                } catch (error) {
                    console.error(error);
                    showToast(error.message || "Não foi possível atualizar o utilizador.", "error");
                }
            };

            // --- PURCHASES (DRAG & DROP) ---
            const renderPurchases = () => {
                const container = document.getElementById("purchases-container");
                if (!container) return;
                const totalCost = state.purchaseNeeds.reduce((a, b) => a + b.manualPurchaseQty * b.price, 0);
                setTextIfPresent("purchase-total-cost", `R$ ${totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, { warn: true });

                document.getElementById("purchase-send-btn")?.classList.toggle("hidden", !canManagePurchases());
                document.getElementById("purchase-add-btn")?.classList.toggle("hidden", !canManagePurchases());

                if (!state.purchaseNeeds.length) {
                    container.innerHTML = `<div class="p-20 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem]">Lista de reposição vazia</div>`;
                    return;
                }

                container.innerHTML = state.purchaseNeeds
                    .map(
                        (item, idx) => `
                    <div draggable="true" ondragstart="handleDragStart(event, '${item.id}')" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, '${item.id}')" ondragend="handleDragEnd(event)" class="interactive-surface bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 rounded-[2rem] flex items-center justify-between group hover:border-amber-400 transition-all cursor-grab active:cursor-grabbing">
                        <div class="flex items-center space-x-6">
                            <div class="text-zinc-300 dark:text-zinc-700 ml-2"><i data-lucide="grip-vertical" class="w-5 h-5"></i></div>
                            <div class="w-14 h-14 bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center rounded-2xl font-black text-2xl">${item.manualPurchaseQty}</div>
                            <div>
                                <h4 class="font-bold text-lg text-zinc-900 dark:text-white">${item.name}</h4>
                                <div class="flex items-center mt-1 space-x-4">
                                    <p class="text-[10px] text-zinc-500 uppercase tracking-widest font-black"><i data-lucide="package" class="w-3 h-3 inline mr-1"></i> Em Estoque: ${item.quantity}</p>
                                    <p class="text-[10px] ${item.deadline ? "text-amber-600 dark:text-amber-400" : "text-zinc-400"} uppercase tracking-widest font-black"><i data-lucide="calendar" class="w-3 h-3 inline mr-1"></i> Prazo: ${item.deadline ? new Date(item.deadline + "T00:00:00").toLocaleDateString("pt-BR") : "Livre"}</p>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center space-x-8 pr-2">
                            <div class="text-right">
                                <p class="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Estimativa</p>
                                <p class="font-bold text-zinc-900 dark:text-white">R$ ${(item.manualPurchaseQty * item.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                            </div>
                            ${canManagePurchases() ? `<button onclick="cancelPurchase('${item.id}')" class="p-3 bg-fuchsia-500/10 text-fuchsia-500 hover:bg-fuchsia-500 hover:text-white rounded-xl transition-all" title="Remover"><i data-lucide="x" class="w-4 h-4"></i></button>` : `<span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Leitura</span>`}
                        </div>
                    </div>
                `,
                    )
                    .join("");
            };

            let dragSrcId = null;
            window.handleDragStart = (e, id) => {
                dragSrcId = id;
                e.target.style.opacity = "0.5";
                e.dataTransfer.effectAllowed = "move";
            };
            window.handleDragOver = (e) => {
                e.preventDefault();
                e.currentTarget.classList.add("drag-over");
            };
            window.handleDragLeave = (e) => {
                e.currentTarget.classList.remove("drag-over");
            };
            window.handleDragEnd = (e) => {
                e.target.style.opacity = "1";
            };
            window.handleDrop = (e, targetId) => {
                e.preventDefault();
                e.currentTarget.classList.remove("drag-over");
                if (dragSrcId === targetId) return;

                // Reorder in purchaseNeeds array logic
                const idx1 = state.purchaseNeeds.findIndex((i) => i.id === dragSrcId);
                const idx2 = state.purchaseNeeds.findIndex((i) => i.id === targetId);
                const draggedItem = state.purchaseNeeds[idx1];
                state.purchaseNeeds.splice(idx1, 1);
                state.purchaseNeeds.splice(idx2, 0, draggedItem);

                // Simple re-render with new array order
                renderPurchases();
                refreshIcons();
            };

            window.cancelPurchase = (id) => {
                if (!requirePermission(canManagePurchases(), "Somente operadores, desenvolvedores e administradores alteram requisições.")) return;
                const item = state.inventory.find((i) => String(i.id) === String(id));
                if (item) {
                    item.manualPurchaseQty = 0;
                    item.deadline = null;
                    logActivity({ section: "purchases", action: "cancel", message: `${getActorName()} removeu ${item.name} da lista de compras.` });
                    queueRemoteStatePersist("inventory", "activityLogs");
                }
                computeData();
                renderPurchases();
                if (window.lucide) lucide.createIcons();
            };

            const renderMaintenance = () => {
                syncMaintenanceSettings();
                const container = document.getElementById("maintenance-container");
                const statsEl = document.getElementById("maintenance-stats");
                if (!container || !statsEl) return;

                document.getElementById("maintenance-add-btn")?.classList.toggle("hidden", !canEditInventory());

                const total = state.maintenanceRecords.length;
                const active = state.maintenanceRecords.filter((record) => record.status !== "returned").length;
                const late = state.maintenanceRecords.filter((record) => record.status !== "returned" && isMaintenanceLate(record)).length;
                statsEl.innerHTML = `
                    ${renderStatCard("Total enviados", total, "wrench", "bg-amber-400/10 text-amber-300")}
                    ${renderStatCard("Em manutencao", active, "timer", "bg-amber-500/15 text-amber-300")}
                    ${renderStatCard("Atrasados", late, "alert-triangle", "bg-fuchsia-500/15 text-fuchsia-300")}
                `;

                const records = [...state.maintenanceRecords].sort((a, b) => {
                    const lateDiff = Number(isMaintenanceLate(b)) - Number(isMaintenanceLate(a));
                    if (lateDiff) return lateDiff;
                    return new Date(b.sentDate || b.createdAt) - new Date(a.sentDate || a.createdAt);
                });

                if (!records.length) {
                    container.innerHTML = `
                        <div class="xl:col-span-2 p-16 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem]">
                            Nenhum item enviado para manutencao.
                        </div>
                    `;
                    refreshIcons();
                    return;
                }

                container.innerHTML = records.map((record) => {
                    const lateDays = getMaintenanceDelayDays(record);
                    const identity = record.noIdentifier ? "Patrimonio/serie nulos" : `${record.patrimony || "sem patrimonio"} / ${record.serialNumber || "sem serie"}`;
                    return `
                        <div class="interactive-surface rounded-[2rem] border ${lateDays ? "border-fuchsia-500/60 bg-fuchsia-500/[0.04]" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"} p-6 shadow-sm relative overflow-hidden">
                            ${lateDays ? `<div class="absolute left-0 top-0 bottom-0 w-1.5 bg-fuchsia-500 animate-pulse"></div>` : `<div class="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400"></div>`}
                            <div class="pl-2 space-y-5">
                                <div class="flex items-start justify-between gap-4">
                                    <div>
                                        <div class="flex flex-wrap items-center gap-2 mb-2">
                                            ${getMaintenanceStatusBadge(record)}
                                            <span class="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest">${escapeHtml(record.category)}</span>
                                        </div>
                                        <h3 class="text-lg font-black text-zinc-900 dark:text-white">${escapeHtml(record.itemName)}</h3>
                                        <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">${escapeHtml(identity)}</p>
                                    </div>
                                    ${record.status !== "returned" && canEditInventory() ? `<button onclick="completeMaintenance('${record.id}')" class="px-3 py-2 rounded-xl bg-amber-400/10 text-amber-300 text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 hover:text-black transition-colors">Retornou</button>` : ""}
                                </div>
                                <div class="grid grid-cols-2 gap-3">
                                    <div class="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/70 dark:bg-black/30">
                                        <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Data de ida</p>
                                        <p class="text-sm font-black mt-1">${formatDateOnly(record.sentDate)}</p>
                                    </div>
                                    <div class="rounded-2xl border ${lateDays ? "border-fuchsia-500/40 bg-fuchsia-500/10" : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-black/30"} p-3">
                                        <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Data de volta</p>
                                        <p class="text-sm font-black mt-1">${formatDateOnly(record.returnDate)}</p>
                                        ${lateDays ? `<p class="text-[10px] font-black uppercase tracking-widest text-fuchsia-300 mt-1">${lateDays} dia${lateDays === 1 ? "" : "s"} de atraso</p>` : ""}
                                    </div>
                                </div>
                                <div class="space-y-3">
                                    <div>
                                        <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Observacoes</p>
                                        <p class="text-sm font-semibold text-zinc-600 dark:text-zinc-300 leading-relaxed">${escapeHtml(record.notes || "Sem observacoes.")}</p>
                                    </div>
                                    <div class="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-3">
                                        <p class="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-1">Efeito de atraso</p>
                                        <p class="text-sm font-semibold text-zinc-700 dark:text-zinc-200 leading-relaxed">${escapeHtml(record.delayEffect || "Nao informado.")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join("");
                refreshIcons();
            };

            // --- INFRA ---
            const INFRA_FILTERS = ["all", "attention", "keep", "replace"];
            const getActiveInfraUnit = () => {
                const unit = Number(state.infraUnit);
                return [1, 2, 3].includes(unit) ? unit : 1;
            };
            const syncInfraTabButtons = () => {
                state.infraUnit = getActiveInfraUnit();
                const activeClass = "px-8 py-2.5 rounded-lg font-bold text-sm transition-all bg-amber-400 text-black shadow-sm whitespace-nowrap";
                const inactiveClass = "px-8 py-2.5 rounded-lg font-bold text-sm transition-all text-zinc-400 hover:text-white whitespace-nowrap";

                document.getElementById("tab-unit-1").className = state.infraUnit === 1 ? activeClass : inactiveClass;
                document.getElementById("tab-unit-2").className = state.infraUnit === 2 ? activeClass : inactiveClass;
                document.getElementById("tab-unit-3").className = state.infraUnit === 3 ? activeClass : inactiveClass;
            };
            let infraRenderTimer = null;
            let infraLastScrollTop = 0;
            const setInfraToolbarCollapsed = (collapsed) => {
                state.infraToolbarCollapsed = Boolean(collapsed);
                const toolbar = document.getElementById("infra-toolbar");
                const content = document.getElementById("infra-content");
                if (toolbar) toolbar.classList.toggle("is-collapsed", state.infraToolbarCollapsed);
                if (content) content.classList.toggle("infra-content-expanded", state.infraToolbarCollapsed);
            };
            const handleInfraContentScroll = () => {
                if (state.currentView !== "infra") return;
                const content = document.getElementById("infra-content");
                if (!content) return;
                const top = Math.max(0, content.scrollTop || 0);
                const delta = top - infraLastScrollTop;
                if (top <= 16) {
                    setInfraToolbarCollapsed(false);
                } else if (delta > 8) {
                    setInfraToolbarCollapsed(true);
                } else if (delta < -8) {
                    setInfraToolbarCollapsed(false);
                }
                infraLastScrollTop = top;
            };
            const initInfraAutoToolbar = () => {
                const content = document.getElementById("infra-content");
                if (!content) return;
                content.removeEventListener("scroll", handleInfraContentScroll);
                content.addEventListener("scroll", handleInfraContentScroll, { passive: true });
                setInfraToolbarCollapsed(state.infraToolbarCollapsed && content.scrollTop > 16);
            };
            const scheduleInfraRender = (delay = 90) => {
                clearTimeout(infraRenderTimer);
                infraRenderTimer = setTimeout(() => {
                    infraRenderTimer = null;
                    renderInfra();
                }, delay);
            };
            const roomMatchesInfraStatus = (room, filter = state.infraFilter) => {
                const qualities = getRoomEquipmentEntries(room).map((entry) => entry.quality);
                if (filter === "replace") return qualities.includes("replace");
                if (filter === "keep") return qualities.includes("keep");
                if (filter === "attention") return qualities.some((quality) => ["keep", "replace"].includes(quality));
                return true;
            };
            const roomMatchesInfraSearch = (room) => {
                const query = normalizeComparableName(state.infraSearch || "");
                if (!query) return true;
                const entries = getRoomEquipmentEntries(room);
                const haystack = [
                    room.name,
                    room.floor,
                    room.unit === 3 ? "setores" : `unidade ${room.unit}`,
                    room.equip?.obs,
                    ...entries.flatMap((entry) => [entry.label, entry.short, entry.value, entry.meta.label]),
                ]
                    .map((value) => normalizeComparableName(value || ""))
                    .join(" ");
                return haystack.includes(query);
            };
            const getInfraRoomsForActiveUnit = () => {
                state.infraUnit = getActiveInfraUnit();
                return state.infraRooms.filter((room) => Number(room.unit) === state.infraUnit);
            };
            window.switchInfraTab = (u) => {
                const unit = Number(u);
                state.infraUnit = [1, 2, 3].includes(unit) ? unit : 1;
                setInfraToolbarCollapsed(false);
                syncInfraTabButtons();
                renderInfra();
            };

            const roomMatchesInfraFilter = (room) => {
                return roomMatchesInfraStatus(room) && roomMatchesInfraSearch(room);
            };

            const updateInfraFilterButtons = () => {
                const baseRooms = getInfraRoomsForActiveUnit().filter(roomMatchesInfraSearch);
                const counts = {
                    all: baseRooms.length,
                    attention: baseRooms.filter((room) => roomMatchesInfraStatus(room, "attention")).length,
                    keep: baseRooms.filter((room) => roomMatchesInfraStatus(room, "keep")).length,
                    replace: baseRooms.filter((room) => roomMatchesInfraStatus(room, "replace")).length,
                };
                INFRA_FILTERS.forEach((filter) => {
                    const el = document.getElementById(`infra-filter-${filter}`);
                    if (!el) return;
                    const active = state.infraFilter === filter;
                    el.className = `infra-filter-chip inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${active ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20" : "bg-white/[0.04] text-zinc-400 hover:bg-fuchsia-500/10 hover:text-fuchsia-200"}`;
                    const countEl = document.getElementById(`infra-filter-${filter}-count`);
                    if (countEl) {
                        countEl.textContent = counts[filter] ?? 0;
                        countEl.className = `infra-filter-count min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-[10px] ${active ? "bg-black/10 text-black" : "bg-white/[0.06] text-zinc-300"}`;
                    }
                });
            };

            window.setInfraFilter = (filter) => {
                state.infraFilter = INFRA_FILTERS.includes(filter) ? filter : "all";
                renderInfra();
            };

            window.setInfraSearch = (value) => {
                state.infraSearch = String(value || "");
                scheduleInfraRender();
            };

            window.clearInfraFilters = () => {
                state.infraFilter = "all";
                state.infraSearch = "";
                setInfraToolbarCollapsed(false);
                setValueIfPresent("infra-search", "");
                renderInfra();
            };

            const renderInfraRoomHistoryPanel = () => {
                const panel = document.getElementById("infra-room-history-panel");
                if (!panel) return;
                const room = getRoomById(state.selectedRoomLogId);
                if (!room) {
                    panel.innerHTML = `
                        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm text-sm font-semibold text-zinc-500">
                            Clique em <span class="text-zinc-900 dark:text-white">Histórico</span> em uma sala para ver todas as alterações registradas.
                        </div>
                    `;
                    return;
                }
                const logs = getRoomLogHistory(room.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                panel.innerHTML = `
                    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-5">
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Histórico da sala</p>
                                <h3 class="text-xl font-black text-zinc-900 dark:text-white">${room.name}</h3>
                                <p class="text-sm font-medium text-zinc-500 mt-1">${room.floor} · ${room.unit === 3 ? "Setores" : `Unidade ${room.unit}`}</p>
                            </div>
                            <button onclick="state.selectedRoomLogId = null; renderInfraRoomHistoryPanel()" class="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-black uppercase tracking-widest text-zinc-500 hover:border-amber-400 transition-colors">Fechar</button>
                        </div>
                        <div class="space-y-3 max-h-[360px] overflow-y-auto pr-2">
                            ${logs.length ? logs.map((log) => {
                                const actor = getUserById(log.actorId);
                                return `
                                    <div class="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/80 dark:bg-black/30">
                                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                                            <span class="px-2 py-1 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-black text-[10px] font-black uppercase tracking-widest">${log.action === "room-update" ? "Atualização" : log.action}</span>
                                            <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">${new Date(log.createdAt).toLocaleString("pt-BR")}</span>
                                        </div>
                                        <p class="text-sm font-bold text-zinc-900 dark:text-white leading-relaxed">${log.message}</p>
                                        <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-3">Responsável: ${log?.actorName || log?.sessionName || actor?.name || log.actorId || "Sistema"}</p>
                                    </div>
                                `;
                            }).join("") : `<div class="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-6 text-sm font-semibold text-zinc-500 text-center">Nenhum histórico encontrado para esta sala.</div>`}
                        </div>
                    </div>
                `;
                if (window.lucide) lucide.createIcons();
            };

            window.openRoomHistory = (id) => {
                state.selectedRoomLogId = id;
                renderInfraRoomHistoryPanel();
                document.getElementById("infra-room-history-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
            };

            const renderInfra = () => {
                syncInfraTabButtons();
                setValueIfPresent("infra-search", state.infraSearch || "");
                updateInfraFilterButtons();
                const rooms = getInfraRoomsForActiveUnit().filter(roomMatchesInfraFilter);

                const grouped = {};
                rooms.forEach((r) => {
                    ensureRoomEquipmentState(r);
                    if (!grouped[r.floor]) grouped[r.floor] = [];
                    grouped[r.floor].push(r);
                });

                const floors = Object.keys(grouped).sort((a, b) => {
                    if (a.includes("Especiais")) return -1;
                    if (b.includes("Especiais")) return 1;
                    return a.localeCompare(b, undefined, { numeric: true });
                });

                const container = document.getElementById("infra-content");
                if (!container) return;
                if (!floors.length) {
                    container.innerHTML = `
                        <div class="interactive-surface surface-card soft-glow rounded-3xl p-10 text-center">
                            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300">
                                <i data-lucide="search-x" class="h-5 w-5"></i>
                            </div>
                            <p class="text-sm font-black uppercase tracking-widest text-zinc-400">Nenhuma sala encontrada</p>
                            <p class="mt-2 text-sm font-semibold text-zinc-500">Ajuste a busca ou troque o filtro ativo.</p>
                            <button onclick="clearInfraFilters()" class="mt-5 rounded-xl bg-amber-400 px-5 py-3 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-amber-500">Limpar filtros</button>
                        </div>
                    `;
                    initInfraAutoToolbar();
                    refreshIcons();
                    return;
                }

                container.innerHTML = floors
                    .map((floor) => {
                        const floorRooms = grouped[floor];
                        return `
                        <div>
                            <h3 class="infra-floor-title text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 pb-2">${floor}</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                ${floorRooms
                                    .map((room) => {
                                        const equipmentEntries = getRoomEquipmentEntries(room);
                                        const activeCount = equipmentEntries.filter((entry) => entry.quality !== "absent").length;
                                        const borderColor = getRoomBorderColor(room);
                                        const statusIndicator = getRoomStatusIndicator(room);

                                        return `
                                    <div id="room-${room.id}" class="interactive-surface surface-card soft-glow room-card border ${borderColor} p-5 rounded-2xl transition-all duration-200 group relative">
                                        <div class="flex justify-between items-start gap-3 mb-4">
                                            <div>
                                                <h4 class="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-amber-300 transition-colors">${room.name}</h4>
                                                <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">${activeCount} item${activeCount === 1 ? "" : "s"} mapeado${activeCount === 1 ? "" : "s"}</p>
                                            </div>
                                            ${statusIndicator}
                                        </div>
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            ${equipmentEntries
                                                .map(
                                                    (entry) => `
                                                <div class="surface-inset rounded-2xl border ${entry.meta.card} px-3 py-3 min-h-[92px] flex flex-col justify-between">
                                                    <div class="flex items-center justify-between gap-2">
                                                        <span class="text-[10px] font-black uppercase tracking-widest text-zinc-500">${entry.label}</span>
                                                        <i data-lucide="${entry.icon}" class="w-3.5 h-3.5 text-zinc-400"></i>
                                                    </div>
                                                    <div class="mt-2">
                                                        <p class="text-xs font-bold text-zinc-900 dark:text-white leading-tight break-words">${entry.value || "Ausente"}</p>
                                                    </div>
                                                    <div class="mt-3 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest w-fit ${entry.meta.badge}">
                                                        <span class="w-2 h-2 rounded-full ${entry.meta.dot}"></span>
                                                        ${entry.meta.label}
                                                    </div>
                                                </div>
                                            `,
                                                )
                                                .join("")}
                                        </div>
                                        ${
                                            room.equip.obs
                                                ? `<div class="surface-inset mt-4 rounded-2xl px-3 py-2">
                                                    <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Observações</p>
                                                    <p class="text-xs font-bold text-zinc-600 dark:text-zinc-300 break-words">${room.equip.obs}</p>
                                                </div>`
                                                : ""
                                        }
                                        <div class="mt-4 flex items-center justify-between gap-3">
                                            <button onclick="event.stopPropagation(); openRoomHistory('${room.id}')" class="surface-inset soft-glow flex-1 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-2">
                                                <i data-lucide="history" class="w-4 h-4"></i>
                                                Histórico
                                            </button>
                                            ${canEditInfra() ? `<button onclick="event.stopPropagation(); openModal('edit-room', '${room.id}')" class="flex-1 px-3 py-2 rounded-xl bg-amber-400 text-black text-xs font-black uppercase tracking-widest hover:bg-amber-500 transition-colors flex items-center justify-center gap-2">${getActionIcon("pencil")}Editar</button>` : ``}
                                        </div>
                                    </div>
                                    `;
                                    })
                                    .join("")}
                            </div>
                        </div>
                    `;
                    })
                    .join("");

                initInfraAutoToolbar();
                refreshIcons();
            };

            // --- INSIGHTS ---
            const renderInsights = () => {
                const totalInvested = state.inventory.reduce((a, b) => a + b.quantity * b.price, 0);
                const committed = state.purchaseNeeds.reduce((a, b) => a + b.manualPurchaseQty * b.price, 0);

                const catValues = {};
                CATEGORIES.forEach((c) => (catValues[c] = 0));
                state.inventory.forEach((i) => {
                    if (catValues[i.category] !== undefined) catValues[i.category] += i.quantity * i.price;
                    else catValues["Outros"] += i.quantity * i.price;
                });
                const topCat = Object.keys(catValues).reduce((a, b) => (catValues[a] > catValues[b] ? a : b));

                setHtmlIfPresent("insights-stats", `
                    <div class="interactive-surface bg-zinc-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                        <i data-lucide="landmark" class="w-24 h-24 absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform"></i>
                        <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Capital Alocado</p>
                        <p class="text-3xl font-black relative z-10">R$ ${totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div class="interactive-surface bg-amber-400 text-black p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                        <i data-lucide="receipt" class="w-24 h-24 absolute -right-6 -bottom-6 opacity-20 group-hover:scale-110 transition-transform"></i>
                        <p class="text-[10px] font-black uppercase tracking-widest text-amber-900 mb-2">Despesa Projetada</p>
                        <p class="text-3xl font-black relative z-10">R$ ${committed.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div class="interactive-surface bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2rem] shadow-sm relative overflow-hidden group">
                        <i data-lucide="award" class="w-24 h-24 absolute -right-6 -bottom-6 opacity-[0.03] dark:opacity-5 group-hover:scale-110 transition-transform"></i>
                        <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Categoria Mais Valiosa</p>
                        <p class="text-3xl font-black text-zinc-900 dark:text-white relative z-10">${topCat}</p>
                    </div>
                `);

                const isDark = document.documentElement.classList.contains("dark");
                const textColor = isDark ? "#a1a1aa" : "#52525b";
                if (window.Chart) {
                    Chart.defaults.color = textColor;
                    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
                }

                insightsChartCat = destroyChartIfExists(insightsChartCat);
                insightsChartCat = renderSafeDonutChart(
                    "chart-categories",
                    CATEGORIES,
                    CATEGORIES.map((c) => catValues[c]),
                    {
                        type: "doughnut",
                        data: {
                            labels: CATEGORIES,
                            datasets: [
                                {
                                    data: CATEGORIES.map((c) => catValues[c]),
                                    backgroundColor: ["#e879f9", "#c026d3", isDark ? "#52525b" : "#a1a1aa", isDark ? "#3f3f46" : "#d4d4d8", isDark ? "#27272a" : "#e4e4e7"],
                                    borderWidth: 0,
                                    hoverOffset: 5,
                                },
                            ],
                        },
                        options: { responsive: true, maintainAspectRatio: false, cutout: "70%", plugins: { legend: { position: "right" } } },
                    }
                );

                insightsChartTop = destroyChartIfExists(insightsChartTop);
                const top5 = [...state.inventory].sort((a, b) => b.quantity * b.price - a.quantity * a.price).slice(0, 5);
                insightsChartTop = renderSafeBarChart(
                    "chart-top-value",
                    top5.map((i) => (i.name.length > 15 ? i.name.substring(0, 15) + "..." : i.name)),
                    top5.map((i) => i.quantity * i.price),
                    {
                        type: "bar",
                        data: {
                            labels: top5.map((i) => (i.name.length > 15 ? i.name.substring(0, 15) + "..." : i.name)),
                            datasets: [{ data: top5.map((i) => i.quantity * i.price), backgroundColor: "#e879f9", borderRadius: 6 }],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true, grid: { color: isDark ? "#27272a" : "#f4f4f5" } }, x: { grid: { display: false } } },
                        },
                    }
                );
            };

            // --- SETTINGS ---
            const renderSettingsPage = () => {
                if (!canAccessSettings()) return;
                setValueIfPresent("set-threshold", state.settings.threshold);
                setValueIfPresent("set-email", state.settings.buyerEmail);
            };

            window.saveSettings = () => {
                state.settings.threshold = parseInt(getEl("set-threshold")?.value) || 5;
                state.settings.buyerEmail = getEl("set-email")?.value || state.settings.buyerEmail;
                computeData();
                logActivity({ section: "settings", action: "save", message: `${getActorName()} salvou configurações globais.` });
                queueRemoteStatePersist("settings");
                showToast("Configurações salvas.");
            };

            // --- DETAIL VIEW ---
            const renderDetail = () => {
                const item = state.selectedItem;
                if (!item) return;

                const hist = state.movements.filter((m) => m.itemId === item.id);
                const assetUnits = getAssetUnits(item);
                const assetStats = getAssetIdentityStats(item);

                setHtmlIfPresent("detail-content", `
                    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2.5rem] shadow-sm flex justify-between items-start relative overflow-hidden">
                        <div class="absolute left-0 top-0 bottom-0 w-2 bg-amber-400"></div>
                        <div class="pl-4">
                            <div class="flex items-center space-x-4 mb-2">
                                <h2 class="text-3xl font-black text-zinc-900 dark:text-white">${item.name}</h2>
                                ${getStatusBadge(item.status)}
                            </div>
                            <p class="font-bold text-zinc-500 uppercase tracking-widest text-xs">${item.category}</p>
                        </div>
                        <div class="flex space-x-3">
                            <button type="button" data-open-modal="edit" data-item-id="${item.id}" class="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center"><i data-lucide="edit-2" class="w-4 h-4 mr-2"></i> Editar</button>
                            <button type="button" data-open-modal="delete" data-item-id="${item.id}" class="px-5 py-2.5 rounded-xl border border-fuchsia-200 dark:border-fuchsia-500/20 text-fuchsia-600 font-bold text-sm hover:bg-fuchsia-50 dark:hover:bg-fuchsia-500/10 transition-colors flex items-center"><i data-lucide="trash-2" class="w-4 h-4 mr-2"></i> Excluir</button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-zinc-900 text-white p-8 rounded-[2.5rem] flex flex-col justify-center items-center relative overflow-hidden shadow-xl">
                            <i data-lucide="package" class="w-32 h-32 absolute -right-6 -bottom-6 opacity-10"></i>
                            <p class="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 relative z-10">Estoque Atual</p>
                            <p class="text-7xl font-black relative z-10 ${item.quantity === 0 ? "text-fuchsia-500" : "text-amber-400"}">${item.quantity}</p>
                        </div>
                        <div class="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 grid grid-cols-2 gap-8 shadow-sm">
                            <div>
                                <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Categoria</p>
                                <p class="text-xl font-bold bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 inline-block">${item.category}</p>
                            </div>
                            <div>
                                <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Preço Base Unitário</p>
                                <p class="text-2xl font-black pt-3">R$ ${item.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div class="col-span-2">
                                <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Identificacao</p>
                                <p class="text-xl font-black text-zinc-900 dark:text-white">${assetStats.identified}/${assetStats.total} unidades com patrimonio/serie</p>
                                <p class="text-xs font-bold text-zinc-500 mt-1">${assetStats.nullCount} unidade${assetStats.nullCount === 1 ? "" : "s"} marcada${assetStats.nullCount === 1 ? "" : "s"} como nula${assetStats.nullCount === 1 ? "" : "s"}.</p>
                            </div>
                            <div class="col-span-2 flex space-x-4">
                                <button type="button" data-open-modal="in" data-item-id="${item.id}" class="flex-1 bg-amber-400 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-600 transition-colors shadow-lg shadow-amber-400/20 flex justify-center items-center"><i data-lucide="arrow-down-left" class="w-4 h-4 mr-2"></i> Registrar Entrada (+)</button>
                                <button type="button" data-open-modal="out" data-item-id="${item.id}" class="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex justify-center items-center"><i data-lucide="arrow-up-right" class="w-4 h-4 mr-2"></i> Registrar Saída (-)</button>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm">
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                            <div>
                                <h3 class="font-bold text-sm uppercase tracking-widest text-zinc-400">Patrimonios e numeros de serie</h3>
                                <p class="text-xs font-semibold text-zinc-500 mt-1">Uma linha por unidade atualmente em estoque.</p>
                            </div>
                            <button type="button" data-open-modal="edit" data-item-id="${item.id}" class="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-black uppercase tracking-widest text-zinc-500 hover:border-amber-400 transition-colors">Editar identificacao</button>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            ${assetUnits.length ? assetUnits.map((unit, index) => `
                                <div class="rounded-2xl border ${unit.noIdentifier ? "border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-black/30" : "border-amber-500/20 bg-amber-500/[0.04]"} p-4">
                                    <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Unidade ${index + 1}</p>
                                    <div class="space-y-2">
                                        <div>
                                            <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Patrimonio</p>
                                            <p class="text-sm font-black text-zinc-900 dark:text-white">${unit.noIdentifier ? "Nulo" : (escapeHtml(unit.patrimony) || "Nao informado")}</p>
                                        </div>
                                        <div>
                                            <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Numero de serie</p>
                                            <p class="text-sm font-black text-zinc-900 dark:text-white">${unit.noIdentifier ? "Nulo" : (escapeHtml(unit.serialNumber) || "Nao informado")}</p>
                                        </div>
                                    </div>
                                </div>
                            `).join("") : `<div class="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-6 text-center text-sm font-bold text-zinc-500">Nenhuma unidade em estoque.</div>`}
                        </div>
                    </div>

                    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm">
                        <h3 class="font-bold text-sm uppercase tracking-widest text-zinc-400 mb-6">Histórico do Item</h3>
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="text-[10px] uppercase font-black tracking-widest text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                                    <th class="pb-4">Data / Hora</th>
                                    <th class="pb-4">Operação</th>
                                    <th class="pb-4">Qtd</th>
                                    <th class="pb-4">Responsável / Usuário da sessão</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                ${
                                    hist.length
                                        ? hist
                                              .map(
                                                  (m) => `
                                    <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                                        <td class="py-4 font-bold text-sm">${new Date(m.date).toLocaleString("pt-BR")}</td>
                                        <td class="py-4"><span class="px-2 py-1 text-[10px] font-black uppercase rounded ${m.type === "in" ? "bg-amber-500/10 text-amber-500" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}">${m.type === "in" ? "Entrada" : "Saída"}</span></td>
                                        <td class="py-4 font-black text-lg ${m.type === "in" ? "text-amber-500" : "text-zinc-900 dark:text-white"}">${m.type === "in" ? "+" : "-"}${m.quantity}</td>
                                        <td class="py-4 font-bold text-zinc-500 text-sm">${resolveActorLabel(m, "Não informado")}</td>
                                    </tr>
                                `,
                                              )
                                              .join("")
                                        : '<tr><td colspan="4" class="py-8 text-center text-zinc-400 font-bold text-sm">Nenhum registro encontrado.</td></tr>'
                                }
                            </tbody>
                        </table>
                    </div>
                `);
                refreshIcons();
            };

            // Função helper para a UI do modal de Risco
            window.setRoomRisk = (level) => {
                const hidden = document.getElementById("f-room-obsLevel");
                const ok = document.getElementById("btn-risk-ok");
                const warn = document.getElementById("btn-risk-warning");
                const dang = document.getElementById("btn-risk-danger");
                if (!hidden || !ok || !warn || !dang) return;

                hidden.value = level;

                const baseClass = "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300";
                const inactiveClass = `${baseClass} border-transparent bg-zinc-100 dark:bg-zinc-800 opacity-50 hover:opacity-100`;

                ok.className = inactiveClass;
                warn.className = inactiveClass;
                dang.className = inactiveClass;

                if (level === "ok") ok.className = `${baseClass} border-green-500 bg-green-500/20 text-green-500 scale-110`;
                if (level === "warning") warn.className = `${baseClass} border-amber-400 bg-amber-400/20 text-amber-400 scale-110`;
                if (level === "danger") dang.className = `${baseClass} border-red-500 bg-red-500/20 text-red-500 scale-110`;
            };

            window.setEquipmentQuality = (equipmentKey, value) => {
                const hidden = document.getElementById(`f-room-${equipmentKey}-quality`);
                if (hidden) hidden.value = value;

                ["good", "keep", "replace", "absent"].forEach((quality) => {
                    const btn = document.getElementById(`btn-quality-${equipmentKey}-${quality}`);
                    if (!btn) return;
                    btn.className = `quality-btn quality-btn-${equipmentKey} flex-1 rounded-xl border px-2.5 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                        quality === value
                            ? `${QUALITY_BUTTON_ACTIVE_CLASSES[quality]} scale-[1.02] shadow-sm`
                            : QUALITY_BUTTON_IDLE_CLASS
                    }`;
                });
            };

            // --- MODALS & FORMS ---
            window.safeOpenModal = (event, type, id = null) => {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                window.openModal(type, id);
                return false;
            };

            window.safeConfirmDelete = (event, id) => {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                window.confirmDelete(id);
                return false;
            };

            document.addEventListener("click", (event) => {
                const openTrigger = event.target.closest("[data-open-modal]");
                if (openTrigger) {
                    event.preventDefault();
                    event.stopPropagation();
                    const modalType = openTrigger.getAttribute("data-open-modal");
                    const modalId = openTrigger.getAttribute("data-item-id") || null;
                    window.openModal(modalType, modalId);
                    return;
                }
                const deleteTrigger = event.target.closest("[data-confirm-delete]");
                if (deleteTrigger) {
                    event.preventDefault();
                    event.stopPropagation();
                    const itemId = deleteTrigger.getAttribute("data-confirm-delete");
                    window.confirmDelete(itemId);
                }
            });

            window.openModal = (type, id = null) => {
                const inventoryAdminOnly = ["add", "edit", "delete", "in", "out"];
                if (inventoryAdminOnly.includes(type) && !requirePermission(canEditInventory(), "Visitante tem acesso apenas de leitura no inventário.")) return;
                if (type === "add-maintenance" && !requirePermission(canEditInventory(), "Somente operadores, desenvolvedores e administradores registram manutencao.")) return;
                if (["add-purchase", "email-preview"].includes(type) && !requirePermission(canManagePurchases(), "Somente operadores, desenvolvedores e administradores gerenciam requisições.")) return;
                if (type === "edit-room" && !requirePermission(canEditInfra(), "Somente operadores, desenvolvedores e administradores editam infraestrutura.")) return;
                if (["user-add", "user-edit"].includes(type) && !requirePermission(canManageUsers(), "Somente administradores ou desenvolvedores gerenciam utilizadores.")) return;

                const item = state.inventory.find((i) => String(i.id) === String(id));
                const room = state.infraRooms.find((r) => String(r.id) === String(id));

                toggleClasses("modal-container", ["opacity-0", "pointer-events-none"], "remove", { warn: true });
                toggleClasses("modal-content", ["scale-95"], "remove", { warn: true });

                let title = "Operação";
                let body = "";

                if (["edit", "delete", "in", "out"].includes(type) && id && !item) {
                    showToast("Item não encontrado para essa operação.", "error");
                    closeModal();
                    return;
                }

                if (type === "add" || type === "edit") {
                    title = item ? "Editar Ativo" : "Novo Ativo";
                    body = `
                        <form id="modal-form" class="space-y-6">
                            <div>
                                <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Nome do Produto</label>
                                <input id="f-name" value="${item?.name || ""}" placeholder="Ex: Cabo de Força..." class="w-full bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-400 font-bold" required />
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Categoria</label>
                                    <select id="f-cat" class="w-full bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none font-bold" required>
                                        <option value="" disabled ${!item ? "selected" : ""}>Escolha...</option>
                                        ${CATEGORIES.map((c) => `<option ${item?.category === c ? "selected" : ""}>${c}</option>`).join("")}
                                    </select>
                                </div>
                                <div>
                                    <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Preço Unit. (R$)</label>
                                    <input id="f-price" type="number" step="0.01" value="${item?.price !== undefined ? item.price : ""}" placeholder="0.00" class="w-full bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-400 font-bold" required />
                                </div>
                            </div>
                            ${!item ? `
                            <div>
                                <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Estoque Inicial</label>
                                <input id="f-initial-qty" type="number" value="" placeholder="0" min="0" oninput="renderAssetIdentityFields('f-initial-qty')" class="w-full bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-400 font-black text-xl text-center" required />
                            </div>` : ""}
                            <div id="asset-identity-fields">${renderAssetIdentityRows(item ? item.quantity : 0, item ? getAssetUnits(item) : [])}</div>
${getSessionActorMarkup("Usuário da sessão")}
                            <div class="pt-4">
                                <button type="submit" class="w-full bg-amber-400 text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-amber-400/20 hover:scale-[1.02] transition-transform">Salvar Dados</button>
                            </div>
                        </form>
                    `;
                } else if ((type === "in" || type === "out") && !id) {
                    title = type === "in" ? "Registrar Entrada Rápida" : "Registrar Saída Rápida";
                    body = `
                        <form id="modal-form" class="space-y-6">
                            <div>
                                <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Selecione o Item</label>
                                <select id="f-select-item" class="w-full bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none font-bold" required>
                                    <option value="" disabled selected>Escolha um produto da lista...</option>
                                    ${[...state.inventory].sort((a, b) => a.name.localeCompare(b.name)).map((i) => `<option value="${i.id}">${i.name} (Estoque: ${i.quantity})</option>`).join("")}
                                </select>
                            </div>
                            <div>
                                <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Quantidade</label>
                                <input id="f-qty" type="number" min="1" placeholder="Qual a quantidade?" oninput="${type === "in" ? "renderAssetIdentityFields('f-qty')" : ""}" class="w-full p-4 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-amber-400 font-black text-center text-2xl" required />
                            </div>
                            ${type === "in" ? `<div id="asset-identity-fields">${renderAssetIdentityRows(0)}</div>` : ""}
                            ${type === "out" ? `
${getSessionActorMarkup("Usuário da sessão")}` : `
${getSessionActorMarkup("Usuário da sessão")}`}
                            <div class="pt-2">
                                <button type="submit" class="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform">Confirmar Operação</button>
                            </div>
                        </form>
                    `;
                } else if (type === "in" || type === "out") {
                    title = type === "in" ? "Registrar Entrada" : "Registrar Saída";
                    body = `
                        <div class="bg-zinc-50 dark:bg-black p-8 rounded-[2rem] text-center mb-6 border border-zinc-200 dark:border-zinc-800">
                            <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Estoque Atual</p>
                            <h4 class="text-5xl font-black ${item.quantity === 0 ? "text-fuchsia-500" : ""}">${item.quantity}</h4>
                            <p class="text-sm font-bold text-zinc-500 mt-2">${item.name}</p>
                        </div>
                        <form id="modal-form" class="space-y-4">
                            <input id="f-qty" type="number" min="1" max="${type === "out" ? item.quantity : ""}" placeholder="Qual a quantidade?" oninput="${type === "in" ? "renderAssetIdentityFields('f-qty')" : ""}" class="w-full p-6 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-amber-400 text-3xl font-black text-center" required />
                            ${type === "in" ? `<div id="asset-identity-fields">${renderAssetIdentityRows(0)}</div>` : ""}
                            ${type === "out" ? `
${getSessionActorMarkup("Usuário da sessão")}` : `
${getSessionActorMarkup("Usuário da sessão")}`}
                            <div class="pt-2">
                                <button type="submit" class="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform">Confirmar Operação</button>
                            </div>
                        </form>
                    `;
                } else if (type === "delete") {
                    title = "Confirmar Exclusão";
                    body = `
                        <form id="modal-form" class="text-center py-6">
                            <div class="w-20 h-20 bg-fuchsia-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-fuchsia-500"><i data-lucide="alert-triangle" class="w-10 h-10"></i></div>
                            <p class="font-bold text-lg mb-2">Excluir "${item.name}"?</p>
                            <p class="text-sm text-zinc-500 font-medium mb-8">Esta ação removerá o item da base permanentemente.</p>
                            <div class="mb-6 flex flex-col items-center">
                                ${getSessionActorMarkup("Usuário da sessão")}
                            </div>
                            <div class="flex space-x-4">
                                <button type="button" onclick="event.preventDefault(); closeModal()" class="flex-1 bg-zinc-100 dark:bg-zinc-800 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:opacity-80 transition-opacity">Cancelar</button>
                                <button type="submit" class="flex-1 bg-fuchsia-500 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-fuchsia-600 transition-colors shadow-lg shadow-fuchsia-500/20">Excluir</button>
                            </div>
                        </form>
                    `;
                } else if (type === "add-purchase") {
                    title = "Adicionar Requisição";
                    body = `
                        <form id="modal-form" class="space-y-6">
                            <div>
                                <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Selecione o Item</label>
                                <select id="f-purchase-item" class="w-full bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none font-bold" required>
                                    <option value="" disabled selected>Escolha um produto...</option>
                                    ${state.inventory.map((i) => `<option value="${i.id}">${i.name} (Atual: ${i.quantity})</option>`).join("")}
                                </select>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Qtd a Comprar</label>
                                    <input id="f-purchase-qty" type="number" min="1" value="1" class="w-full bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-400 font-black text-xl text-center" required />
                                </div>
                                <div>
                                    <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Prazo Final</label>
                                    <input id="f-purchase-date" type="date" class="w-full bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-400 font-bold text-sm" />
                                </div>
                            </div>
${getSessionActorMarkup("Usuário da sessão")}
                            <div class="pt-4">
                                <button type="submit" class="w-full bg-amber-400 text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-amber-400/20 hover:scale-[1.02] transition-transform">Adicionar à Lista</button>
                            </div>
                        </form>
                    `;
                } else if (type === "add-maintenance") {
                    title = "Adicionar item em manutencao";
                    const stockItems = normalizeInventoryItems(state.inventory).filter((entry) => entry.quantity > 0).sort((a, b) => a.name.localeCompare(b.name));
                    const firstItemId = stockItems[0]?.id || "";
                    body = `
                        <form id="modal-form" class="space-y-5">
                            <div>
                                <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Item do estoque</label>
                                <select id="f-maint-item" onchange="refreshMaintenanceUnitOptions()" class="w-full bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-400 font-bold" required>
                                    <option value="" disabled ${firstItemId ? "" : "selected"}>${firstItemId ? "Escolha um item..." : "Nenhum item disponivel em estoque"}</option>
                                    ${stockItems.map((entry) => `<option value="${entry.id}" ${entry.id === firstItemId ? "selected" : ""}>${entry.name} (${entry.quantity} un.)</option>`).join("")}
                                </select>
                            </div>
                            <div>
                                <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Patrimonio / Numero de serie</label>
                                <select id="f-maint-unit" class="w-full bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-400 font-bold" required>
                                    ${getMaintenanceUnitOptionsHtml(firstItemId)}
                                </select>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Data de ida</label>
                                    <input id="f-maint-sent" type="date" value="${todayDateOnly()}" class="w-full bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-400 font-bold" required />
                                </div>
                                <div>
                                    <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Data de volta</label>
                                    <input id="f-maint-return" type="date" class="w-full bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-400 font-bold" required />
                                </div>
                            </div>
                            <div>
                                <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Observacoes sobre o item</label>
                                <textarea id="f-maint-notes" rows="3" class="w-full bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-400 font-semibold text-sm" placeholder="Defeito, fornecedor, condicao do item..."></textarea>
                            </div>
                            <div>
                                <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Efeito de atraso</label>
                                <textarea id="f-maint-delay" rows="3" class="w-full bg-amber-400/5 p-4 rounded-2xl border border-amber-400/20 outline-none focus:border-amber-400 font-semibold text-sm" placeholder="Impacto se o item nao voltar na data prevista..."></textarea>
                            </div>
                            ${getSessionActorMarkup("Usuario da sessao")}
                            <button type="submit" class="w-full bg-amber-400 text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-amber-400/20 hover:scale-[1.02] transition-transform">Enviar para manutencao</button>
                        </form>
                    `;
                } else if (type === "email-preview") {
                    title = "Pré-visualizar E-mail";
                    const needs = state.purchaseNeeds;
                    let bodyStr = "Olá Responsável de Compras,\n\nSegue a lista de itens para reposição:\n\n";
                    needs.forEach((n) => (bodyStr += `- ${n.name} | Solicitação: ${n.manualPurchaseQty} un | Prazo: ${n.deadline ? new Date(n.deadline + "T00:00:00").toLocaleDateString("pt-BR") : "Urgente"}\n`));
                    bodyStr += "\nPor favor, providenciar.\n\nAtenciosamente,\nAV Contábil";

                    body = `
                        <div class="space-y-4">
                            <div>
                                <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Destinatário</label>
                                <input id="f-email-to" type="email" value="${state.settings.buyerEmail}" class="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl outline-none font-bold" required />
                            </div>
                            <textarea id="f-email-body" rows="8" class="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl outline-none font-medium text-sm leading-relaxed">${bodyStr}</textarea>
                            <button onclick="sendEmail()" class="w-full bg-amber-400 text-black py-4 rounded-2xl font-black mt-4 uppercase text-xs tracking-widest shadow-xl shadow-amber-400/20 flex items-center justify-center hover:scale-[1.02] transition-transform"><i data-lucide="send" class="w-4 h-4 mr-2"></i> Abrir App de E-mail</button>
                        </div>
                    `;
                } else if (type === "edit-room") {
                    title = "Configurar Sala";
                    ensureRoomEquipmentState(room);

                    const renderQualityButton = (equipmentKey, targetValue, label) => {
                        const currentValue = room.equip[getEquipmentQualityKey(equipmentKey)] || (room.equip[equipmentKey] ? "good" : "absent");
                        const isActive = currentValue === targetValue;
                        return `
                            <button type="button" onclick="setEquipmentQuality('${equipmentKey}', '${targetValue}')" id="btn-quality-${equipmentKey}-${targetValue}" class="quality-btn quality-btn-${equipmentKey} flex-1 rounded-xl border px-2.5 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? QUALITY_BUTTON_ACTIVE_CLASSES[targetValue] + " scale-[1.02] shadow-sm" : QUALITY_BUTTON_IDLE_CLASS}">${label}</button>
                        `;
                    };

                    body = `
                        <div class="text-center mb-6">
                            <h4 class="text-xl font-black">${room.name}</h4>
                            <p class="text-[10px] font-black uppercase text-zinc-500 tracking-widest">${room.floor} - ${room.unit === 3 ? "Setores" : "Unidade " + room.unit}</p>
                        </div>
                        <form id="modal-form" class="space-y-5">
                            ${EQUIPMENT_CONFIG.map((config) => {
                                const qualityValue = room.equip[getEquipmentQualityKey(config.key)] || (room.equip[config.key] ? "good" : "absent");
                                return `
                                    <div class="rounded-[1.4rem] border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/70 dark:bg-black/40">
                                        <div class="flex items-center justify-between gap-2 mb-3">
                                            <label class="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2"><i data-lucide="${config.icon}" class="w-3.5 h-3.5"></i>${config.label}</label>
                                            <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">${config.short}</span>
                                        </div>
                                        <input id="f-room-${config.key}" value="${room.equip[config.key] || ""}" class="w-full bg-white dark:bg-black p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-400 font-bold text-sm" placeholder="Nome / modelo do ${config.label.toLowerCase()}..." />
                                        <div class="grid grid-cols-4 gap-2 mt-3">
                                            ${renderQualityButton(config.key, "good", "Verde")}
                                            ${renderQualityButton(config.key, "keep", "Amarelo")}
                                            ${renderQualityButton(config.key, "replace", "Vermelho")}
                                            ${renderQualityButton(config.key, "absent", "Cinza")}
                                        </div>
                                        <input type="hidden" id="f-room-${config.key}-quality" value="${qualityValue}" />
                                        <div class="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">Verde: bom · Amarelo: dá pra manter · Vermelho: trocar · Cinza: ausente</div>
                                    </div>
                                `;
                            }).join("")}
                            <div>
                                <label class="text-[10px] font-black uppercase text-zinc-400 mb-1.5 block tracking-widest"><i data-lucide="message-square" class="w-3 h-3 inline mr-1"></i> Observações Técnicas</label>
                                <input id="f-room-obs" value="${room.equip.obs || ""}" class="w-full bg-zinc-50 dark:bg-black p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-400 font-bold text-sm" placeholder="Defeitos, pendências..." />
                            </div>
                            <div class="pt-1">
                                ${getSessionActorMarkup("Usuário da sessão")}
                            </div>
                            <div class="pt-2">
                                <button type="submit" class="w-full bg-amber-400 text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-amber-400/20 hover:scale-[1.02] transition-transform">Salvar Sala</button>
                            </div>
                        </form>
                    `;
                }

                if (type === "user-add" || type === "user-edit") {
                    const user = getUserById(id);
                    title = user ? "Editar utilizador" : "Novo utilizador";
                    body = `
                        <form id="modal-form" class="space-y-4">
                            <div>
                                <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Nome</label>
                                <input id="f-user-name" value="${user?.name || ""}" class="w-full bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-400 font-bold" placeholder="Nome completo" required />
                            </div>
                            <div>
                                <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">E-mail</label>
                                <input id="f-user-email" type="email" value="${user?.email || ""}" class="w-full bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-400 font-bold" placeholder="email@empresa.com" required />
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Classe</label>
                                    <select id="f-user-role" class="w-full bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-400 font-bold">
                                        <option value="Administrador" ${normalizeRole(user?.role) === "Administrador" ? "selected" : ""}>Admin</option>
                                        <option value="Desenvolvedor" ${normalizeRole(user?.role) === "Desenvolvedor" ? "selected" : ""}>Desenvolvedor T1</option>
                                        <option value="Operador" ${normalizeRole(user?.role) === "Operador" ? "selected" : ""}>Operador</option>
                                        <option value="Convidado" ${!user || normalizeRole(user?.role) === "Convidado" ? "selected" : ""}>Convidado</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Status</label>
                                    <select id="f-user-status" class="w-full bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-400 font-bold">
                                        <option value="active" ${!user || user?.status === "active" ? "selected" : ""}>Ativo</option>
                                        <option value="inactive" ${user?.status === "inactive" ? "selected" : ""}>Inativo</option>
                                    </select>
                                </div>
                            </div>
                            ${user?.id === "admin" ? `<p class="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 rounded-xl px-4 py-3">O login do admin principal permanece fixo como “admin”.</p>` : ""}
                            <button type="submit" class="w-full bg-amber-400 text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-amber-400/20 hover:scale-[1.02] transition-transform">Salvar utilizador</button>
                        </form>
                    `;
                }

                setTextIfPresent("modal-title", title, { warn: true });
                setHtmlIfPresent("modal-body", body, { warn: true });
                const form = document.getElementById("modal-form");
                if (form) form.onsubmit = (e) => handleModalSubmit(e, type, id);
                if (window.lucide) lucide.createIcons();
            };

            const handleModalSubmit = async (e, type, id) => {
                e.preventDefault();


                let targetId = id;
                if ((type === "in" || type === "out") && !id) {
                    const sel = document.getElementById("f-select-item");
                    if (sel) targetId = sel.value;
                }

                const item = state.inventory.find((i) => i.id === targetId);

                if (type === "in" || type === "out") {
                    if (!item) return;
                    const q = parseInt(document.getElementById("f-qty")?.value || "0");
                    const removedBy = getActorName();
                    if (q <= 0) {
                        showToast("Informe uma quantidade válida.", "error");
                        return;
                    }
                    if (type === "out" && q > item.quantity) {
                        showToast("Erro: Quantidade insuficiente no estoque!", "error");
                        return;
                    }
                    const movementAssetUnits = type === "in" ? readAssetIdentityRows(q) : removeAssetUnitsFromItem(item, q);
                    item.quantity = type === "in" ? item.quantity + q : Math.max(0, item.quantity - q);
                    if (type === "in") appendAssetUnitsToItem(item, movementAssetUnits);
                    getAssetUnits(item);
                    const userLog = getActorName();
                    state.movements.unshift({ id: Date.now().toString(), itemId: targetId, type, quantity: q, user: userLog, removedBy: type === "out" ? removedBy : "", actorName: userLog, sessionName: userLog, assetUnits: movementAssetUnits, date: new Date().toISOString() });
                    logActivity({ section: "inventory", action: type, actorId: userLog, message: type === "in" ? `${userLog} registrou entrada de ${q} un. em ${item.name}.` : `${userLog} registrou saída de ${q} un. em ${item.name}. Usuário da sessão: ${removedBy}.` });
                    if (type === "in") {
                        item.manualPurchaseQty = 0;
                        item.deadline = null;
                    }
                    queueRemoteStatePersist("inventory", "movements");
                    showToast(type === "in" ? "Operação de Entrada registrada." : `Operação de Saída registrada para ${removedBy}.`);
                } else if (type === "add" || type === "edit") {
                    const data = {
                        name: String(document.getElementById("f-name")?.value || ""),
                        category: String(document.getElementById("f-cat")?.value || ""),
                        price: parseFloat(document.getElementById("f-price")?.value || "0") || 0,
                    };
                    if (item) {
                        Object.assign(item, data);
                        item.metadata = item.metadata && typeof item.metadata === "object" ? item.metadata : {};
                        item.metadata.assetUnits = readAssetIdentityRows(item.quantity);
                        logActivity({ section: "inventory", action: "edit", message: `${getActorName()} atualizou o ativo ${item.name}.` });
                        queueRemoteStatePersist("inventory");
                        showToast("Ativo atualizado.");
                    } else {
                        const initQ = parseInt(document.getElementById("f-initial-qty")?.value || "0") || 0;
                        const newId = Date.now().toString();
                        const userLog = getActorName();
                        const assetUnits = readAssetIdentityRows(initQ);
                        state.inventory.push({ id: newId, quantity: initQ, status: "ok", manualPurchaseQty: 0, metadata: { assetUnits }, ...data });
                        if (initQ > 0) state.movements.unshift({ id: Date.now().toString(), itemId: newId, type: "in", quantity: initQ, user: userLog, removedBy: "", actorName: userLog, sessionName: userLog, assetUnits, date: new Date().toISOString() });
                        logActivity({ section: "inventory", action: "create", actorId: userLog, message: `${userLog} criou o ativo ${data.name}.` });
                        queueRemoteStatePersist("inventory", "movements");
                        showToast("Novo ativo criado!");
                    }
                } else if (type === "add-maintenance") {
                    const selectedItemId = String(document.getElementById("f-maint-item")?.value || "");
                    const maintenanceItem = state.inventory.find((entry) => String(entry.id) === selectedItemId);
                    if (!maintenanceItem) {
                        showToast("Selecione um item do estoque.", "error");
                        return;
                    }
                    const sentDate = String(document.getElementById("f-maint-sent")?.value || "");
                    const returnDate = String(document.getElementById("f-maint-return")?.value || "");
                    if (!sentDate || !returnDate) {
                        showToast("Informe as datas de ida e volta.", "error");
                        return;
                    }
                    if (parseDateOnly(returnDate) < parseDateOnly(sentDate)) {
                        showToast("A data de volta nao pode ser anterior a ida.", "error");
                        return;
                    }
                    const selectedUnitId = String(document.getElementById("f-maint-unit")?.value || "");
                    const { unit, index } = resolveMaintenanceUnit(maintenanceItem, selectedUnitId);
                    const actorName = getActorName();
                    const record = {
                        id: `maint-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                        itemId: maintenanceItem.id,
                        itemName: maintenanceItem.name,
                        category: maintenanceItem.category,
                        assetUnitId: unit.id,
                        assetIndex: index,
                        patrimony: unit.patrimony || "",
                        serialNumber: unit.serialNumber || "",
                        noIdentifier: Boolean(unit.noIdentifier),
                        sentDate,
                        returnDate,
                        notes: String(document.getElementById("f-maint-notes")?.value || "").trim(),
                        delayEffect: String(document.getElementById("f-maint-delay")?.value || "").trim(),
                        status: "active",
                        createdAt: new Date().toISOString(),
                        createdBy: actorName,
                    };
                    state.maintenanceRecords.unshift(record);
                    syncMaintenanceSettings();
                    logActivity({ section: "maintenance", action: "send", actorId: actorName, message: `${actorName} enviou ${maintenanceItem.name} para manutencao.` });
                    queueRemoteStatePersist("settings", "activityLogs");
                    showToast("Item enviado para manutencao.");
                } else if (type === "user-add" || type === "user-edit") {
                    const user = getUserById(id);
                    const name = String(document.getElementById("f-user-name")?.value || "").trim();
                    const email = String(document.getElementById("f-user-email")?.value || "").trim().toLowerCase();
                    const role = normalizeRole(document.getElementById("f-user-role")?.value || "Operador");
                    const status = String(document.getElementById("f-user-status")?.value || "active");
                    if (!name || !email) {
                        showToast("Preencha os dados do utilizador.", "error");
                        return;
                    }
                    try {
                        if (remoteStateReady) {
                            if (user) {
                                const result = await updateRemoteUser(user.id, { name, email, role, status });
                                state.selectedUserLogId = result?.user?.id || user.id;
                                showToast("Utilizador atualizado.");
                            } else {
                                const newId = normalizeUserInput(email.split("@")[0] || name.replace(/\s+/g, "."));
                                if (getUserById(newId)) {
                                    showToast("Já existe um utilizador com esse identificador.", "error");
                                    return;
                                }
                                const result = await createRemoteUser({ id: newId, name, email, role, status });
                                state.selectedUserLogId = result?.user?.id || newId;
                                showToast("Novo utilizador criado.");
                            }
                        } else {
                            if (user) {
                                const previousRole = normalizeRole(user.role);
                                const previousStatus = user.status;
                                user.name = name;
                                user.email = email;
                                user.role = user.id === "admin" ? "Administrador" : role;
                                user.status = user.id === state.currentUser?.id ? "active" : status;
                                if (state.currentUser?.id === user.id) {
                                    state.currentUser.role = user.role;
                                    setTextIfPresent("header-role", getHeaderRoleLabel({ id: user.id, role: user.role, name: user.name }), { warn: true });
                                    setTextIfPresent("header-username", user.name, { warn: true });
                                }
                                logActivity({ section: "users", action: "update", targetUserId: user.id, message: `${getActorName()} atualizou ${user.name}${previousRole !== user.role ? ` · classe: ${previousRole} → ${user.role}` : ""}${previousStatus !== user.status ? ` · status: ${previousStatus} → ${user.status}` : ""}.` });
                                state.selectedUserLogId = user.id;
                                showToast("Utilizador atualizado.");
                            } else {
                                const newId = normalizeUserInput(email.split("@")[0] || name.replace(/\s+/g, "."));
                                if (getUserById(newId)) {
                                    showToast("Já existe um utilizador com esse identificador.", "error");
                                    return;
                                }
                                state.users.push({ id: newId, name, email, role, status, lastAccess: null, hasPassword: false });
                                logActivity({ section: "users", action: "create", targetUserId: newId, message: `${getActorName()} criou o usuário ${name} com classe ${role}.` });
                                state.selectedUserLogId = newId;
                                showToast("Novo utilizador criado.");
                            }
                            saveUsers();
                        }
                    } catch (error) {
                        console.error(error);
                        showToast(error.message || "Não foi possível salvar o utilizador.", "error");
                        return;
                    }
                } else if (type === "add-purchase") {
                    const selId = String(document.getElementById("f-purchase-item")?.value || "");
                    const q = parseInt(document.getElementById("f-purchase-qty")?.value || "0");
                    const d = String(document.getElementById("f-purchase-date")?.value || "");
                    const i = state.inventory.find((inv) => inv.id === selId);
                    if (i) {
                        i.manualPurchaseQty = q;
                        i.deadline = d || null;
                        logActivity({ section: "purchases", action: "request", message: `${getActorName()} atualizou a requisição de ${i.name} para ${q} un.` });
                        queueRemoteStatePersist("inventory");
                        showToast("Adicionado à lista de compras.");
                    }
                } else if (type === "edit-room") {
                    const editingRoom = state.infraRooms.find((r) => r.id === id);
                    if (!editingRoom) return;
                    ensureRoomEquipmentState(editingRoom);
                    const previousEquip = JSON.parse(JSON.stringify(editingRoom.equip || {}));
                    EQUIPMENT_CONFIG.forEach(({ key }) => {
                        editingRoom.equip[key] = document.getElementById(`f-room-${key}`).value.trim();
                        editingRoom.equip[getEquipmentQualityKey(key)] = document.getElementById(`f-room-${key}-quality`).value;
                    });
                    editingRoom.equip.obs = String(document.getElementById("f-room-obs")?.value || "").trim();
                    editingRoom.equip.obsLevel = computeRoomObsLevel(editingRoom);
                    try {
                        if (remoteStateReady) {
                            await syncInfraRoomRemotely(editingRoom.id);
                        } else {
                            saveInfraRooms();
                            const actorName = getActorName();
                            logActivity({ section: "infra", action: "room-update", targetRoomId: editingRoom.id, message: `${actorName} atualizou a sala ${editingRoom.name}.` });
                        }
                    } catch (error) {
                        editingRoom.equip = previousEquip;
                        editingRoom.equip.obsLevel = computeRoomObsLevel(editingRoom);
                        console.error(error);
                        showToast(error.message || "Não foi possível atualizar a sala.", "error");
                        return;
                    }
                    state.selectedRoomLogId = editingRoom.id;
                    showToast("Equipamentos da sala atualizados.");
                } else if (type === "delete") {
                    window.confirmDelete(targetId);
                    return;
                }

                closeModal();
                computeData();
                renderCurrentView();
                syncLocalCaches();
            };

            window.confirmDelete = (id) => {
                if (!requirePermission(canEditInventory(), "Somente operadores, desenvolvedores e administradores podem excluir ativos.")) return;
                const deletedItem = state.inventory.find((i) => i.id === id);
                state.inventory = state.inventory.filter((i) => i.id !== id);
                if (deletedItem) logActivity({ section: "inventory", action: "delete", message: `${getActorName()} excluiu o ativo ${deletedItem.name}.` });
                queueRemoteStatePersist("inventory");
                closeModal();
                if (state.currentView === "detail" && state.selectedItem?.id === id) switchView("inventory");
                else {
                    computeData();
                    renderCurrentView();
                }
                showToast("Ativo excluído definitivamente.");
            };

            window.closeModal = () => {
                toggleClasses("modal-container", ["opacity-0", "pointer-events-none"], "add", { warn: true });
                toggleClasses("modal-content", ["scale-95"], "add", { warn: true });
            };

            window.sendEmail = () => {
                if (!requirePermission(canManagePurchases(), "Somente operadores, desenvolvedores e administradores enviam requisições.")) return;
                const to = String(document.getElementById("f-email-to")?.value || "");
                const body = String(document.getElementById("f-email-body")?.value || "");
                window.open(`mailto:${to}?subject=Requisição de Ativos&body=${encodeURIComponent(body)}`);
                showToast("Abrindo aplicativo de e-mail.");
                closeModal();
            };

            // --- GLOBAL SEARCH ---
            window.runGlobalSearch = (val) => {
                const res = document.getElementById("gs-results");
                if (!res) return;
                if (!val) {
                    res.innerHTML = "";
                    return;
                }
                const query = val.toLowerCase();
                const filtered = state.inventory.filter((i) => {
                    const assetText = getAssetUnits(i).map((unit) => `${unit.patrimony} ${unit.serialNumber}`).join(" ").toLowerCase();
                    return i.name.toLowerCase().includes(query) || i.category.toLowerCase().includes(query) || assetText.includes(query);
                });
                res.innerHTML = filtered
                    .map(
                        (i) => `
                    <div onclick="closeSearch(); switchView('detail', '${i.id}')" class="p-6 bg-zinc-800/50 hover:bg-zinc-800 rounded-3xl flex justify-between items-center cursor-pointer transition-all border border-zinc-800 hover:border-amber-400 group">
                        <div class="flex items-center space-x-4">
                            <div class="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center group-hover:bg-amber-400/10 group-hover:text-amber-400 transition-colors">
                                <i data-lucide="package" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <span class="font-bold text-white block">${i.name}</span>
                                <span class="text-[10px] font-black uppercase text-zinc-500 tracking-widest">${i.category}</span>
                            </div>
                        </div>
                        <span class="text-xl font-black ${i.quantity === 0 ? "text-fuchsia-500" : "text-zinc-300 group-hover:text-amber-400"}">${i.quantity}</span>
                    </div>
                `,
                    )
                    .join("");
                if (window.lucide) lucide.createIcons();
            };

            window.openGlobalSearch = () => {
                toggleClasses("gs-overlay", ["opacity-0", "pointer-events-none"], "remove");
                getEl("gs-input")?.focus();
            };
            window.closeSearch = () => {
                toggleClasses("gs-overlay", ["opacity-0", "pointer-events-none"], "add");
                setValueIfPresent("gs-input", "");
                setHtmlIfPresent("gs-results", "");
            };

            document.addEventListener("click", (e) => {
                const panel = document.getElementById("users-filter-panel");
                if (!panel) return;
                const trigger = e.target.closest("[data-users-filter-trigger]");
                if (panel.contains(e.target) || trigger) return;
                state.usersFiltersOpen = false;
                panel.classList.add("hidden");
            });

            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    closeModal();
                    closeSearch();
                }
                if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                    e.preventDefault();
                    openGlobalSearch();
                }
            });

            // --- UTILS ---
            window.showToast = (msg, type = "success") => {
                const id = "t-" + Date.now();
                const tone = type === "error"
                    ? { classes: "bg-fuchsia-600 text-white", icon: "alert-triangle", ttl: 4000 }
                    : type === "info"
                    ? { classes: "bg-fuchsia-500 text-white", icon: "users", ttl: 3500 }
                    : { classes: "bg-amber-400 text-black", icon: "check-circle", ttl: 3000 };
                (getEl("toast-container", { warn: true }) || document.body).insertAdjacentHTML(
                    "beforeend",
                    `
                    <div id="${id}" class="${tone.classes} px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-fade pointer-events-auto">
                        ${getDashboardIconSvg(tone.icon, "w-4 h-4")}
                        <span class="text-[10px] font-black uppercase tracking-widest">${msg}</span>
                    </div>
                `,
                );
                refreshIcons();
                setTimeout(() => document.getElementById(id)?.remove(), tone.ttl);
            };

            window.toggleTheme = () => {
                const isDark = document.documentElement.classList.toggle("dark");

                // Update header toggle
                document.getElementById("theme-icon-sun")?.classList.toggle("hidden", isDark);
                document.getElementById("theme-icon-moon")?.classList.toggle("hidden", !isDark);

                // Update login toggle
                document.getElementById("login-theme-sun")?.classList.toggle("hidden", isDark);
                document.getElementById("login-theme-moon")?.classList.toggle("hidden", !isDark);

                if (state.currentView === "dashboard") renderDashboard();
                if (state.currentView === "insights") renderInsights();
            };

            if (localSyncChannel) {
                localSyncChannel.addEventListener("message", (event) => {
                    const payload = event?.data || {};
                    if (!state.currentUser?.id) return;
                    if (payload?.sourceUserId && payload.sourceUserId === state.currentUser.id) return;
                    runGlobalSync("broadcast-channel", { emitRemoteToasts: true, forceState: true }).catch((error) => console.warn("Falha ao alinhar por canal local.", error));
                });
            }

            window.addEventListener("storage", (event) => {
                if (event.key !== LOCAL_CACHE_KEY || !event.newValue || !state.currentUser?.id) return;
                try {
                    const snapshot = JSON.parse(event.newValue);
                    if (!snapshot?.currentUser?.id) return;
                    if (snapshot.lastChangeId && Number(snapshot.lastChangeId) === Number(remoteChangeCursor || 0)) return;
                    runGlobalSync("storage", { emitRemoteToasts: true, forceState: true }).catch((error) => console.warn("Falha ao alinhar atualização vinda do storage.", error));
                } catch (error) {
                    remoteApplyingState = false;
                    console.warn("Falha ao aplicar atualização local entre abas.", error);
                }
            });

            // --- INIT ---
            document.addEventListener("DOMContentLoaded", async () => {
                ensureCompatElements();
                const cachedSnapshot = loadLocalCache();
                if (cachedSnapshot?.data) {
                    applyRemoteState(cachedSnapshot.data, { source: "cache" });
                    if (cachedSnapshot.stateVersion) setRemoteStateVersion(cachedSnapshot.stateVersion);
                    if (cachedSnapshot.lastChangeId) setRemoteChangeCursor(cachedSnapshot.lastChangeId);
                    if (cachedSnapshot.currentUser?.id) {
                        bootedFromLocalCache = true;
                        executeLogin(cachedSnapshot.currentUser.id, cachedSnapshot.currentUser.role, cachedSnapshot.currentView || getDefaultViewForRole(cachedSnapshot.currentUser.role), { instant: true, displayName: cachedSnapshot.currentUser.name });
                    }
                }

                const remoteSessionUser = await initializeRemoteSession();
                if (remoteSessionUser === null) {
                    if (!bootedFromLocalCache) {
                        state.users = seedUsers().map((user) => ({ ...user, role: normalizeRole(user.role) }));
                        state.inventory = structuredClone(DEFAULT_BOOTSTRAP.inventory || []);
                        state.movements = structuredClone(DEFAULT_BOOTSTRAP.movements || []);
                        state.infraRooms = normalizeInfraRooms(structuredClone(DEFAULT_BOOTSTRAP.infraRooms || []));
                        state.settings = structuredClone(DEFAULT_BOOTSTRAP.settings || { threshold: 5, buyerEmail: "compras@suaempresa.com.br" });
                        state.maintenanceRecords = normalizeMaintenanceRecords(state.settings.maintenanceRecords || []);
                        state.activityLogs = [];
                    } else {
                        clearLocalCache();
                        state.currentUser = null;
                        toggleClasses("app-view", ["hidden", "opacity-0"], "add", { warn: true });
                        toggleClasses("login-view", ["hidden"], "remove", { warn: true });
                        toggleClasses("login-view", ["opacity-0", "pointer-events-none"], "remove", { warn: true });
                        window.setLoginStep?.("choice");
                        updatePermissionsUI();
                    }
                } else {
                    state.users = state.users.map((user) => ({ ...user, role: normalizeRole(user.role) }));
                    state.infraRooms = normalizeInfraRooms(state.infraRooms);
                }

                const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
                document.documentElement.classList.toggle("dark", prefersDark || document.documentElement.classList.contains("dark"));
                const isDark = document.documentElement.classList.contains("dark");

                document.getElementById("theme-icon-sun")?.classList.toggle("hidden", isDark);
                document.getElementById("theme-icon-moon")?.classList.toggle("hidden", !isDark);
                document.getElementById("login-theme-sun")?.classList.toggle("hidden", isDark);
                document.getElementById("login-theme-moon")?.classList.toggle("hidden", !isDark);

                updatePermissionsUI();

                refreshIcons();
                if (remoteSessionUser?.id) executeLogin(remoteSessionUser.id, remoteSessionUser.role, state.currentView || getDefaultViewForRole(remoteSessionUser.role), { instant: bootedFromLocalCache, displayName: remoteSessionUser.name || remoteSessionUser.id });
                if (typeof window !== "undefined") window.__AV_BOOT_READY__ = true;
            });
        
