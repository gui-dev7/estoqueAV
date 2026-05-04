/*
  AV.Storage v16.5 — Adaptador Supabase
  Mantém o frontend original consumindo /api/*, mas troca Cloudflare D1/Functions por Supabase direto no browser.
  Segurança: use apenas anon/public key aqui. Nunca use service_role no frontend.
*/
(function () {
  "use strict";

  const API_PREFIX = "/api";
  const SESSION_KEY = "av.storage.supabase.session.v16.5";
  const cfg = window.AV_STORAGE_SUPABASE || {};
  const asArray = (value) => (Array.isArray(value) ? value : []);
  const SUPABASE_URL = cfg.url || window.VITE_SUPABASE_URL || window.SUPABASE_URL || "";
  const SUPABASE_ANON_KEY = cfg.anonKey || window.VITE_SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY || "";
  const ADMIN_EMAIL = cfg.adminEmail || window.VITE_SUPABASE_ADMIN_EMAIL || "admin@seudominio.com";
  const DEVELOPER_EMAIL = cfg.developerEmail || window.VITE_SUPABASE_DEVELOPER_EMAIL || "dev.gui@seudominio.com";
  const AUTH_USERS = {
    admin: { email: ADMIN_EMAIL, profileId: "admin", role: "Administrador", label: "Administrador T2" },
    "dev.gui": { email: DEVELOPER_EMAIL, profileId: "dev.gui", role: "Desenvolvedor", label: "Desenvolvedor T1" },
    ...(cfg.authUsers || {})
  };
  const SESSION_COLLABORATORS = asArray(cfg.sessionCollaborators).length ? asArray(cfg.sessionCollaborators) : ["Evandro", "Lucas", "Guilherme", "Marcos"];
  const originalFetch = window.fetch.bind(window);
  let client = null;

  const hasValidConfig = () => {
    return SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes("SEU-PROJETO") && !SUPABASE_ANON_KEY.includes("SUA_ANON_PUBLIC_KEY");
  };

  const nowIso = () => new Date().toISOString();
  const cleanString = (value, fallback = "") => String(value ?? fallback).trim();
  const normalizeComparableName = (value = "") => cleanString(value).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const resolveSessionCollaboratorName = (value = "") => {
    const wanted = normalizeComparableName(value);
    return SESSION_COLLABORATORS.find((name) => normalizeComparableName(name) === wanted) || "";
  };
  const isPrivilegedRole = (role) => ["Administrador", "Desenvolvedor"].includes(normalizeRole(role));

  const normalizeRole = (role) => {
    const value = cleanString(role).toLowerCase();
    if (["admin", "administrator", "administrador"].includes(value)) return "Administrador";
    if (["dev", "developer", "desenvolvedor", "t1"].includes(value)) return "Desenvolvedor";
    if (["operator", "operador"].includes(value)) return "Operador";
    if (["guest", "visitante", "convidado"].includes(value)) return "Convidado";
    return role ? String(role) : "Convidado";
  };

  const jsonResponse = (data, status = 200) => {
    return new Response(JSON.stringify(data ?? {}), {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  };

  const apiError = (message, status = 500, detail = null) => jsonResponse({ ok: false, error: message, detail }, status);

  const parseRequestUrl = (input) => {
    const raw = typeof input === "string" ? input : input?.url;
    if (!raw) return null;
    try {
      return new URL(raw, window.location.origin);
    } catch (_) {
      return null;
    }
  };

  const isApiRequest = (input) => {
    const url = parseRequestUrl(input);
    return !!url && url.origin === window.location.origin && url.pathname.startsWith(API_PREFIX);
  };

  const readJsonBody = async (requestLike) => {
    if (!requestLike) return {};
    try {
      if (requestLike instanceof Request) {
        const text = await requestLike.clone().text();
        return text ? JSON.parse(text) : {};
      }
      const body = requestLike.body;
      if (!body) return {};
      if (typeof body === "string") return JSON.parse(body || "{}");
      return body;
    } catch (_) {
      return {};
    }
  };

  const getClient = () => {
    if (!hasValidConfig()) {
      throw new Error("Supabase não configurado. Edite dist/config.js com URL, anon key e e-mail ADM.");
    }
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      throw new Error("Biblioteca @supabase/supabase-js não carregada.");
    }
    if (!client) {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    }
    return client;
  };

  const readLocalSession = () => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch (_) {
      return null;
    }
  };

  const writeLocalSession = (session) => {
    try {
      if (!session) localStorage.removeItem(SESSION_KEY);
      else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (_) {}
  };

  const sanitizeProfile = (row, fallback = {}) => ({
    id: cleanString(row?.id || fallback.id || "guest"),
    name: cleanString(row?.name || fallback.name || "Acesso rápido"),
    email: cleanString(row?.email || fallback.email || ""),
    role: normalizeRole(row?.role || fallback.role || "Convidado"),
    status: cleanString(row?.status || fallback.status || "active"),
    lastAccess: row?.last_access || row?.lastAccess || null,
    isSystem: !!(row?.is_system ?? fallback.isSystem),
    isGuest: !!(row?.is_guest ?? fallback.isGuest),
    hasPassword: !!row?.auth_user_id
  });

  const defaultUsers = () => [
    { id: "admin", name: "Administrador", email: ADMIN_EMAIL, role: "Administrador", status: "active", lastAccess: null, isSystem: true, isGuest: false, hasPassword: true },
    { id: "dev.gui", name: "Desenvolvedor", email: DEVELOPER_EMAIL, role: "Desenvolvedor", status: "active", lastAccess: null, isSystem: true, isGuest: false, hasPassword: true },
    { id: "guest", name: "Acesso rápido", email: "", role: "Convidado", status: "active", lastAccess: null, isSystem: true, isGuest: true, hasPassword: false }
  ];

  const currentSessionUser = async () => {
    const local = readLocalSession();
    const supabase = getClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      return {
        id: local?.id || "admin",
        role: local?.role || "Administrador",
        name: local?.name || "Administrador",
        authUserId: data.user.id,
        email: data.user.email || ADMIN_EMAIL
      };
    }
    if (local?.id === "guest") return local;
    return null;
  };

  const isWritableUser = async () => {
    const user = await currentSessionUser();
    return !!user && isPrivilegedRole(user.role);
  };

  const selectAll = async (table, queryBuilder) => {
    const supabase = getClient();
    const query = queryBuilder ? queryBuilder(supabase.from(table)) : supabase.from(table).select("*");
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };

  const getMeta = async () => {
    const supabase = getClient();
    const { data: metaRows } = await supabase.from("sync_meta").select("*").eq("id", 1).limit(1);
    const { data: lastRows } = await supabase.from("change_events").select("id").order("id", { ascending: false }).limit(1);
    return {
      stateVersion: Number(metaRows?.[0]?.revision || 1),
      lastChangeId: Number(lastRows?.[0]?.id || 0)
    };
  };

  const loadState = async () => {
    const [profiles, inventory, movements, rooms, settingsRows, logs, collaborators] = await Promise.all([
      selectAll("profiles", (q) => q.select("*").order("is_system", { ascending: false }).order("name", { ascending: true })),
      selectAll("inventory_items", (q) => q.select("*").order("name", { ascending: true })),
      selectAll("inventory_movements", (q) => q.select("*").order("date", { ascending: false }).limit(500)),
      selectAll("infra_rooms", (q) => q.select("*").order("unit", { ascending: true }).order("name", { ascending: true })),
      selectAll("system_settings", (q) => q.select("*").eq("key", "global").limit(1)),
      selectAll("activity_logs", (q) => q.select("*").order("created_at", { ascending: false }).limit(500)),
      selectAll("session_collaborators", (q) => q.select("*").eq("active", true).order("sort_order", { ascending: true }))
    ]);

    const mappedUsers = profiles.length ? profiles.map((row) => sanitizeProfile(row)) : defaultUsers();
    if (!mappedUsers.some((u) => u.id === "dev.gui")) mappedUsers.push(defaultUsers()[1]);
    if (!mappedUsers.some((u) => u.id === "guest")) mappedUsers.push(defaultUsers()[2]);

    return {
      sessionCollaborators: asArray(collaborators).length ? collaborators.map((row) => cleanString(row.name)).filter(Boolean) : SESSION_COLLABORATORS,
      users: mappedUsers,
      inventory: inventory.map((row) => ({
        id: cleanString(row.id),
        name: cleanString(row.name),
        category: cleanString(row.category, "Outros"),
        quantity: Number(row.quantity || 0),
        price: Number(row.price || 0),
        status: cleanString(row.status, "ok"),
        manualPurchaseQty: Number(row.manual_purchase_qty || 0),
        deadline: row.deadline || null,
        isCritical: !!row.is_critical,
        version: Number(row.version || 1)
      })),
      movements: movements.map((row) => ({
        id: cleanString(row.id),
        itemId: cleanString(row.item_id),
        type: cleanString(row.type),
        quantity: Number(row.quantity || 0),
        date: row.date || row.created_at || nowIso(),
        user: cleanString(row.user_name || row.actor_name || row.session_name || "Sistema"),
        removedBy: cleanString(row.removed_by),
        actorName: cleanString(row.actor_name || row.user_name),
        sessionName: cleanString(row.session_name || row.user_name)
      })),
      infraRooms: rooms.map((row) => ({
        id: cleanString(row.id),
        name: cleanString(row.name),
        unit: Number(row.unit || 1),
        floor: cleanString(row.floor),
        equip: row.equip && typeof row.equip === "object" ? row.equip : {}
      })),
      settings: settingsRows?.[0]?.data && typeof settingsRows[0].data === "object" ? settingsRows[0].data : { threshold: 5, buyerEmail: "compras@suaempresa.com.br" },
      activityLogs: logs.map((row) => ({
        id: cleanString(row.id),
        section: cleanString(row.section),
        action: cleanString(row.action),
        message: cleanString(row.message),
        actorId: cleanString(row.actor_id),
        targetUserId: cleanString(row.target_user_id),
        targetRoomId: cleanString(row.target_room_id),
        createdAt: row.created_at || nowIso()
      }))
    };
  };

  const syncById = async (table, rows) => {
    const supabase = getClient();
    const normalizedRows = asArray(rows).filter((row) => row && row.id != null);
    const incomingIds = normalizedRows.map((row) => String(row.id));
    const { data: existing, error: existingError } = await supabase.from(table).select("id");
    if (existingError) throw existingError;

    const staleIds = asArray(existing).map((row) => String(row.id)).filter((id) => !incomingIds.includes(id));
    for (let i = 0; i < staleIds.length; i += 100) {
      const chunk = staleIds.slice(i, i + 100);
      if (chunk.length) {
        const { error } = await supabase.from(table).delete().in("id", chunk);
        if (error) throw error;
      }
    }
    if (normalizedRows.length) {
      const { error } = await supabase.from(table).upsert(normalizedRows, { onConflict: "id" });
      if (error) throw error;
    }
  };

  const persistState = async (incomingState, syncEvent) => {
    if (!(await isWritableUser())) {
      return apiError("Sua conta tem acesso somente de leitura.", 403);
    }

    const supabase = getClient();
    const keys = Object.keys(incomingState || {}).filter((key) => ["inventory", "movements", "infraRooms", "settings", "activityLogs", "users"].includes(key));

    if (keys.includes("inventory")) {
      await syncById("inventory_items", asArray(incomingState.inventory).map((item) => ({
        id: cleanString(item.id),
        name: cleanString(item.name),
        category: cleanString(item.category, "Outros"),
        quantity: Number(item.quantity || 0),
        price: Number(item.price || 0),
        status: cleanString(item.status, "ok"),
        manual_purchase_qty: Number(item.manualPurchaseQty || 0),
        deadline: item.deadline || null,
        is_critical: !!item.isCritical,
        version: Number(item.version || 1),
        metadata: item.metadata || {},
        updated_at: nowIso()
      })));
    }

    if (keys.includes("movements")) {
      await syncById("inventory_movements", asArray(incomingState.movements).map((movement) => ({
        id: cleanString(movement.id),
        item_id: cleanString(movement.itemId),
        type: cleanString(movement.type),
        quantity: Number(movement.quantity || 0),
        user_name: cleanString(movement.user || movement.actorName || movement.sessionName || "Sistema"),
        removed_by: cleanString(movement.removedBy),
        actor_name: cleanString(movement.actorName || movement.user),
        session_name: cleanString(movement.sessionName || movement.user),
        date: movement.date || nowIso()
      })));
    }

    if (keys.includes("infraRooms")) {
      await syncById("infra_rooms", asArray(incomingState.infraRooms).map((room) => ({
        id: cleanString(room.id),
        name: cleanString(room.name),
        unit: Number(room.unit || 1),
        floor: cleanString(room.floor),
        equip: room.equip && typeof room.equip === "object" ? room.equip : {},
        updated_at: nowIso()
      })));
    }

    if (keys.includes("settings")) {
      const { error } = await supabase.from("system_settings").upsert({ key: "global", data: incomingState.settings || {}, updated_at: nowIso() }, { onConflict: "key" });
      if (error) throw error;
    }

    if (keys.includes("activityLogs")) {
      await syncById("activity_logs", asArray(incomingState.activityLogs).map((log) => ({
        id: cleanString(log.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`),
        section: cleanString(log.section, "system"),
        action: cleanString(log.action, "update"),
        message: cleanString(log.message, "Alteração registrada."),
        actor_id: cleanString(log.actorId),
        target_user_id: cleanString(log.targetUserId),
        target_room_id: cleanString(log.targetRoomId),
        created_at: log.createdAt || log.date || nowIso(),
        metadata: log.metadata || {}
      })));
    }

    if (keys.includes("users")) {
      const profileRows = asArray(incomingState.users).filter((user) => user.id && user.id !== "guest").map((user) => ({
        id: cleanString(user.id),
        name: cleanString(user.name),
        email: cleanString(user.email),
        role: normalizeRole(user.role),
        status: cleanString(user.status, "active"),
        is_system: !!user.isSystem || cleanString(user.id) === "admin",
        is_guest: false,
        last_access: user.lastAccess || null,
        updated_at: nowIso()
      }));
      if (profileRows.length) await syncById("profiles", profileRows);
    }

    const previousMeta = await getMeta();
    const nextRevision = previousMeta.stateVersion + 1;
    await supabase.from("sync_meta").upsert({ id: 1, revision: nextRevision, updated_at: nowIso() }, { onConflict: "id" });
    const eventPayload = {
      revision: nextRevision,
      section: syncEvent?.section || keys[0] || "system",
      action: syncEvent?.action || "update",
      message: syncEvent?.message || "Algo foi alterado no sistema.",
      actor_id: syncEvent?.actorId || (await currentSessionUser())?.name || "Sistema",
      target_user_id: syncEvent?.targetUserId || null,
      target_room_id: syncEvent?.targetRoomId || null,
      created_at: nowIso()
    };
    await supabase.from("change_events").insert(eventPayload);

    const state = await loadState();
    const meta = await getMeta();
    return jsonResponse({ ok: true, state, ...meta, usingD1: false, realtimeEnabled: false });
  };

  const bootstrap = async () => {
    const state = await loadState();
    const meta = await getMeta();
    const sessionUser = await currentSessionUser();
    return jsonResponse({ ok: true, state, sessionUser, ...meta, usingD1: false, realtimeEnabled: false });
  };

  const handleLogin = async (requestLike) => {
    const body = await readJsonBody(requestLike);
    const login = cleanString(body.login || body.userId || body.username || body.id).toLowerCase();
    const password = String(body.password || "");
    if (!login || !password) return apiError("Informe login e senha.", 400);

    const authAccount = AUTH_USERS[login] || (login.includes("@") ? { email: login, profileId: login.split("@")[0], role: "Administrador", label: login } : null);
    if (!authAccount?.email) return apiError("Login não encontrado. Use admin ou dev.gui.", 403);

    const supabase = getClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: authAccount.email, password });
    if (error || !data?.user) return apiError(error?.message || "Senha incorreta ou usuário não encontrado no Supabase Auth.", 403);

    const { data: profileByAuth } = await supabase.from("profiles").select("*").eq("auth_user_id", data.user.id).maybeSingle();
    const { data: profileById } = profileByAuth ? { data: null } : await supabase.from("profiles").select("*").eq("id", authAccount.profileId).maybeSingle();
    const profile = profileByAuth || profileById;
    const privilegedProfile = sanitizeProfile(profile, { id: authAccount.profileId, name: authAccount.role === "Desenvolvedor" ? "Desenvolvedor" : "Administrador", email: data.user.email || authAccount.email, role: authAccount.role, status: "active", isSystem: true });
    if (!isPrivilegedRole(privilegedProfile.role) || privilegedProfile.status !== "active") {
      await supabase.auth.signOut();
      return apiError("O usuário autenticado não está marcado como Administrador/Desenvolvedor ativo na tabela profiles.", 403);
    }

    const { error: profileUpdateError } = await supabase.from("profiles").update({ last_access: nowIso(), updated_at: nowIso(), auth_user_id: data.user.id, email: data.user.email || authAccount.email }).eq("id", privilegedProfile.id);
    if (profileUpdateError) {
      await supabase.auth.signOut();
      return apiError("Perfil autenticado, mas ainda não vinculado corretamente. Rode supabase/04_link_admin_auth_user.sql com o UUID real do Auth.", 403, profileUpdateError.message);
    }
    writeLocalSession({ id: privilegedProfile.id, role: normalizeRole(privilegedProfile.role), name: privilegedProfile.name, authUserId: data.user.id, email: data.user.email || authAccount.email });

    const state = await loadState();
    const meta = await getMeta();
    return jsonResponse({
      ok: true,
      firstAccess: false,
      requiresSessionNaming: true,
      successMessage: "Login validado. Selecione o colaborador da sessão.",
      user: { ...privilegedProfile, role: normalizeRole(privilegedProfile.role), session_actor_name: privilegedProfile.name },
      state,
      ...meta,
      usingD1: false
    });
  };

  const handleNameSession = async (requestLike) => {
    const body = await readJsonBody(requestLike);
    const displayName = resolveSessionCollaboratorName(body.displayName || body.name);
    if (!displayName) return apiError("Selecione um colaborador válido: Evandro, Lucas, Guilherme ou Marcos.", 400);
    const user = await currentSessionUser();
    if (!user || !isPrivilegedRole(user.role)) return apiError("Sessão inválida.", 401);
    writeLocalSession({ ...user, name: displayName });
    const supabase = getClient();
    await supabase.from("activity_logs").insert({
      id: `${Date.now()}-session-name`,
      section: "auth",
      action: "name-session",
      message: `${displayName} identificou a sessão compartilhada.`,
      actor_id: displayName,
      created_at: nowIso(),
      metadata: {}
    });
    const state = await loadState();
    const meta = await getMeta();
    return jsonResponse({ ok: true, successMessage: `Sessão iniciada como ${displayName}.`, user: { id: user.id, role: normalizeRole(user.role), name: displayName, session_actor_name: displayName }, state, ...meta, usingD1: false });
  };

  const handleGuest = async () => {
    try { await getClient().auth.signOut(); } catch (_) {}
    const user = { id: "guest", role: "Convidado", name: "Acesso rápido", isGuest: true };
    writeLocalSession(user);
    const state = await loadState();
    const meta = await getMeta();
    return jsonResponse({ ok: true, user, state, ...meta, usingD1: false, realtimeEnabled: false });
  };

  const handleLogout = async () => {
    writeLocalSession(null);
    try { await getClient().auth.signOut(); } catch (_) {}
    return jsonResponse({ ok: true });
  };

  const handleUsersCreate = async (requestLike) => {
    if (!(await isWritableUser())) return apiError("Somente administradores podem criar utilizadores.", 403);
    const body = await readJsonBody(requestLike);
    const row = {
      id: cleanString(body.id || body.userId || body.email?.split("@")[0]),
      name: cleanString(body.name),
      email: cleanString(body.email),
      role: normalizeRole(body.role || "Operador"),
      status: cleanString(body.status, "active"),
      is_system: false,
      is_guest: false,
      updated_at: nowIso()
    };
    if (!row.id || !row.name) return apiError("Dados de usuário incompletos.", 400);
    const { error } = await getClient().from("profiles").upsert(row, { onConflict: "id" });
    if (error) throw error;
    const actor = (await currentSessionUser())?.name || "Administrador";
    await getClient().from("activity_logs").insert({
      id: `${Date.now()}-user-create`,
      section: "users",
      action: "create",
      target_user_id: row.id,
      message: `${actor} criou o usuário ${row.name}.`,
      actor_id: actor,
      created_at: nowIso(),
      metadata: {}
    });
    await getClient().from("change_events").insert({ revision: (await getMeta()).stateVersion + 1, section: "users", action: "create", message: `Usuário ${row.name} criado.`, actor_id: actor, target_user_id: row.id, created_at: nowIso() });
    const state = await loadState();
    const meta = await getMeta();
    return jsonResponse({ ok: true, user: sanitizeProfile(row), state, ...meta, usingD1: false });
  };

  const handleUsersUpdate = async (userId, requestLike) => {
    if (!(await isWritableUser())) return apiError("Somente administradores podem alterar utilizadores.", 403);
    const body = await readJsonBody(requestLike);
    const updates = {
      name: cleanString(body.name),
      email: cleanString(body.email),
      role: userId === "admin" ? "Administrador" : userId === "dev.gui" ? "Desenvolvedor" : normalizeRole(body.role || "Operador"),
      status: ["admin", "dev.gui"].includes(userId) ? "active" : cleanString(body.status, "active"),
      updated_at: nowIso()
    };
    const { error } = await getClient().from("profiles").update(updates).eq("id", userId);
    if (error) throw error;
    const state = await loadState();
    const meta = await getMeta();
    return jsonResponse({ ok: true, user: { id: userId, ...updates }, state, ...meta, usingD1: false });
  };

  const handleInfraPatch = async (roomId, requestLike) => {
    if (!(await isWritableUser())) return apiError("Sem permissão para alterar infraestrutura.", 403);
    const body = await readJsonBody(requestLike);
    const supabase = getClient();
    const { error } = await supabase.from("infra_rooms").update({ equip: body.equip || {}, updated_at: nowIso() }).eq("id", roomId);
    if (error) throw error;
    const actor = (await currentSessionUser())?.name || "Administrador";
    await supabase.from("change_events").insert({ revision: (await getMeta()).stateVersion + 1, section: "infra", action: "room-update", message: `${actor} atualizou uma sala.`, actor_id: actor, target_room_id: roomId, created_at: nowIso() });
    const state = await loadState();
    const meta = await getMeta();
    return jsonResponse({ ok: true, state, ...meta, usingD1: false, realtimeEnabled: false });
  };

  const route = async (input, init = {}) => {
    const url = parseRequestUrl(input);
    const method = String(init.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
    const requestLike = input instanceof Request ? input : init;
    const path = url.pathname;

    if (path === "/api/bootstrap" && method === "GET") return bootstrap();
    if (path === "/api/state" && method === "GET") return bootstrap();
    if (path === "/api/state" && method === "POST") {
      const body = await readJsonBody(requestLike);
      return persistState(body.state || {}, body.syncEvent || null);
    }
    if (path === "/api/state/meta" && method === "GET") return jsonResponse({ ok: true, ...(await getMeta()), usingD1: false, realtimeEnabled: false });
    if (path === "/api/changes" && method === "GET") {
      const after = Number(url.searchParams.get("after") || 0);
      const { data, error } = await getClient().from("change_events").select("*").gt("id", after).order("id", { ascending: true }).limit(100);
      if (error) throw error;
      const state = await loadState();
      const meta = await getMeta();
      return jsonResponse({ ok: true, changes: data || [], state, ...meta, usingD1: false, realtimeEnabled: false });
    }
    if (path === "/api/auth/login" && method === "POST") return handleLogin(requestLike);
    if (path === "/api/auth/name-session" && method === "POST") return handleNameSession(requestLike);
    if (path === "/api/auth/guest" && method === "POST") return handleGuest();
    if (path === "/api/auth/logout" && method === "POST") return handleLogout();
    if (path === "/api/auth/session-collaborators" && method === "GET") return jsonResponse({ ok: true, collaborators: (await loadState()).sessionCollaborators, usingD1: false });
    if (path === "/api/auth/register" && method === "POST") return apiError("Cadastro direto foi desativado nesta migração. Crie usuários pelo Supabase Auth e vincule em profiles.", 410);
    if (path === "/api/users" && method === "GET") return jsonResponse({ ok: true, users: (await loadState()).users, ...(await getMeta()), usingD1: false });
    if (path === "/api/users" && method === "POST") return handleUsersCreate(requestLike);

    const userMatch = path.match(/^\/api\/users\/([^/]+)$/);
    if (userMatch && method === "PATCH") return handleUsersUpdate(decodeURIComponent(userMatch[1]), requestLike);

    const roomMatch = path.match(/^\/api\/infra\/rooms\/([^/]+)$/);
    if (roomMatch && method === "PATCH") return handleInfraPatch(decodeURIComponent(roomMatch[1]), requestLike);

    return apiError("Rota não encontrada no adaptador Supabase.", 404);
  };

  window.fetch = async function patchedFetch(input, init = {}) {
    if (!isApiRequest(input)) return originalFetch(input, init);
    try {
      return await route(input, init);
    } catch (error) {
      console.error("[AV.Storage Supabase Adapter]", error);
      return apiError(error?.message || "Erro interno no adaptador Supabase.", error?.status || 500, String(error));
    }
  };

  window.AV_STORAGE_SUPABASE_ADAPTER_READY = true;
})();
