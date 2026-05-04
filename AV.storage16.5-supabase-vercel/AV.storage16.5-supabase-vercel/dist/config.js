// AV.Storage v16.5 — configuração pública do Supabase.
// Não coloque service_role nem senhas neste arquivo.
window.AV_STORAGE_SUPABASE = {
    url: "https://smjlfspfhdxssmwwriyy.supabase.co",
    anonKey: "sb_publishable_lsSIkv61Fs-m29fQB56TAw_b75MjqVq.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtamxmc3BmaGR4c3Ntd3dyaXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4OTE3OTIsImV4cCI6MjA5MzQ2Nzc5Mn0.EdbO36y1aBS0SZHvHcOdRSUP_oFPYGalp7apoV3kT4U",

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
