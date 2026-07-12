// ======================================================================
// JULIO VENTAS — script.js
// Firebase + íconos SVG + autenticación + tienda (Comprar/Productos/Tierlist/Inventario)
// ======================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, updateDoc, increment,
  collection, addDoc, getDocs, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBneijMWv1qTelQCCIKqCjQtiKmzgFF2wc",
  authDomain: "julio-ventas.firebaseapp.com",
  projectId: "julio-ventas",
  storageBucket: "julio-ventas.firebasestorage.app",
  messagingSenderId: "920378195791",
  appId: "1:920378195791:web:bf605243f4d29668580f3a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---------------------------------------------------------------------
// ICONOS SVG (sin emojis)
// ---------------------------------------------------------------------
const ICONS = {
  key: `<path d="M15 7a4 4 0 1 1-5.65 5.65L4 18v3h3v-2h2v-2h2l1.35-1.35A4 4 0 0 1 15 7Z"/><circle cx="15.5" cy="7.5" r="1.4"/>`,
  diamond: `<path d="M3 9h18M9 3l-3 6 6 12 6-12-3-6Z"/>`,
  ticket: `<path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z"/><path d="M13 6v2M13 11v2M13 16v2"/>`,
  target: `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>`,
  shirt: `<path d="M8 3 3 7l3 3 2-1v10h8V9l2 1 3-3-5-4-3 2h-2Z"/>`,
  paw: `<circle cx="7" cy="8" r="1.6"/><circle cx="11" cy="5.5" r="1.6"/><circle cx="15" cy="5.5" r="1.6"/><circle cx="18" cy="8" r="1.6"/><path d="M12 12c-4 0-6 2.5-6 5a3 3 0 0 0 6 1 3 3 0 0 0 6-1c0-2.5-2-5-6-5Z"/>`,
  star: `<path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1L6.6 19.3l1.3-6-4.6-4.1 6.1-.6Z"/>`,
  cart: `<circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M2 3h2l2.4 12.2A2 2 0 0 0 8.4 17h8.2a2 2 0 0 0 2-1.6L21 7H6"/>`,
  user: `<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/>`,
  users: `<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.4 3-5 6.5-5s6.5 1.6 6.5 5"/><circle cx="17.5" cy="9" r="2.6"/><path d="M15 15.2c2.8.3 5 1.8 5 4.8"/>`,
  mail: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>`,
  lock: `<rect x="4.5" y="10" width="15" height="10" rx="1.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>`,
  logout: `<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3"/>`,
  shield: `<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/><path d="m8.5 12 2.3 2.3L15.5 9.5"/>`,
  save: `<path d="M5 3h11l3 3v15H5Z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>`,
  search: `<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.4-4.4"/>`,
  plus: `<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>`,
  wallet: `<path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3H5a2 2 0 0 1-2-2Z"/><path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-4a2 2 0 0 0 0 4h4"/>`,
  gem: `<path d="M12 21 4 9l4-6h8l4 6Z"/><path d="M4 9h16M9 3l3 6 3-6M8.5 9 12 21l3.5-12"/>`,
  trophy: `<path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M7 5H4a3 3 0 0 0 3 5M17 5h3a3 3 0 0 1-3 5"/>`,
  box: `<path d="m3.3 7 8.7 5 8.7-5M12 22V12"/><path d="M20 7 12 2 4 7v10l8 5 8-5Z"/>`,
  alert: `<path d="M12 3 2 21h20Z"/><path d="M12 10v4M12 17.2v.1"/>`,
  check: `<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>`
};
function svg(name, size = 22, cls = "") {
  return `<svg class="icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
}
function iconBox(name, size = 18){ return `<span class="icon-box">${svg(name, size)}</span>`; }

// ---------------------------------------------------------------------
// CATÁLOGO
// ---------------------------------------------------------------------
const keyPackages = [
  { id:'k1', name:'1 Key',  icon:'key', amount:1, price:1 },
  { id:'k2', name:'2 Keys', icon:'key', amount:2, price:2 },
  { id:'k3', name:'3 Keys', icon:'key', amount:3, price:3 },
  { id:'k4', name:'4 Keys', icon:'key', amount:4, price:4 },
  { id:'k5', name:'5 Keys', icon:'key', amount:5, price:5 },
];
const products = [
  { id:'p3', name:'572 Diamantes FF',    icon:'diamond', cost:110, tier:'S' },
  { id:'p7', name:'Mascota Exclusiva',   icon:'paw',     cost:120, tier:'S' },
  { id:'p2', name:'341 Diamantes FF',    icon:'diamond', cost:70,  tier:'A' },
  { id:'p5', name:'Skin de Arma',        icon:'target',  cost:90,  tier:'A' },
  { id:'p4', name:'Pase Elite Actual',   icon:'ticket',  cost:60,  tier:'B' },
  { id:'p6', name:'Bundle de Personaje', icon:'shirt',   cost:80,  tier:'B' },
  { id:'p1', name:'110 Diamantes FF',    icon:'diamond', cost:25,  tier:'C' },
  { id:'p8', name:'Emote Especial',      icon:'star',    cost:35,  tier:'C' },
];
const ranks = [
  { name:'HEROICO', min:175, className:'heroico' },
  { name:'DIAMANTE', min:100, className:'diamante' },
  { name:'ORO', min:50, className:'oro' },
  { name:'PLATA', min:20, className:'plata' },
  { name:'BRONCE', min:0, className:'bronce' },
];

function getRank(keys = 0){
  return ranks.find(rank => keys >= rank.min) || ranks[ranks.length - 1];
}

function escapeHtml(value = ''){
  return String(value).replace(/[&<>'"]/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
  })[char]);
}

// ---------------------------------------------------------------------
// ESTADO
// ---------------------------------------------------------------------
let currentUser = null;
let userData = null;
let mode = "login";

const $ = (id) => document.getElementById(id);
const money = (n) => '$' + n.toFixed(2);

function toast(msg, isError=false){
  const t = $('toast');
  if(!t) return;
  t.innerHTML = svg(isError ? "alert" : "check", 18) + `<span>${msg}</span>`;
  t.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(()=> t.className = 'toast', 2500);
}

// ---------------------------------------------------------------------
// RENDER: AUTENTICACIÓN
// ---------------------------------------------------------------------
function buildAuthView(){
  return `
  <div class="auth-wrap" id="authView">
    <div class="auth-card">
      <div class="auth-logo">${iconBox('gem',22)} Julio Ventas</div>
      <p class="auth-sub">Tienda Free Fire — inicia sesión o crea tu cuenta para comprar Keys y canjear productos.</p>
      <div class="auth-tabs">
        <button id="tabLogin" class="active">Iniciar sesión</button>
        <button id="tabRegister">Crear cuenta</button>
      </div>
      <form id="authForm">
        <div class="field">
          <label>Correo electrónico</label>
          <div class="input-group">${svg('mail',18)}<input type="email" id="email" placeholder="tucorreo@ejemplo.com" required autocomplete="email"></div>
        </div>
        <div class="field">
          <label>Contraseña</label>
          <div class="input-group">${svg('lock',18)}<input type="password" id="password" placeholder="Mínimo 6 caracteres" required autocomplete="current-password"></div>
        </div>
        <button type="submit" class="btn" id="submitBtn"><span id="submitContent">${svg('check',18)} Iniciar sesión</span></button>
        <div class="auth-msg" id="authMsg"></div>
      </form>
      <div class="auth-footer">Julio Ventas — Tienda no oficial de Free Fire, solo fines demostrativos.</div>
    </div>
  </div>`;
}

function friendlyError(code){
  const map = {
    "auth/invalid-email": "Correo electrónico inválido.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/email-already-in-use": "Ese correo ya está registrado.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/missing-password": "Ingresa una contraseña.",
    "auth/too-many-requests": "Demasiados intentos. Intenta más tarde."
  };
  return map[code] || "Ocurrió un error. Intenta de nuevo.";
}

function initAuthView(){
  $('app').innerHTML = buildAuthView();

  function setMode(m){
    mode = m;
    $('tabLogin').classList.toggle('active', m === 'login');
    $('tabRegister').classList.toggle('active', m === 'register');
    $('submitContent').innerHTML = (m === 'login')
      ? svg('check',18) + ' Iniciar sesión'
      : svg('plus',18) + ' Crear cuenta';
    $('authMsg').textContent = '';
    $('authMsg').className = 'auth-msg';
  }
  $('tabLogin').addEventListener('click', () => setMode('login'));
  $('tabRegister').addEventListener('click', () => setMode('register'));

  $('authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('email').value.trim();
    const password = $('password').value;
    const authMsg = $('authMsg');
    const submitBtn = $('submitBtn');
    authMsg.className = 'auth-msg';
    authMsg.innerHTML = '<span class="spinner"></span> Procesando...';
    submitBtn.disabled = true;
    try {
      if (mode === 'login') {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const ref = doc(db, 'users', cred.user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, { email, keys:0, isAdmin:false, createdAt: serverTimestamp() });
        }
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', cred.user.uid), {
          email, keys:0, isAdmin:false, createdAt: serverTimestamp()
        });
      }
      authMsg.className = 'auth-msg ok';
      authMsg.innerHTML = svg('check',16) + ' ¡Listo! Redirigiendo...';
    } catch (err) {
      authMsg.className = 'auth-msg error';
      authMsg.innerHTML = svg('alert',16) + ' ' + friendlyError(err.code);
      submitBtn.disabled = false;
    }
  });
}

// ---------------------------------------------------------------------
// RENDER: TIENDA (4 categorías: Comprar / Productos / Tierlist / Inventario)
// ---------------------------------------------------------------------
function buildStoreView(){
  return `
  <header>
    <div class="brand">${iconBox('gem',20)} Julio <span class="accent-word">Ventas</span></div>
    <div class="header-right">
      <span class="user-tag" id="userEmail"></span>
      <div class="pill">${svg('wallet',16)} <span id="keyCount">0</span> Keys</div>
      <a href="adminui/index.html" id="adminLink" class="iconbtn" style="display:none;">${svg('shield',16)} Admin</a>
      <button class="iconbtn" id="logoutBtn">${svg('logout',16)} Salir</button>
    </div>
  </header>
  <nav>
    <button class="tab-btn active" data-tab="comprar">${svg('key',16)} Comprar</button>
    <button class="tab-btn" data-tab="productos">${svg('diamond',16)} Productos</button>
    <button class="tab-btn" data-tab="tierlist">${svg('trophy',16)} Tierlist</button>
    <button class="tab-btn" data-tab="inventario">${svg('box',16)} Inventario</button>
  </nav>
  <main>
    <section id="comprar" class="active">
      <div class="section-head">
        <h2>${iconBox('key',18)} Comprar Keys</h2>
        <p class="subtext">Compra Keys (moneda de la tienda) para poder canjear productos de Free Fire.</p>
      </div>
      <div class="grid" id="keysGrid"></div>
    </section>
    <section id="productos">
      <div class="section-head">
        <h2>${iconBox('diamond',18)} Productos disponibles</h2>
        <p class="subtext">Canjea tus Keys por diamantes, skins y más.</p>
      </div>
      <div class="grid" id="productsGrid"></div>
    </section>
    <section id="tierlist">
      <div class="section-head">
        <h2>${iconBox('trophy',18)} Tier List de jugadores</h2>
        <p class="subtext">Ranking de personas con más Keys.</p>
      </div>
      <div id="tierlistWrap"></div>
    </section>
    <section id="inventario">
      <div class="section-head">
        <h2>${iconBox('box',18)} Mi Inventario</h2>
        <p class="subtext">Productos que ya has canjeado.</p>
      </div>
      <div class="grid" id="inventoryGrid"><p class="empty">Cargando...</p></div>
    </section>
  </main>
  <footer>© 2026 Julio Ventas — Tienda no oficial de Free Fire. Solo con fines demostrativos.</footer>
  <div class="toast" id="toast"></div>
  `;
}

function renderKeys(){
  const grid = $('keysGrid');
  grid.innerHTML = '';
  keyPackages.forEach((pkg, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = (i * 0.06) + 's';
    card.innerHTML = `
      ${pkg.tag ? `<div class="badge">${pkg.tag}</div>` : ''}
      <div class="icon-wrap">${svg(pkg.icon, 26)}</div>
      <h3>${pkg.name}</h3>
      <div class="price">${svg('key',16)} ${pkg.amount} Keys</div>
      <div class="subprice">${money(pkg.price)}</div>
      <button data-buykey="${pkg.id}">${svg('cart',16)} Comprar</button>
    `;
    grid.appendChild(card);
  });
}

function renderProducts(){
  const grid = $('productsGrid');
  grid.innerHTML = '';
  const balance = userData?.keys ?? 0;
  products.forEach((p, i) => {
    const canBuy = balance >= p.cost;
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = (i * 0.06) + 's';
    card.innerHTML = `
      <div class="icon-wrap">${svg(p.icon, 26)}</div>
      <h3>${p.name}</h3>
      <div class="price">${svg('key',16)} ${p.cost}</div>
      <div class="subprice">&nbsp;</div>
      <button data-buyproduct="${p.id}" ${canBuy ? '' : 'disabled'}>
        ${canBuy ? svg('cart',16) + ' Canjear' : svg('lock',16) + ' Keys insuficientes'}
      </button>
    `;
    grid.appendChild(card);
  });
}

async function renderTierlist(){
  const wrap = $('tierlistWrap');
  wrap.innerHTML = `<p class="empty">Cargando ranking...</p>`;
  try {
    const snap = await getDocs(collection(db, 'users'));
    const players = snap.docs
      .map(d => ({ email: d.data().email || 'Usuario', keys: Number(d.data().keys) || 0 }))
      .sort((a, b) => b.keys - a.keys || a.email.localeCompare(b.email));

    if (!players.length){
      wrap.innerHTML = `<p class="empty">Aún no hay jugadores en el ranking.</p>`;
      return;
    }

    wrap.innerHTML = `<div class="leaderboard">${players.map((player, index) => {
      const rank = getRank(player.keys);
      return `
        <div class="leaderboard-row" style="animation-delay:${index * 0.05}s">
          <span class="position">#${index + 1}</span>
          <div class="player-info">
            <span class="player-email">${escapeHtml(player.email)}</span>
            <span class="rank-tag ${rank.className}">${rank.name}</span>
          </div>
          <span class="player-keys">${svg('key',16)} ${player.keys} Keys</span>
        </div>`;
    }).join('')}</div>
    <p class="rank-legend">Bronce: 0 · Plata: 20 · Oro: 50 · Diamante: 100 · Heroico: 175 Keys</p>`;
  } catch (error) {
    console.error('No se pudo cargar la Tier List:', error);
    wrap.innerHTML = `<p class="empty">No fue posible cargar el ranking.</p>`;
  }
}

async function loadInventory(){
  const grid = $('inventoryGrid');
  const snap = await getDocs(query(collection(db, 'users', currentUser.uid, 'inventory'), orderBy('createdAt','desc')));
  if (snap.empty){
    grid.innerHTML = `<p class="empty">${svg('box',30)}Aún no has comprado productos.</p>`;
    return;
  }
  grid.innerHTML = '';
  let i = 0;
  snap.forEach(d => {
    const item = d.data();
    const div = document.createElement('div');
    div.className = 'inv-item';
    div.style.animationDelay = (i++ * 0.05) + 's';
    div.innerHTML = `<div class="icon-wrap">${svg(item.icon || 'box', 20)}</div><div><h4>${item.name}</h4><small>Canjeado: ${item.date || ''}</small></div>`;
    grid.appendChild(div);
  });
}

async function refreshUserData(){
  const snap = await getDoc(doc(db, 'users', currentUser.uid));
  userData = snap.data();
}

async function renderStore(){
  await refreshUserData();
  $('keyCount').textContent = userData?.keys ?? 0;
  const currentRank = getRank(userData?.keys ?? 0);
  $('userEmail').textContent = `${currentUser?.email ?? ''} · ${currentRank.name}`;
  renderKeys();
  renderProducts();
  await renderTierlist();
  await loadInventory();
  if (userData?.isAdmin) $('adminLink').style.display = 'flex';
}

async function buyKeyPackage(id){
  const pkg = keyPackages.find(k => k.id === id);
  if (!pkg) return;
  await updateDoc(doc(db, 'users', currentUser.uid), { keys: increment(pkg.amount) });
  await addDoc(collection(db, 'users', currentUser.uid, 'history'), {
    type:'key', desc:`Compra de ${pkg.name} (+${pkg.amount} keys)`, value: pkg.price,
    icon: pkg.icon, date: new Date().toLocaleString(), createdAt: serverTimestamp()
  });
  toast(`Compraste ${pkg.amount} Keys`);
  await renderStore();
}

async function buyProduct(id){
  const p = products.find(x => x.id === id);
  if (!p) return;
  await refreshUserData();
  if ((userData.keys ?? 0) < p.cost){
    toast('No tienes suficientes Keys', true);
    return;
  }
  await updateDoc(doc(db, 'users', currentUser.uid), { keys: increment(-p.cost) });
  const date = new Date().toLocaleString();
  await addDoc(collection(db, 'users', currentUser.uid, 'inventory'), { name: p.name, icon: p.icon, date, createdAt: serverTimestamp() });
  await addDoc(collection(db, 'users', currentUser.uid, 'history'), { type:'product', desc:`Canjeado: ${p.name}`, value: p.cost, icon: p.icon, date, createdAt: serverTimestamp() });
  toast(`Canjeaste: ${p.name}`);
  await renderStore();
}

function initStoreView(){
  $('app').innerHTML = buildStoreView();
  renderStore();

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      $(btn.dataset.tab).classList.add('active');
    });
  });

  $('logoutBtn').addEventListener('click', async () => { await signOut(auth); });

  document.addEventListener('click', (e) => {
    const buyKeyId = e.target.closest('[data-buykey]')?.getAttribute('data-buykey');
    const buyProdId = e.target.closest('[data-buyproduct]')?.getAttribute('data-buyproduct');
    if (buyKeyId) buyKeyPackage(buyKeyId);
    if (buyProdId) buyProduct(buyProdId);
  });
}

// ---------------------------------------------------------------------
// ARRANQUE
// ---------------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    initStoreView();
  } else {
    initAuthView();
  }
});
