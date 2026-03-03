import { supabase } from "./supabaseClient.js";
window.supabase = supabase;

let map = null;
let myMarker = null;
let myPos = null;
let alertMarkers = [];

const el = (id) => document.getElementById(id);

function setBoot(show, msg = "") {
  const b = el("boot");
  if (!b) return;
  b.classList.toggle("hidden", !show);
  const m = el("bootMsg");
  if (m) m.textContent = msg;
}

function showApp(show) {
  const app = el("app");
  if (!app) return;
  app.hidden = !show;
}

function showAuthModal(show) {
  const m = el("authModal");
  if (!m) return;
  m.style.display = show ? "flex" : "none";
}

function showAuthMessage(msg) {
  const p = el("authError");
  if (!p) return;
  p.textContent = msg || "";
}

function initMap() {
  if (map) return;
  map = L.map("map").setView([48.8566, 2.3522], 12);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);
}

async function safeGetUser(timeoutMs = 3500) {
  // Empêche les hangs si une extension bloque
  return await Promise.race([
    supabase.auth.getUser(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout getUser (bloqué par extension ?)")), timeoutMs)
    )
  ]);
}

async function refreshAuthUI() {
  setBoot(true, "Vérification session…");

  try {
    const { data, error } = await safeGetUser();
    if (error) throw error;

    const user = data.user;

    if (!user) {
      showApp(false);
      showAuthModal(true);
      showAuthMessage("");
      el("userLabel").textContent = "";
      el("btnLogout").hidden = true;
      return;
    }

    showAuthModal(false);
    showAuthMessage("");
    showApp(true);

    el("userLabel").textContent = user.email;
    el("btnLogout").hidden = false;

    initMap();
    setTimeout(() => map.invalidateSize(), 200);

  } catch (e) {
    console.log("refreshAuthUI error", e);
    showApp(false);
    showAuthModal(true);
    showAuthMessage(
      "Blocage détecté (souvent une extension/antivirus). Essaie en navigation privée ou désactive AdBlock/Shield pour 127.0.0.1."
    );
  } finally {
    setBoot(false);
  }
}

async function signup() {
  showAuthMessage("");
  const email = el("authEmail").value.trim();
  const password = el("authPassword").value;

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    console.log("SIGNUP ERROR", error);
    showAuthMessage(error.message);
    return;
  }

  showAuthMessage(
    "✅ Compte créé ! Va dans tes emails et clique sur le lien de confirmation. Ensuite reviens ici pour te connecter."
  );
  el("authPassword").value = "";
}

async function login() {
  showAuthMessage("");
  const email = el("authEmail").value.trim();
  const password = el("authPassword").value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.log("LOGIN ERROR", error);
    showAuthMessage(error.message);
    return;
  }

  await refreshAuthUI();
}

async function logout() {
  await supabase.auth.signOut();
  await refreshAuthUI();
}

function registerPWA() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  }
}

async function main() {
  registerPWA();

  el("btnLogin").addEventListener("click", login);
  el("btnSignup").addEventListener("click", signup);
  el("btnLogout").addEventListener("click", logout);

  // Anti-boot infini quoi qu'il arrive
  setBoot(true, "Initialisation…");
  setTimeout(() => {
    if (!el("boot")?.classList.contains("hidden")) {
      setBoot(false);
      showApp(false);
      showAuthModal(true);
      if (!el("authError").textContent) {
        showAuthMessage("Si ça bloque, essaye en navigation privée (Ctrl+Shift+N).");
      }
    }
  }, 4000);

  supabase.auth.onAuthStateChange(async () => {
    await refreshAuthUI();
  });

  await refreshAuthUI();
}

main();