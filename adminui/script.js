// @ts-nocheck
// ======================================================================
// JULIO VENTAS — adminui/script.js
// Panel exclusivo para administradores: gestión de Keys por usuario
// La estructura visual vive en index.html, los estilos en style.css.
// Este archivo SOLO contiene lógica: Firebase, eventos y el render de
// listas cuyo contenido depende de datos (usuarios, productos, enlaces,
// códigos), que por definición no pueden ser estáticos en el HTML.
// ======================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, updateDoc, setDoc, deleteDoc,
  collection, getDocs, addDoc
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

const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------------
// ICONOS SVG (solo se usan para construir filas/listas dinámicas;
// el resto de la interfaz ya trae sus íconos escritos en index.html)
// ---------------------------------------------------------------------
const ICONS = {
  key: `<path d="M15 7a4 4 0 1 1-5.65 5.65L4 18v3h3v-2h2v-2h2l1.35-1.35A4 4 0 0 1 15 7Z"/><circle cx="15.5" cy="7.5" r="1.4"/>`,
  mail: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>`,
  lock: `<rect x="4.5" y="10" width="15" height="10" rx="1.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>`,
  logout: `<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3"/>`,
  shield: `<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/><path d="m8.5 12 2.3 2.3L15.5 9.5"/>`,
  save: `<path d="M5 3h11l3 3v15H5Z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>`,
  search: `<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.4-4.4"/>`,
  plus: `<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>`,
  check: `<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>`,
  alert: `<path d="M12 3 2 21h20Z"/><path d="M12 10v4M12 17.2v.1"/>`,
  users: `<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.4 3-5 6.5-5s6.5 1.6 6.5 5"/><circle cx="17.5" cy="9" r="2.6"/><path d="M15 15.2c2.8.3 5 1.8 5 4.8"/>`,
  user: `<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/>`,
  cart: `<circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M2 3h2l2.4 12.2A2 2 0 0 0 8.4 17h8.2a2 2 0 0 0 2-1.6L21 7H6"/>`,
  wallet: `<path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3H5a2 2 0 0 1-2-2Z"/><path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-4a2 2 0 0 0 0 4h4"/>`,
  gem: `<path d="M12 21 4 9l4-6h8l4 6Z"/><path d="M4 9h16M9 3l3 6 3-6M8.5 9 12 21l3.5-12"/>`,
  menu: `<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>`,
  settings: `<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="M19.4 13.6a7.92 7.92 0 0 0 0-3.2l2.1-1.6a.5.5 0 0 0 .1-.6l-2-3.5a.5.5 0 0 0-.6-.2l-2.5 1a7.9 7.9 0 0 0-2.7-1.6L14 2.2a.5.5 0 0 0-.5-.4h-4a.5.5 0 0 0-.5.4l-.4 2.6a7.9 7.9 0 0 0-2.7 1.6l-2.5-1a.5.5 0 0 0-.6.2l-2 3.5a.5.5 0 0 0 .1.6l2.1 1.6a7.92 7.92 0 0 0 0 3.2L2.1 15.2a.5.5 0 0 0-.1.6l2 3.5a.5.5 0 0 0 .6.2l2.5-1a7.9 7.9 0 0 0 2.7 1.6l.4 2.6a.5.5 0 0 0 .5.4h4a.5.5 0 0 0 .5-.4l.4-2.6a7.9 7.9 0 0 0 2.7-1.6l2.5 1a.5.5 0 0 0 .6-.2l2-3.5a.5.5 0 0 0-.1-.6l-2.1-1.6z"/>`,
  ticket: `<path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z"/><path d="M9 7v10" stroke-dasharray="2 3"/>`,
  box: `<path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="m3 8 9 5 9-5M12 13v8"/>`,
  diamond: `<path d="M12 21 4 9l4-6h8l4 6Z"/><path d="M4 9h16M9 3l3 6 3-6M8.5 9 12 21l3.5-12"/>`
};
function svg(name, size = 22, cls = "") {
  const className = cls ? 'icon ' + cls : 'icon';
  return '<svg class="' + className + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
}
function iconBox(name, size = 18){ return '<span class="icon-box">' + svg(name, size) + '</span>'; }

function escapeHtml(str){
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ---------------------------------------------------------------------
// ESTADO
// ---------------------------------------------------------------------
let allUsers = [];
let claimLinks = [];
let promoCodes = [];
let productsList = [];

const claimDurationOptions = [
  { value: '1D', label: '1 D' },
  { value: '3D', label: '3 D' },
  { value: '15D', label: '15 D' },
  { value: '1MES', label: '1 MES' }
];

const proxyDurationOptions = [
  { value: '3D', label: '3 D' },
  { value: '7D', label: '7 D' },
  { value: '31D', label: '31 D' }
];

const clientOptions = ['CUBAN', 'HG', 'DRIP'];

function formatDurationForType(type, value){
  if (type === 'proxy') return proxyDurationOptions.find(opt => opt.value === value)?.label || value;
  return claimDurationOptions.find(opt => opt.value === value)?.label || value;
}

function toast(msg, isError=false){
  const t = $('toast');
  if(!t) return;
  t.innerHTML = svg(isError ? "alert" : "check", 18) + `<span>${msg}</span>`;
  t.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(()=> t.className = 'toast', 2500);
}

function friendlyError(code){
  const map = {
    "auth/invalid-email": "Correo electrónico inválido.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/too-many-requests": "Demasiados intentos. Intenta más tarde."
  };
  return map[code] || "Ocurrió un error. Intenta de nuevo.";
}

// ---------------------------------------------------------------------
// CONTROL DE VISTAS (mostrar/ocultar; el markup ya existe en index.html)
// ---------------------------------------------------------------------
function showView(name){
  ['loadingView', 'authView', 'deniedView', 'panelView'].forEach(id => {
    $(id).classList.toggle('hidden', id !== name);
  });
}

// ---------------------------------------------------------------------
// LOGIN ADMIN
// ---------------------------------------------------------------------
function initAuthForm(){
  $('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('email').value.trim();
    const password = $('password').value;
    const msg = $('authMsg');
    msg.className = 'auth-msg';
    msg.innerHTML = '<span class="spinner"></span> Verificando...';
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      msg.className = 'auth-msg error';
      msg.innerHTML = svg('alert',16) + ' ' + friendlyError(err.code);
    }
  });
}

// ---------------------------------------------------------------------
// ACCESO DENEGADO
// ---------------------------------------------------------------------
function initDeniedView(){
  $('backBtn').addEventListener('click', async () => { await signOut(auth); });
}

// ---------------------------------------------------------------------
// USUARIOS
// ---------------------------------------------------------------------
function renderTable(list){
  const tbody = $('usersTbody');
  if (list.length === 0){
    tbody.innerHTML = `<tr><td colspan="5" class="empty">Sin resultados</td></tr>`;
    return;
  }
  tbody.innerHTML = '';
  list.forEach(u => {
    const apkValue = u.apkKeys ?? u.keys ?? 0;
    const proxyValue = u.proxyKeys ?? 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(u.email || '(sin correo)')}</td>
      <td>${u.isAdmin
        ? `<span class="role-tag admin">${svg('shield',13)} Admin</span>`
        : `<span class="role-tag user">${svg('user',13)} Usuario</span>`}</td>
      <td>
        <div class="admin-balance-field">
          <div class="admin-balance-pill">Saldo actual: ${apkValue}</div>
          <button class="iconbtn gear-btn" data-edit-keys="${u.id}:apk" type="button" title="Ajustar rápido APK">${svg('settings',14)}<span>Ajustar</span></button>
        </div>
      </td>
      <td>
        <div class="admin-balance-field">
          <div class="admin-balance-pill">Saldo actual: ${proxyValue}</div>
          <button class="iconbtn gear-btn" data-edit-keys="${u.id}:proxy" type="button" title="Ajustar rápido Proxy">${svg('settings',14)}<span>Ajustar</span></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderStats(list){
  $('statUsers').textContent = list.length;
  $('statKeys').textContent = list.reduce((acc, u) => acc + ((u.apkKeys ?? u.keys ?? 0) + (u.proxyKeys ?? 0)), 0);
  $('statAdmins').textContent = list.filter(u => u.isAdmin).length;
}

async function loadUsers(){
  try {
    const snap = await getDocs(collection(db, 'users'));
    allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.email || '').localeCompare(b.email || ''));
    renderTable(allUsers);
    renderStats(allUsers);
  } catch (error) {
    console.error('No se pudieron cargar los usuarios:', error);
    allUsers = [];
    renderTable([]);
    renderStats([]);
    toast('No fue posible cargar los usuarios. Revisa los permisos de Firestore.', true);
  }
}

function populateDurationSelects(){
  const claimDurationSelect = $('claimDurationSelect');
  const codeDurationSelect = $('codeDurationSelect');
  const applyDurationOptions = (select, type) => {
    const options = type === 'proxy' ? proxyDurationOptions : claimDurationOptions;
    select.innerHTML = options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
  };
  applyDurationOptions(claimDurationSelect, $('claimTypeSelect').value);
  applyDurationOptions(codeDurationSelect, $('codeTypeSelect').value);
  $('codeClientSelect').innerHTML = clientOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('');
}

// ---------------------------------------------------------------------
// RECLAMAR URL
// ---------------------------------------------------------------------
function renderClaimLinks(){
  const list = $('claimLinksList');
  if (!claimLinks.length){
    list.innerHTML = '<div class="empty-card">No hay enlaces creados todavía.</div>';
    return;
  }
  list.innerHTML = claimLinks.map(link => `
    <div class="stack-item">
      <div>
        <div class="stack-title">${link.type.toUpperCase()} · ${formatDurationForType(link.type, link.duration)}</div>
        <div class="stack-sub">${link.amount} keys · ${escapeHtml(link.code)}</div>
      </div>
      <div class="stack-actions">
        <button data-copy-link="${link.id}">Copiar</button>
        <button data-edit-link="${link.id}">Editar</button>
        <button data-delete-link="${link.id}">Eliminar</button>
      </div>
    </div>
  `).join('');
}

async function loadClaimLinks(){
  const snap = await getDocs(collection(db, 'claimLinks'));
  claimLinks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderClaimLinks();
}

async function createClaimLink(){
  const type = $('claimTypeSelect').value;
  const duration = $('claimDurationSelect').value;
  const amount = Math.max(1, parseInt($('claimAmountInput').value, 10) || 1);
  const code = `claim-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const ref = doc(db, 'claimLinks', code);
  await setDoc(ref, { type, duration, amount, code, claimed: false, createdAt: new Date() });
  const baseUrl = 'https://juliojl.vercel.app';
  const claimUrl = `${baseUrl}/claim/?claim=${code}`;
  await navigator.clipboard.writeText(claimUrl);
  $('claimCreateMsg').className = 'auth-msg ok';
  $('claimCreateMsg').innerHTML = svg('check',16) + ' URL creada y copiada: ' + escapeHtml(claimUrl);
  await loadClaimLinks();
}

// ---------------------------------------------------------------------
// CÓDIGOS
// ---------------------------------------------------------------------
function renderCodes(){
  const list = $('codesList');
  if (!promoCodes.length){
    list.innerHTML = '<div class="empty-card">No hay códigos guardados todavía.</div>';
    return;
  }
  list.innerHTML = promoCodes.map(code => {
    const codeValues = Array.isArray(code.codes) ? code.codes.join(', ') : code.value || '';
    const label = Array.isArray(code.codes) && code.codes.length > 1
      ? `${code.codes.length} códigos · ${codeValues}`
      : codeValues;
    return `
    <div class="stack-item">
      <div>
        <div class="stack-title">${code.client} · ${code.type.toUpperCase()} · ${formatDurationForType(code.type, code.duration)}</div>
        <div class="stack-sub">${escapeHtml(label)} · ${code.amount} keys</div>
      </div>
      <div class="stack-actions">
        <button data-delete-code="${code.id}">Eliminar</button>
      </div>
    </div>
  `;
  }).join('');
  renderTable(allUsers);
  renderStats(allUsers);
}

async function loadCodes(){
  const snap = await getDocs(collection(db, 'promoCodes'));
  promoCodes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderCodes();
}

async function createPromoCode(){
  const client = $('codeClientSelect').value;
  const type = $('codeTypeSelect').value;
  const duration = $('codeDurationSelect').value;
  const amount = Math.max(1, parseInt($('codeAmountInput').value, 10) || 1);
  const codeInputs = Array.from(document.querySelectorAll('.code-value-input'));
  const codes = codeInputs.map(input => input.value.trim()).filter(Boolean);
  if (!codes.length) {
    $('codeCreateMsg').className = 'auth-msg error';
    $('codeCreateMsg').innerHTML = svg('alert',16) + ' Ingresa al menos un código.';
    return;
  }
  const ref = doc(collection(db, 'promoCodes'));
  await setDoc(ref, { client, type, duration, amount, codes, active: true, createdAt: new Date() });
  $('codeCreateMsg').className = 'auth-msg ok';
  $('codeCreateMsg').innerHTML = svg('check',16) + ' Código(s) guardado(s) correctamente.';
  await loadCodes();
}

function renderCodeValueFields(count = 1){
  const container = document.querySelector('.code-values-list');
  if (!container) return;
  const sanitizedCount = Math.max(1, Math.min(10, Number(count) || 1));
  container.innerHTML = Array.from({ length: sanitizedCount }).map((_, index) =>
    `<input type="text" class="code-value-input" placeholder="Ej: CUBAN-APK-${String(index + 1).padStart(2,'0')}" />`
  ).join('');
}

// ---------------------------------------------------------------------
// KEYS / BALANCES
// ---------------------------------------------------------------------
function getDurationDays(durationValue = ''){
  if (!durationValue) return 0;
  if (String(durationValue).toUpperCase() === '1MES') return 30;
  const match = String(durationValue).match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function buildActiveKeyEntry(type, amount, durationValue){
  const durationDays = getDurationDays(durationValue);
  return {
    type: String(type).toLowerCase(),
    amount: Math.max(0, parseInt(amount, 10) || 0),
    durationDays,
    expiresAt: durationDays ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) : null,
    source: 'admin-adjustment'
  };
}

function collectBatchEntries(uid, type){
  const list = document.querySelector(`[data-${type}-batch-list="${uid}"]`);
  if (!list) return [];
  return Array.from(list.querySelectorAll('.admin-batch-row')).map((row) => {
    const amountInput = row.querySelector(`[data-${type}-batch-amount="${uid}"]`);
    const durationSelect = row.querySelector(`[data-${type}-batch-duration="${uid}"]`);
    const amount = parseInt(amountInput?.value || '0', 10) || 0;
    const duration = durationSelect?.value || '';
    if (!amount || !duration) return null;
    return buildActiveKeyEntry(type, amount, duration);
  }).filter(Boolean);
}

async function applyQuickKeyAdjustment(uid, type, amount, durationValue){
  const amountNum = Math.max(0, parseInt(amount, 10) || 0);
  if (!amountNum || !durationValue) {
    return null;
  }

  const snap = await getDoc(doc(db, 'users', uid));
  const currentData = snap.data() || {};
  const currentApk = Number(currentData.apkKeys ?? 0);
  const currentProxy = Number(currentData.proxyKeys ?? 0);
  const nextActiveKeys = Array.isArray(currentData.activeKeys) ? [...currentData.activeKeys] : [];
  const entry = buildActiveKeyEntry(type, amountNum, durationValue);

  nextActiveKeys.push(entry);

  return {
    nextApk: type === 'apk' ? currentApk + amountNum : currentApk,
    nextProxy: type === 'proxy' ? currentProxy + amountNum : currentProxy,
    nextActiveKeys
  };
}

async function applyQuickKeyAdjustments(uid, type, adjustments){
  const validAdjustments = adjustments.filter(item => item.duration);
  const normalizedType = String(type || '').toLowerCase();

  try {
    const snap = await getDoc(doc(db, 'users', uid));
    const currentData = snap.data() || {};
    const currentActiveKeys = Array.isArray(currentData.activeKeys) ? [...currentData.activeKeys] : [];
    const otherEntries = currentActiveKeys.filter(entry => String(entry?.type || '').toLowerCase() !== normalizedType);

    const nextEntries = validAdjustments.reduce((acc, { amount, duration }) => {
      const amountNum = Math.max(0, parseInt(amount, 10) || 0);
      if (!amountNum || !duration) return acc;
      acc.push(buildActiveKeyEntry(type, amountNum, duration));
      return acc;
    }, []);

    const nextActiveKeys = [...otherEntries, ...nextEntries];
    const nextTypeTotal = nextEntries.reduce((sum, entry) => sum + Number(entry?.amount || 0), 0);
    const nextApk = normalizedType === 'apk' ? nextTypeTotal : Number(currentData.apkKeys ?? 0);
    const nextProxy = normalizedType === 'proxy' ? nextTypeTotal : Number(currentData.proxyKeys ?? 0);

    await updateDoc(doc(db, 'users', uid), {
      apkKeys: nextApk,
      proxyKeys: nextProxy,
      keys: nextApk + nextProxy,
      activeKeys: nextActiveKeys
    });
    toast('Cambios guardados correctamente');
    await loadUsers();
  } catch (error) {
    console.error('No se pudo aplicar el ajuste:', error);
    toast('No fue posible guardar los cambios. Revisa los permisos de Firestore.', true);
  }
}

// ---------------------------------------------------------------------
// PRODUCTOS
// ---------------------------------------------------------------------
async function loadProducts(){
  const snap = await getDocs(collection(db, 'products'));
  productsList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderProductsPanel();
}

function renderProductsPanel(){
  const list = $('productsPanelList');
  if (!list) return;
  if (!productsList.length) {
    list.innerHTML = '<div class="empty-card">No hay productos guardados.</div>';
    return;
  }
  list.innerHTML = productsList.map(p => `
    <div class="stack-item">
      <div style="display:flex; gap:12px; align-items:center;">
        <div style="width:64px; height:48px; overflow:hidden; border-radius:8px; background:rgba(0,0,0,.06); display:flex; align-items:center; justify-content:center;">
          ${p.image ? `<img src="${escapeHtml(p.image)}" style="width:100%; height:100%; object-fit:cover;">` : svg(p.icon || 'box',28)}
        </div>
        <div>
          <div class="stack-title">${escapeHtml(p.name)} · ${p.currency?.toUpperCase() || ''} · ${p.cost || 0}</div>
          <div class="stack-sub">Tier: ${escapeHtml(p.tier || '')} · ID: ${escapeHtml(p.id)}</div>
        </div>
      </div>
      <div class="stack-actions">
        <button data-edit-product="${p.id}">Editar</button>
        <button data-delete-product="${p.id}">Eliminar</button>
      </div>
    </div>
  `).join('');
}

async function createProduct(){
  const btn = $('createProductBtn');
  const editingId = btn?.dataset?.editing || null;
  const name = String($('productNameInput').value || '').trim();
  const image = String($('productImageInput').value || '').trim();
  const cost = Number($('productCostInput').value || 0);
  const currency = String($('productCurrencySelect').value || 'apk');
  const tier = String($('productTierInput').value || '').trim();
  const icon = String($('productIconInput').value || '').trim();
  if (!name) {
    $('productCreateMsg').className = 'auth-msg error';
    $('productCreateMsg').textContent = 'Nombre requerido.';
    return;
  }
  const payload = { name, image, cost, currency, tier, icon, updatedAt: new Date() };
  if (editingId){
    await updateProduct(editingId, payload);
    btn.innerHTML = svg('plus',16) + ' Crear producto';
    delete btn.dataset.editing;
    $('productCreateMsg').className = 'auth-msg ok';
    $('productCreateMsg').textContent = 'Producto actualizado.';
  } else {
    await addDoc(collection(db, 'products'), { ...payload, createdAt: new Date() });
    $('productCreateMsg').className = 'auth-msg ok';
    $('productCreateMsg').textContent = 'Producto creado.';
  }
  $('productNameInput').value = '';
  $('productImageInput').value = '';
  $('productCostInput').value = '1';
  $('productTierInput').value = '';
  $('productIconInput').value = '';
  await loadProducts();
}

async function updateProduct(id, data){
  await updateDoc(doc(db, 'products', id), data);
  await loadProducts();
}

async function deleteProduct(id){
  if (!confirm('Eliminar producto?')) return;
  await deleteDoc(doc(db, 'products', id));
  await loadProducts();
}

async function importProductsFromJson(){
  const input = $('productJsonInput');
  const msg = $('productImportMsg');
  if (!input || !msg) return;
  const raw = String(input.value || '').trim();
  if (!raw) {
    msg.className = 'auth-msg error';
    msg.textContent = 'Pega un JSON antes de importar.';
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [parsed];
    if (!list.length) {
      msg.className = 'auth-msg error';
      msg.textContent = 'El JSON no contiene productos.';
      return;
    }

    const validProducts = list.filter(item => item && typeof item === 'object' && item.name);
    if (!validProducts.length) {
      msg.className = 'auth-msg error';
      msg.textContent = 'No se encontraron productos válidos.';
      return;
    }

    msg.className = 'auth-msg';
    msg.innerHTML = '<span class="spinner"></span> Importando productos...';

    const batch = [];
    validProducts.forEach((item) => {
      const payload = {
        name: String(item.name || '').trim(),
        image: String(item.image || '').trim(),
        cost: Number(item.cost || 0),
        currency: String(item.currency || 'apk').toLowerCase(),
        tier: String(item.tier || '').trim(),
        icon: String(item.icon || '').trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      batch.push(addDoc(collection(db, 'products'), payload));
    });

    await Promise.all(batch);
    input.value = '';
    msg.className = 'auth-msg ok';
    msg.textContent = `${validProducts.length} producto(s) importado(s) correctamente.`;
    await loadProducts();
  } catch (error) {
    console.error('No se pudieron importar los productos:', error);
    msg.className = 'auth-msg error';
    msg.textContent = 'El JSON no es válido o falló la importación.';
  }
}

// ---------------------------------------------------------------------
// MODAL: EDITAR KEYS
// ---------------------------------------------------------------------
function fillEditKeyDurationOptions(type, activeEntries = []){
  const options = type === 'proxy' ? proxyDurationOptions : claimDurationOptions;
  const container = $('editKeyDurationFields');
  if (!container) return;
  const normalizedType = String(type || '').toLowerCase();
  const existingAmounts = options.reduce((acc, opt) => {
    const durationDays = getDurationDays(opt.value);
    const totalForDuration = (activeEntries || []).reduce((sum, entry) => {
      const entryType = String(entry?.type || '').toLowerCase();
      const entryDurationDays = Number(entry?.durationDays || 0);
      if (entryType === normalizedType && entryDurationDays === durationDays) {
        return sum + Number(entry?.amount || 0);
      }
      return sum;
    }, 0);
    acc[opt.value] = totalForDuration;
    return acc;
  }, {});
  container.innerHTML = options.map(opt => `
    <div class="duration-row">
      <label class="duration-label">${escapeHtml(opt.label)}</label>
      <input type="number" min="0" value="${existingAmounts[opt.value] || 0}" data-edit-duration-value="${opt.value}" placeholder="0">
    </div>
  `).join('');
}

function openEditKeyModal(uid, type){
  const modal = $('editKeyModal');
  const editUserEl = $('editKeyUser');
  const editTypeEl = $('editKeyType');
  if (!modal || !editUserEl || !editTypeEl) {
    toast('No se pudo abrir el modal de ajustes.', true);
    return;
  }
  const user = allUsers.find(u => u.id === uid) || {};
  const activeEntries = Array.isArray(user.activeKeys) ? user.activeKeys : [];
  modal.dataset.userId = uid;
  modal.dataset.keyType = type;
  editUserEl.textContent = user.email || '(usuario)';
  editTypeEl.textContent = type.toUpperCase();
  fillEditKeyDurationOptions(type, activeEntries);
  modal.classList.remove('hidden');
}

function closeEditKeyModal(){
  const modal = $('editKeyModal');
  if (!modal) return;
  modal.classList.add('hidden');
}

// ---------------------------------------------------------------------
// PANEL: EVENTOS (se registran una sola vez, el HTML ya existe siempre)
// ---------------------------------------------------------------------
function wirePanelEvents(){
  $('createClaimBtn').addEventListener('click', createClaimLink);
  $('createCodeBtn').addEventListener('click', createPromoCode);
  $('createProductBtn').addEventListener('click', createProduct);
  $('importProductsBtn').addEventListener('click', importProductsFromJson);
  $('claimTypeSelect').addEventListener('change', () => populateDurationSelects());
  $('codeTypeSelect').addEventListener('change', () => populateDurationSelects());
  $('codeAmountInput').addEventListener('input', () => renderCodeValueFields(Number($('codeAmountInput').value) || 1));

  $('menuToggle').addEventListener('click', () => {
    $('adminNav').classList.toggle('hidden');
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 900) {
      $('adminNav').classList.remove('hidden');
    } else {
      $('adminNav').classList.add('hidden');
    }
  });

  document.querySelectorAll('.admin-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-nav-btn').forEach(item => item.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
      const target = btn.dataset.section;
      if (target === 'claims') $('claimsSection').classList.add('active');
      if (target === 'codes') $('codesSection').classList.add('active');
      if (target === 'users') $('usersSection').classList.add('active');
      if (target === 'products') $('productsSection').classList.add('active');
      $('adminNav').classList.add('hidden');
    });
  });

  document.addEventListener('click', async (e) => {
    const editKeysTarget = e.target.closest('[data-edit-keys]')?.getAttribute('data-edit-keys');
    const saveKeyModal = e.target.closest('#saveKeyModalBtn');
    const editKeyModalClose = e.target.closest('#editKeyModal .modal-close');
    const editKeyModalBackdrop = e.target.closest('#editKeyModal .modal-backdrop');
    const copyLinkId = e.target.closest('[data-copy-link]')?.getAttribute('data-copy-link');
    const editLinkId = e.target.closest('[data-edit-link]')?.getAttribute('data-edit-link');
    const deleteLinkId = e.target.closest('[data-delete-link]')?.getAttribute('data-delete-link');
    const deleteCodeId = e.target.closest('[data-delete-code]')?.getAttribute('data-delete-code');
    const editProductId = e.target.closest('[data-edit-product]')?.getAttribute('data-edit-product');
    const deleteProductId = e.target.closest('[data-delete-product]')?.getAttribute('data-delete-product');

    if (editKeysTarget){
      const [uid, type] = editKeysTarget.split(':');
      openEditKeyModal(uid, type);
      return;
    }
    if (editKeyModalClose || editKeyModalBackdrop){
      closeEditKeyModal();
      return;
    }
    if (saveKeyModal){
      const modal = $('editKeyModal');
      const uid = modal?.dataset?.userId;
      const type = modal?.dataset?.keyType;
      const adjustments = Array.from(document.querySelectorAll('#editKeyDurationFields .duration-row'))
        .map((row) => ({
          amount: row.querySelector('input')?.value || '0',
          duration: row.querySelector('input')?.dataset?.editDurationValue || ''
        }))
        .filter(item => item.duration);
      if (uid && type) {
        await applyQuickKeyAdjustments(uid, type, adjustments);
        closeEditKeyModal();
      }
      return;
    }
    if (copyLinkId){
      const link = claimLinks.find(item => item.id === copyLinkId);
      if (link) {
        const url = `https://juliojl.vercel.app/claim/?claim=${link.code}`;
        await navigator.clipboard.writeText(url);
        toast('URL copiada al portapapeles');
      }
    }
    if (deleteLinkId){
      const link = claimLinks.find(item => item.id === deleteLinkId);
      if (link && confirm(`¿Eliminar el enlace ${link.code}?`)) {
        await deleteDoc(doc(db, 'claimLinks', link.id));
        await loadClaimLinks();
      }
    }
    if (deleteCodeId){
      const code = promoCodes.find(item => item.id === deleteCodeId);
      if (code && confirm(`¿Eliminar el código ${code.value}?`)) {
        await deleteDoc(doc(db, 'promoCodes', code.id));
        await loadCodes();
      }
    }
    if (deleteProductId){
      await deleteProduct(deleteProductId);
      return;
    }
    if (editProductId){
      const p = productsList.find(x => x.id === editProductId);
      if (p){
        $('productNameInput').value = p.name || '';
        $('productImageInput').value = p.image || '';
        $('productCostInput').value = p.cost || 1;
        $('productCurrencySelect').value = p.currency || 'apk';
        $('productTierInput').value = p.tier || '';
        $('productIconInput').value = p.icon || '';
        const btn = $('createProductBtn');
        btn.textContent = 'Guardar cambios';
        btn.dataset.editing = editProductId;
        $('productCreateMsg').className = 'auth-msg';
        $('productCreateMsg').textContent = 'Editando producto...';
      }
      return;
    }
    if (editLinkId){
      const link = claimLinks.find(item => item.id === editLinkId);
      if (link) {
        $('claimTypeSelect').value = link.type;
        $('claimDurationSelect').value = link.duration;
        $('claimAmountInput').value = link.amount;
        $('claimCreateMsg').className = 'auth-msg';
        $('claimCreateMsg').innerHTML = svg('key',16) + ' Editando enlace: ' + escapeHtml(link.code);
      }
    }
  });

  $('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    renderTable(allUsers.filter(u => (u.email || '').toLowerCase().includes(term)));
  });

  $('logoutBtn').addEventListener('click', async () => { await signOut(auth); });
}

// ---------------------------------------------------------------------
// ARRANQUE
// ---------------------------------------------------------------------
initAuthForm();
initDeniedView();
wirePanelEvents();

onAuthStateChanged(auth, async (user) => {
  if (!user){
    showView('authView');
    return;
  }
  const snap = await getDoc(doc(db, 'users', user.uid));
  const data = snap.data();
  if (!data?.isAdmin){
    showView('deniedView');
    return;
  }

  $('adminEmail').textContent = user.email;
  showView('panelView');
  populateDurationSelects();
  renderCodeValueFields(Number($('codeAmountInput').value) || 1);
  if (window.innerWidth < 900) $('adminNav').classList.add('hidden');
  else $('adminNav').classList.remove('hidden');

  loadUsers();
  loadProducts();
  loadClaimLinks();
  loadCodes();
});
