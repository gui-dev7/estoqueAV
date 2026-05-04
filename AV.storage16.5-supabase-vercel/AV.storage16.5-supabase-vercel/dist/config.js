// AV.Storage v16.5 — configuração pública do Supabase.
// Não coloque service_role nem senhas neste arquivo.
window.AV_STORAGE_SUPABASE = {
  url: "https://SEU-PROJETO.supabase.co",
  anonKey: "SUA_ANON_PUBLIC_KEY",

  // Aliases de login usados na tela.
  // As senhas devem ser cadastradas somente no Supabase Auth.
  adminEmail: "admin@seudominio.com",
  developerEmail: "dev.gui@seudominio.com",

  authUsers: {
    "admin": {
      email: "admin@seudominio.com",
      profileId: "admin",
      role: "Administrador",
      label: "Administrador T2"
    },
    "dev.gui": {
      email: "dev.gui@seudominio.com",
      profileId: "dev.gui",
      role: "Desenvolvedor",
      label: "Desenvolvedor T1"
    }
  },

  sessionCollaborators: ["Evandro", "Lucas", "Guilherme", "Marcos"]
};
