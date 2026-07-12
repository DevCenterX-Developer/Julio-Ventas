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
  collection, addDoc, getDocs, query, where, runTransaction, orderBy, serverTimestamp
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
  const className = cls ? 'icon ' + cls : 'icon';
  return '<svg class="' + className + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
}
function iconBox(name, size = 18){ return '<span class="icon-box">' + svg(name, size) + '</span>'; }

// ---------------------------------------------------------------------
// CATÁLOGO
// ---------------------------------------------------------------------
const keyOfferSections = [
  {
    id:'apk',
    title:'APK',
    subtitle:'HG APK / DRIP',
    durationOptions: [
      { days:1, price:2 },
      { days:3, price:3.5 },
      { days:15, price:8 },
      { days:30, price:12 }
    ]
  },
  {
    id:'proxy',
    title:'PROXY',
    subtitle:'HG PROXY / DRIP PROXY',
    durationOptions: [
      { days:3, price:3.5 },
      { days:7, price:5 },
      { days:31, price:9 }
    ]
  }
];

const packageContentOptions = {
  apk: [
    { value:'Drip Client', label:'APK Drip Client' },
    { value:'HG Heats', label:'APK HG Heats' },
    { value:'Cuban Mods', label:'APK Cuban Mods' }
  ],
  proxy: [
    { value:'Drip Client', label:'Proxy Drip Client' },
    { value:'HG Heats', label:'Proxy HG Heats' },
    { value:'Cuban Mods', label:'Proxy Cuban Mods' }
  ]
};

const products = [
  { id:'p3', name:'Drip APK',          icon:'diamond', image:'imagenes/drip-apk.jpeg', cost:1, currency:'apk', tier:'S' },
  { id:'p7', name:'Drip Proxy',        icon:'paw',     image:'imagenes/drip-proxy.jpeg', cost:1, currency:'proxy', tier:'S' },
  { id:'p2', name:'HG APK',            icon:'diamond', image:'imagenes/hg-apk.jpeg', cost:1, currency:'apk', tier:'A' },
  { id:'p5', name:'HG Proxy',          icon:'target',  image:'imagenes/hg-proxy.jpeg', cost:1, currency:'proxy', tier:'A' },
  { id:'p4', name:'Cuban APK',         icon:'ticket',  image:'imagenes/cuban-apk.jpeg', cost:1, currency:'apk', tier:'B' },
  { id:'p6', name:'Cuban Proxy',       icon:'shirt',   image:'imagenes/cuban-proxy.jpeg', cost:1, currency:'proxy', tier:'B' },
  { id:'p1', name:'Drip APK',          icon:'diamond', image:'imagenes/drip-apk.jpeg', cost:1, currency:'apk', tier:'C' },
  { id:'p8', name:'Drip Proxy',        icon:'star',    image:'imagenes/drip-proxy.jpeg', cost:1, currency:'proxy', tier:'C' },
];

const CLAIM_BASE_URL = 'https://juliojl.vercel.app';

function getClaimCodeFromLocation(){
  const query = new URLSearchParams(window.location.search);
  const fromQuery = query.get('claim') || query.get('code') || '';
  if (fromQuery) return fromQuery;
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts[0] === 'claim' && pathParts[1]) return pathParts[1];
  return '';
}

function generateKeyCode(type = 'APK'){
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = Date.now().toString().slice(-4);
  return `${type}-${stamp}-${randomPart}`;
}

function showCelebration(title, message, code){
  const overlay = $('celebrationOverlay');
  if (!overlay) return;
  $('celebrationMessage').textContent = message;
  $('celebrationCode').textContent = code;
  overlay.querySelector('h3').textContent = title;
  overlay.classList.remove('hidden');
  setTimeout(() => overlay.classList.add('hidden'), 2800);
}

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

function getKeyBalances(data = {}){
  const apkKeys = Number(data?.apkKeys ?? data?.keys ?? 0);
  const proxyKeys = Number(data?.proxyKeys ?? 0);
  return { apkKeys, proxyKeys, total: apkKeys + proxyKeys };
}

function parseDurationDays(durationValue = ''){
  if (!durationValue) return 0;
  if (String(durationValue).toUpperCase() === '1MES') return 30;
  const match = String(durationValue).match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function toDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getActiveKeys(data = {}, currency = 'apk') {
  const entries = Array.isArray(data?.activeKeys) ? data.activeKeys : [];
  const now = Date.now();
  return entries.filter((entry) => {
    if (entry?.type && entry.type !== currency) return false;
    const expiresAt = toDate(entry?.expiresAt);
    return !expiresAt || expiresAt.getTime() > now;
  });
}

function getUsableActiveKeyEntries(data = {}, currency = 'apk') {
  const entries = Array.isArray(data?.activeKeys) ? data.activeKeys : [];
  const now = Date.now();
  return entries
    .map((entry, index) => ({ ...entry, index }))
    .filter((entry) => {
      if (entry?.type && entry.type !== currency) return false;
      const expiresAt = toDate(entry?.expiresAt);
      return !expiresAt || expiresAt.getTime() > now;
    });
}

function getActiveKeySummary(data = {}, currency = 'apk') {
  const entries = getActiveKeys(data, currency);
  return {
    entries,
    total: entries.reduce((acc, entry) => acc + (Number(entry?.amount) || 1), 0),
    firstEntry: entries[0] || null
  };
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
let currentClaimCode = '';
let purchaseSelection = {
  sectionId: 'apk',
  amount: 1,
  durationDays: null,
  client: '',
  packageContent: '',
  packageNote: ''
};
let redemptionSelection = {
  productId: null,
  activeKeyIndex: null
};

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
          await setDoc(ref, { email, apkKeys:0, proxyKeys:0, keys:0, isAdmin:false, createdAt: serverTimestamp() });
        }
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', cred.user.uid), {
          email, apkKeys:0, proxyKeys:0, keys:0, isAdmin:false, createdAt: serverTimestamp()
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
    <div class="brand">${iconBox('gem',20)} Julio <span class="accent-word">Ventas</span> <a href="adminui/index.html" id="adminLink" class="iconbtn admin-brand-link" style="display:none;">${svg('shield',14)} Admin</a></div>
    <div class="header-right">
      <span class="user-tag" id="userEmail"></span>
      <div class="key-summary" id="keySummaryBlock">
        <button class="key-summary-toggle" id="keySummaryToggle" type="button">
          <span class="key-pill apk">${svg('key',14)} <span id="apkKeyValue">0</span> APK</span>
          <span class="key-pill proxy">${svg('key',14)} <span id="proxyKeyValue">0</span> PROXY</span>
          <span class="key-pill total">${svg('wallet',14)} <span id="totalKeyValue">0</span> Total</span>
        </button>
        <div class="key-summary-dropdown" id="keySummaryDropdown"></div>
      </div>
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
        <h2>${iconBox('key',18)} Pedidos por WhatsApp</h2>
        <p class="subtext">Elige el paquete, confirma los días y te redirigimos a WhatsApp para terminar tu pedido.</p>
      </div>
      <div class="grid" id="keysGrid"></div>
    </section>
    <section id="productos">
      <div class="section-head">
        <h2>${iconBox('diamond',18)} Productos disponibles</h2>
        <p class="subtext">Canjea tus keys por APK o Proxy y obtén productos.</p>
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
  <footer>© 2026 Julio Ventas</footer>
  <div class="toast" id="toast"></div>
  <div id="celebrationOverlay" class="celebration-overlay hidden">
    <div class="celebration-card">
      <div class="celebration-icon">${svg('check', 32)}</div>
      <h3>¡Canjeado con éxito!</h3>
      <p id="celebrationMessage">Tu producto quedó guardado en tu inventario.</p>
      <div class="celebration-code" id="celebrationCode"></div>
    </div>
  </div>
  <div id="purchaseModal" class="modal hidden">
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <h3>${svg('cart',18)} Personaliza tu pedido</h3>
          <p id="modalSectionSubtitle">Detalle del producto</p>
        </div>
        <button class="modal-close" type="button">×</button>
      </div>
      <div class="modal-body">
        <div class="modal-row">
          <div class="modal-label">Categoría</div>
          <div id="modalCategory" class="modal-value"></div>
        </div>
        <div class="modal-row">
          <div class="modal-label">Keys</div>
          <div id="modalKeysCount" class="modal-value"></div>
        </div>
        <div class="detail-field">
          <label for="clientNameModal">Cliente</label>
          <input id="clientNameModal" class="client-input" type="text" placeholder="Nombre del cliente">
        </div>
        <div class="detail-field">
          <label for="packageContentSelect">¿Qué debe contener tu paquete?</label>
          <select id="packageContentSelect" class="client-input package-select">
            <option value="">Selecciona una opción</option>
          </select>
        </div>
        <div class="detail-field hidden">
          <label for="packageNoteModal">Tipo</label>
          <select id="packageNoteModal" class="client-input package-select">
            <option value="">Selecciona una opción</option>
            <option value="Drip">Drip</option>
            <option value="Cuban">Cuban</option>
            <option value="HG">HG</option>
          </select>
        </div>
        <div class="modal-divider"></div>
        <div class="modal-row modal-row-tight">
          <span class="modal-label">Duración</span>
          <div class="modal-duration-grid"></div>
        </div>
      </div>
      <button id="modalSubmitBtn" class="complete-btn" disabled>${svg('check',16)} Enviar pedido a WhatsApp</button>
    </div>
  </div>
  <div id="redeemModal" class="modal hidden">
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <h3>${svg('check',18)} Canjear producto</h3>
          <p id="redeemModalSubtitle">Elige una key activa para validar el canje.</p>
        </div>
        <button class="modal-close" type="button">×</button>
      </div>
      <div class="modal-body">
        <div class="modal-row">
          <div class="modal-label">Producto</div>
          <div id="redeemProductName" class="modal-value"></div>
        </div>
        <div class="detail-field">
          <label for="redeemKeySelect">Selecciona una key activa</label>
          <select id="redeemKeySelect" class="client-input"></select>
        </div>
        <div id="redeemHint" class="redeem-hint">Se usará una key activa guardada en tu cuenta para validar el canje.</div>
      </div>
      <button id="redeemSubmitBtn" class="complete-btn">${svg('check',16)} Canjear ahora</button>
    </div>
  </div>
  `;
}

function getKeyDurationLabel(days){
  if (days === 30) return '1 MES';
  if (days === 31) return '1 MES';
  return `${days} D`;
}

function renderKeys(){
  const grid = $('keysGrid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="purchase-shell">
      ${keyOfferSections.map(section => `
        <div class="purchase-category">
          <div class="purchase-category-head">
            <div>
              <h3>${section.title}</h3>
              <p>${section.subtitle}</p>
            </div>
          </div>
          <div class="grid purchase-grid-cards">
            ${[1,2,3,4,5].map(amount => `
              <button class="card purchase-card ${purchaseSelection.sectionId === section.id && purchaseSelection.amount === amount ? 'selected' : ''}" data-keycard="${section.id}:${amount}">
                <div class="icon-wrap">${svg('key', 24)}</div>
                <h3>${amount} key${amount > 1 ? 's' : ''}</h3>
                <div class="subprice">Paquete personalizable</div>
                <span class="purchase-cta">Personalizar</span>
              </button>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function validatePurchaseModal(){
  const modal = $('purchaseModal');
  if (!modal) return;
  
  const hasContent = purchaseSelection.packageContent && purchaseSelection.packageContent.trim() !== '';
  const typeField = $('packageNoteModal')?.closest('.detail-field');
  const hasClient = purchaseSelection.client && purchaseSelection.client.trim() !== '';
  const hasType = purchaseSelection.packageNote && purchaseSelection.packageNote.trim() !== '';
  const submitBtn = $('modalSubmitBtn');
  
  const showType = hasContent;
  const showSubmit = hasContent;
  const isComplete = hasClient && hasContent && hasType;
  
  if (typeField) {
    typeField.classList.toggle('hidden', !showType);
  }
  
  if (submitBtn) {
    submitBtn.classList.toggle('hidden', !showSubmit);
    submitBtn.disabled = !isComplete;
  }
}

function openPurchaseModal(sectionId, amount){
  const section = keyOfferSections.find(item => item.id === sectionId) || keyOfferSections[0];
  purchaseSelection.sectionId = sectionId;
  purchaseSelection.amount = amount;
  if (!purchaseSelection.durationDays || !section.durationOptions.some(opt => opt.days === purchaseSelection.durationDays)) {
    purchaseSelection.durationDays = section.durationOptions[0].days;
  }

  const availableOptions = packageContentOptions[section.id] || [];
  const isValidSelection = purchaseSelection.packageContent && availableOptions.some(option => option.value === purchaseSelection.packageContent);
  purchaseSelection.packageContent = isValidSelection ? purchaseSelection.packageContent : '';

  const modal = $('purchaseModal');
  if (!modal) return;

  $('modalSectionSubtitle').textContent = `${section.title} — ${section.subtitle}`;
  $('modalCategory').textContent = section.title;
  $('modalKeysCount').textContent = amount;
  $('clientNameModal').value = purchaseSelection.client;
  const packageContentSelect = $('packageContentSelect');
  packageContentSelect.innerHTML = `<option value="">Selecciona una opción</option>${availableOptions.map(option => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join('')}`;
  packageContentSelect.value = purchaseSelection.packageContent || '';
  const packageNoteSelect = $('packageNoteModal');
  packageNoteSelect.value = purchaseSelection.packageNote || '';

  const durationGrid = modal.querySelector('.modal-duration-grid');
  durationGrid.innerHTML = section.durationOptions.map(option => `
    <button class="duration-btn ${purchaseSelection.durationDays === option.days ? 'active' : ''}" data-duration="${option.days}">
      <span>${getKeyDurationLabel(option.days)}</span>
      <small>${money(option.price)}</small>
    </button>
  `).join('');

  modal.classList.remove('hidden');
  validatePurchaseModal();
}

function closePurchaseModal(){
  const modal = $('purchaseModal');
  if (!modal) return;
  modal.classList.add('hidden');
}

function renderProducts(){
  const grid = $('productsGrid');
  grid.innerHTML = '';
  const balances = getKeyBalances(userData);
  const balance = p => p.currency === 'proxy' ? balances.proxyKeys : balances.apkKeys;
  products.forEach((p, i) => {
    const activeEntries = getUsableActiveKeyEntries(userData, p.currency === 'proxy' ? 'proxy' : 'apk');
    const canBuy = balance(p) >= p.cost || activeEntries.length > 0;
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = (i * 0.06) + 's';
    card.innerHTML = `
      <div class="product-media">
        ${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.name)}">` : `<div class="icon-wrap">${svg(p.icon, 26)}</div>`}
      </div>
      <div class="product-name">${escapeHtml(p.name)}</div>
      <div class="price">${svg('key',16)} 1 ${p.currency === 'proxy' ? 'Proxy' : 'APK'}</div>
      <div class="subprice">Canjea con una key activa o con saldo disponible</div>
      <button data-buyproduct="${p.id}" ${canBuy ? '' : 'disabled'}>
        ${canBuy ? svg('cart',16) + ' Canjear' : svg('lock',16) + ' Sin keys disponibles'}
      </button>
    `;
    grid.appendChild(card);
  });
}

function getNextRankProgress(totalKeys){
  const currentRank = getRank(totalKeys);
  if (!currentRank || currentRank.name === 'HEROICO') return null;
  const currentIndex = ranks.findIndex(rank => rank.name === currentRank.name);
  const nextRank = currentIndex > 0 ? ranks[currentIndex - 1] : null;
  if (!nextRank) return null;
  return { nextName: nextRank.name, needed: nextRank.min - totalKeys };
}

async function renderTierlist(){
  const wrap = $('tierlistWrap');
  wrap.innerHTML = `<div class="leaderboard loading">
      ${Array.from({ length: 4 }).map(() => `
        <div class="leaderboard-row loading-row">
          <span class="position skeleton"></span>
          <div class="player-info">
            <span class="player-email skeleton"></span>
            <span class="rank-tag skeleton"></span>
          </div>
          <span class="player-keys">
            <span class="currency-pill skeleton"></span>
            <span class="currency-pill skeleton"></span>
            <span class="currency-pill skeleton"></span>
          </span>
        </div>
      `).join('')}
    </div>`;
  try {
    const snap = await getDocs(collection(db, 'users'));
    const players = snap.docs
      .map(d => {
        const data = d.data();
        const balances = getKeyBalances(data);
        return {
          email: data.email || 'Usuario',
          apkKeys: balances.apkKeys,
          proxyKeys: balances.proxyKeys,
          totalKeys: balances.total
        };
      })
      .sort((a, b) => b.totalKeys - a.totalKeys || a.email.localeCompare(b.email));

    if (!players.length){
      wrap.innerHTML = `<p class="empty">Aún no hay jugadores en el ranking.</p>`;
      return;
    }

    wrap.innerHTML = `<div class="leaderboard">${players.map((player, index) => {
      const rank = getRank(player.totalKeys);
      const progress = getNextRankProgress(player.totalKeys);
      const progressText = progress ? `<div class="rank-progress">Faltan ${progress.needed} key${progress.needed === 1 ? '' : 's'} para ${progress.nextName}</div>` : '';
      return `
        <div class="leaderboard-row" style="animation-delay:${index * 0.05}s">
          <span class="position">#${index + 1}</span>
          <div class="player-info">
            <span class="player-email">${escapeHtml(player.email)}</span>
            <span class="rank-tag ${rank.className}">${rank.name}</span>
          </div>
          <div class="player-details">
            <span class="currency-pill">${svg('key',14)} ${player.apkKeys} APK</span>
            <span class="currency-pill">${svg('key',14)} ${player.proxyKeys} PROXY</span>
            <span class="currency-pill total">${svg('wallet',14)} ${player.totalKeys} Total</span>
            ${progressText}
          </div>
        </div>`;
    }).join('')}</div>
    <p class="rank-legend">Ranking basado en el total de APK + Proxy.</p>`;
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
    div.innerHTML = `
      <div class="inv-media">
        ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">` : `<div class="icon-wrap">${svg(item.icon || 'box', 20)}</div>`}
      </div>
      <div>
        <h4>${escapeHtml(item.name)}</h4>
        <small>Canjeado: ${escapeHtml(item.date || '')}</small>
        ${item.code ? `<div class="inv-code">${escapeHtml(item.code)}</div>` : ''}
      </div>`;
    grid.appendChild(div);
  });
}

async function refreshUserData(){
  const snap = await getDoc(doc(db, 'users', currentUser.uid));
  userData = snap.data();
}

function renderKeySummary(){
  const balances = getKeyBalances(userData);
  const activeApk = getActiveKeySummary(userData, 'apk');
  const activeProxy = getActiveKeySummary(userData, 'proxy');
  $('apkKeyValue').textContent = balances.apkKeys;
  $('proxyKeyValue').textContent = balances.proxyKeys;
  $('totalKeyValue').textContent = balances.total;
  const dropdown = $('keySummaryDropdown');
  const activeItems = [];
  const formatExpiry = (entry) => {
    const expiresAt = toDate(entry?.expiresAt);
    if (!expiresAt) return 'Sin fecha de expiración';
    return `Expira ${expiresAt.toLocaleDateString('es-ES')}`;
  };
  if (activeApk.entries.length) {
    activeItems.push(...activeApk.entries.map(entry => `<div class="summary-entry"><span class="summary-type apk">APK</span><span>${entry.amount || 1} keys · ${entry.durationDays ? `${entry.durationDays} D` : 'Sin tiempo'} · ${formatExpiry(entry)}</span></div>`));
  }
  if (activeProxy.entries.length) {
    activeItems.push(...activeProxy.entries.map(entry => `<div class="summary-entry"><span class="summary-type proxy">PROXY</span><span>${entry.amount || 1} keys · ${entry.durationDays ? `${entry.durationDays} D` : 'Sin tiempo'} · ${formatExpiry(entry)}</span></div>`));
  }
  dropdown.innerHTML = activeItems.length
    ? activeItems.join('')
    : '<div class="summary-entry empty">Sin keys activas por tiempo.</div>';
}

async function renderStore(){
  await refreshUserData();
  const balances = getKeyBalances(userData);
  renderKeySummary();
  const currentRank = getRank(balances.total);
  $('userEmail').textContent = `${currentUser?.email ?? ''} · ${currentRank.name}`;
  renderKeys();
  renderProducts();
  await renderTierlist();
  await loadInventory();
  if (userData?.isAdmin) $('adminLink').style.display = 'flex';
}

function buyKeyPackage(){
  const section = keyOfferSections.find(item => item.id === purchaseSelection.sectionId) || keyOfferSections[0];
  const amount = Number(purchaseSelection.amount);
  const client = String(purchaseSelection.client || '').trim();

  if (!Number.isInteger(amount) || amount < 1 || amount > 5) {
    toast('Selecciona una cantidad válida entre 1 y 5.', true);
    return;
  }

  if (!client) {
    toast('Escribe el nombre del cliente.', true);
    return;
  }

  const selectedOption = section.durationOptions.find(option => option.days === purchaseSelection.durationDays) || section.durationOptions[0];
  const durationLabel = getKeyDurationLabel(selectedOption.days);
  const contentText = purchaseSelection.packageContent ? ` Contenido: ${purchaseSelection.packageContent}.` : ' Contenido: Sin especificar.';
  const noteText = purchaseSelection.packageNote ? ` Tipo: ${purchaseSelection.packageNote.trim()}.` : '';
  const message = `Hola Julio, quiero ${amount} key${amount > 1 ? 's' : ''} de ${section.title.toUpperCase()} (${section.subtitle}) para el cliente ${client}. Duración: ${durationLabel}. Precio: ${money(selectedOption.price)} USD.${contentText}${noteText}`;
  const waLink = `https://wa.me/+573135875113?text=${encodeURIComponent(message)}`;

  window.open(waLink, '_blank', 'noopener,noreferrer');
  toast('Se abrió WhatsApp para completar tu pedido.');
}

async function findMatchingPromoCode(product){
  const snap = await getDocs(collection(db, 'promoCodes'));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .find((code) => code.active !== false && (
      code.productId === product.id ||
      code.productName === product.name ||
      code.type === product.currency
    )) || null;
}

async function buyProduct(id, selectedEntryIndex = null){
  const p = products.find(x => x.id === id);
  if (!p) return;
  await refreshUserData();
  const balances = getKeyBalances(userData);
  const activeKeyCurrency = p.currency === 'proxy' ? 'proxy' : 'apk';
  const activeEntries = getUsableActiveKeyEntries(userData, activeKeyCurrency);
  const matchingCode = await findMatchingPromoCode(p);
  const availableBalance = p.currency === 'proxy' ? balances.proxyKeys : balances.apkKeys;
  const canUseBalance = availableBalance >= p.cost;
  const canUseCode = Boolean(matchingCode);
  const selectedEntry = selectedEntryIndex !== null
    ? activeEntries.find((entry) => entry.index === Number(selectedEntryIndex)) || null
    : null;
  const canUseActiveKey = Boolean(selectedEntry) && (Number(selectedEntry.amount) || 1) >= p.cost;

  if (!canUseBalance && !canUseActiveKey && !canUseCode){
    toast(`No tienes suficientes keys ${p.currency === 'proxy' ? 'Proxy' : 'APK'} o un código activo para este producto.`, true);
    return;
  }

  const balanceField = p.currency === 'proxy' ? 'proxyKeys' : 'apkKeys';
  const updateData = {};
  if (canUseActiveKey) {
    const nextEntries = [...(Array.isArray(userData.activeKeys) ? userData.activeKeys : [])];
    const targetEntry = nextEntries[selectedEntry.index];
    if (targetEntry) {
      const remaining = (Number(targetEntry.amount) || 1) - p.cost;
      if (remaining > 0) {
        targetEntry.amount = remaining;
      } else {
        nextEntries.splice(selectedEntry.index, 1);
      }
      updateData.activeKeys = nextEntries;
    }
  } else if (canUseBalance && !canUseCode) {
    updateData[balanceField] = increment(-p.cost);
    updateData.keys = increment(-p.cost);
  }

  if (Object.keys(updateData).length) {
    await updateDoc(doc(db, 'users', currentUser.uid), updateData);
  }

  const date = new Date().toLocaleString();
  const keyCode = generateKeyCode(p.currency === 'proxy' ? 'PROXY' : 'APK');
  await addDoc(collection(db, 'users', currentUser.uid, 'inventory'), { name: p.name, icon: p.icon, image: p.image, currency: p.currency, code: keyCode, type:'product', date, createdAt: serverTimestamp() });
  await addDoc(collection(db, 'users', currentUser.uid, 'history'), { type:'product', desc:`Canjeado: ${p.name}`, value: p.cost, currency: p.currency, icon: p.icon, date, createdAt: serverTimestamp() });
  showCelebration('¡Clave generada!', `Tu canje quedó guardado y la clave es: ${keyCode}`, keyCode);
  toast(`Canjeaste: ${p.name}${matchingCode ? ' con código activo' : ''}`);
  await renderStore();
}

function openRedeemModal(productId){
  const product = products.find(x => x.id === productId);
  if (!product) return;
  const activeEntries = getUsableActiveKeyEntries(userData, product.currency === 'proxy' ? 'proxy' : 'apk');
  const modal = $('redeemModal');
  if (!modal) return;
  redemptionSelection.productId = productId;
  redemptionSelection.activeKeyIndex = null;
  $('redeemModalSubtitle').textContent = `${product.name} · ${product.currency === 'proxy' ? 'Proxy' : 'APK'}`;
  $('redeemProductName').textContent = product.name;
  const select = $('redeemKeySelect');
  select.innerHTML = activeEntries.length
    ? activeEntries.map((entry) => {
        const durationLabel = entry.durationDays ? getKeyDurationLabel(entry.durationDays) : 'Sin tiempo';
        return `<option value="${entry.index}">${(entry.amount || 1)} key${(entry.amount || 1) > 1 ? 's' : ''} · ${entry.type?.toUpperCase() || 'APK'} · ${durationLabel}</option>`;
      }).join('')
    : '<option value="">No tienes keys activas disponibles</option>';
  $('redeemHint').textContent = activeEntries.length
    ? 'Selecciona una key activa para validar el canje con los datos guardados en la base.'
    : 'No hay keys activas disponibles para este tipo. El canje se bloqueará hasta que tengas una.';
  modal.classList.remove('hidden');
}

function closeRedeemModal(){
  const modal = $('redeemModal');
  if (!modal) return;
  modal.classList.add('hidden');
  redemptionSelection.productId = null;
  redemptionSelection.activeKeyIndex = null;
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

  $('keySummaryToggle').addEventListener('click', () => {
    $('keySummaryBlock').classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    const keyCard = e.target.closest('[data-keycard]');
    const durationButton = e.target.closest('[data-duration]');
    const modalClose = e.target.closest('.modal-close');
    const modalBackdrop = e.target.closest('.modal-backdrop');
    const buyProdId = e.target.closest('[data-buyproduct]')?.getAttribute('data-buyproduct');
    const completeBtn = e.target.closest('#completeOrderBtn');
    const modalSubmit = e.target.closest('#modalSubmitBtn');
    const redeemSubmit = e.target.closest('#redeemSubmitBtn');
    const redeemModalClose = e.target.closest('#redeemModal .modal-close');
    const redeemModalBackdrop = e.target.closest('#redeemModal .modal-backdrop');

    if (keyCard) {
      const [sectionId, amount] = keyCard.getAttribute('data-keycard').split(':');
      openPurchaseModal(sectionId, Number(amount));
      return;
    }

    if (durationButton && e.target.closest('.modal-duration-grid')) {
      purchaseSelection.durationDays = Number(durationButton.getAttribute('data-duration'));
      const modal = $('purchaseModal');
      if (modal) {
        modal.querySelectorAll('.modal-duration-grid .duration-btn').forEach(btn => btn.classList.remove('active'));
        durationButton.classList.add('active');
      }
      return;
    }

    if (modalClose || modalBackdrop) {
      closePurchaseModal();
      return;
    }

    if (redeemModalClose) {
      closeRedeemModal();
      return;
    }

    if (modalSubmit) {
      buyKeyPackage();
      closePurchaseModal();
      return;
    }

    if (redeemSubmit) {
      if (redemptionSelection.productId) {
        buyProduct(redemptionSelection.productId, redemptionSelection.activeKeyIndex);
      }
      closeRedeemModal();
      return;
    }

    if (completeBtn) {
      buyKeyPackage();
      return;
    }

    if (buyProdId) {
      void (async () => {
        await refreshUserData();
        const p = products.find(x => x.id === buyProdId);
        if (!p) return;
        const activeEntries = getUsableActiveKeyEntries(userData, p.currency === 'proxy' ? 'proxy' : 'apk');
        const matchingCode = await findMatchingPromoCode(p);
        if (matchingCode) {
          await buyProduct(buyProdId);
          return;
        }
        if (activeEntries.length) {
          openRedeemModal(buyProdId);
          return;
        }
        await buyProduct(buyProdId);
      })();
    }
  });

  document.addEventListener('input', (e) => {
    if (e.target.id === 'clientNameModal') {
      purchaseSelection.client = e.target.value;
      validatePurchaseModal();
    }
    if (e.target.id === 'packageContentSelect') {
      purchaseSelection.packageContent = e.target.value;
      validatePurchaseModal();
    }
  });

  document.addEventListener('change', (e) => {
    if (e.target.id === 'packageNoteModal') {
      purchaseSelection.packageNote = e.target.value;
      validatePurchaseModal();
    }
    if (e.target.id === 'redeemKeySelect') {
      redemptionSelection.activeKeyIndex = e.target.value ? Number(e.target.value) : null;
    }
  });
}

function buildClaimView(code = ''){
  return `
  <div class="auth-wrap">
    <div class="auth-card">
      <div class="auth-logo">${iconBox('key',22)} Reclamar Keys</div>
      <p class="auth-sub">Tu enlace de reclamo te dará APK o Proxy directamente en tu cuenta de Julio Ventas.</p>
      <div class="field">
        <label>Código de reclamo</label>
        <div class="input-group">${svg('key',18)}<input id="claimCodeInput" value="${escapeHtml(code)}" placeholder="Código del enlace"></div>
      </div>
      <form id="claimAuthForm">
        <div class="field">
          <label>Correo electrónico</label>
          <div class="input-group">${svg('mail',18)}<input type="email" id="claimEmail" required autocomplete="email"></div>
        </div>
        <div class="field">
          <label>Contraseña</label>
          <div class="input-group">${svg('lock',18)}<input type="password" id="claimPassword" required autocomplete="current-password"></div>
        </div>
        <button type="submit" class="btn">${svg('check',18)} Reclamar ahora</button>
      </form>
      <div class="auth-msg" id="claimMsg"></div>
      <div class="auth-footer"><a href="/">Volver a la tienda</a></div>
    </div>
  </div>`;
}

async function claimLink(code, uid){
  const directRef = doc(db, 'claimLinks', code);
  let ref = directRef;
  let snap = await getDoc(directRef);
  let data = snap.exists() ? snap.data() : null;
  if (!data) {
    const q = query(collection(db, 'claimLinks'), where('code', '==', code));
    const qSnap = await getDocs(q);
    if (qSnap.empty) {
      throw new Error('El enlace ya no está activo.');
    }
    const matched = qSnap.docs[0];
    ref = doc(db, 'claimLinks', matched.id);
    data = matched.data();
  }
  const amount = Number(data.amount || 1);
  const currentType = String(data.type || 'apk').toLowerCase();
  const field = currentType === 'proxy' ? 'proxyKeys' : 'apkKeys';
  const durationDays = parseDurationDays(data.duration);
  const expiresAt = durationDays ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) : null;

  const result = await runTransaction(db, async (transaction) => {
    const claimSnapshot = await transaction.get(ref);
    const claimData = claimSnapshot.data();
    if (!claimSnapshot.exists() || claimData?.claimed) {
      throw new Error('Este enlace ya fue reclamado.');
    }
    const userRef = doc(db, 'users', uid);
    const userSnap = await transaction.get(userRef);
    const userDataCurrent = userSnap.exists() ? userSnap.data() : {};
    const currentActiveKeys = Array.isArray(userDataCurrent.activeKeys) ? userDataCurrent.activeKeys : [];
    const nextActiveKey = {
      type: currentType,
      amount,
      durationDays,
      expiresAt,
      source: 'claim-link'
    };
    const mergedActiveKeys = [...currentActiveKeys.filter(entry => entry?.type !== currentType), nextActiveKey];
    transaction.update(userRef, {
      [field]: increment(amount),
      keys: increment(amount),
      activeKeys: mergedActiveKeys
    });
    transaction.update(ref, {
      claimed: true,
      claimedBy: uid,
      claimedAt: serverTimestamp()
    });
    const historyRef = doc(collection(db, 'users', uid, 'history'));
    transaction.set(historyRef, {
      type: 'claim-link',
      desc: `Reclamo de keys: ${amount} ${currentType.toUpperCase()}`,
      value: amount,
      currency: currentType,
      date: new Date().toLocaleString(),
      createdAt: serverTimestamp()
    });
    return { amount, type: currentType };
  });

  return result;
}

function initClaimView(){
  $('app').innerHTML = buildClaimView(currentClaimCode);
  const form = $('claimAuthForm');
  const msg = $('claimMsg');
  const runClaim = async (uid) => {
    const code = $('claimCodeInput').value.trim();
    if (!code) {
      msg.className = 'auth-msg error';
      msg.innerHTML = svg('alert',16) + ' Ingresa el código del reclamo.';
      return;
    }
    try {
      msg.className = 'auth-msg';
      msg.innerHTML = '<span class="spinner"></span> Procesando reclamo...';
      const result = await claimLink(code, uid);
      msg.className = 'auth-msg ok';
      msg.innerHTML = svg('check',16) + ` ¡${result.amount} ${result.type.toUpperCase()} reclamadas correctamente!`;
    } catch (err) {
      msg.className = 'auth-msg error';
      msg.innerHTML = svg('alert',16) + ' ' + (err.message || 'No se pudo reclamar.');
    }
  };

  if (currentUser && currentClaimCode) {
    runClaim(currentUser.uid);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('claimEmail').value.trim();
    const password = $('claimPassword').value;
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await runClaim(cred.user.uid);
    } catch (err) {
      msg.className = 'auth-msg error';
      msg.innerHTML = svg('alert',16) + ' ' + (err.message || 'No se pudo iniciar sesión.');
    }
  });
}

// ---------------------------------------------------------------------
// ARRANQUE
// ---------------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  currentClaimCode = getClaimCodeFromLocation();
  if (currentClaimCode) {
    if (user) {
      initClaimView();
    } else {
      initClaimView();
    }
    return;
  }
  if (user) {
    initStoreView();
  } else {
    initAuthView();
  }
});

