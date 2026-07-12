// ======================================================================
// JULIO VENTAS — adminui/script.js
// Panel exclusivo para administradores: gestión de Keys por usuario
// ======================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, updateDoc,
  collection, getDocs
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
  gem: `<path d="M12 21 4 9l4-6h8l4 6Z"/><path d="M4 9h16M9 3l3 6 3-6M8.5 9 12 21l3.5-12"/>`
};
function svg(name, size = 22, cls = "") {
  return `<svg class="icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
}
function iconBox(name, size = 18){ return `<span class="icon-box">${svg(name, size)}</span>`; }

const $ = (id) => document.getElementById(id);
let allUsers = [];
let claimLinks = [];
let promoCodes = [];

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
// VISTA: LOGIN ADMIN
// ---------------------------------------------------------------------
function buildLoginView(){
  return `
  <div class="auth-wrap" id="authView">
    <div class="auth-card">
      <div class="auth-logo">${iconBox('shield',22)} Julio Ventas · Admin</div>
      <p class="auth-sub">Acceso exclusivo para administradores de la tienda.</p>
      <form id="adminLoginForm">
        <div class="field">
          <label>Correo electrónico</label>
          <div class="input-group">${svg('mail',18)}<input type="email" id="email" required autocomplete="email"></div>
        </div>
        <div class="field">
          <label>Contraseña</label>
          <div class="input-group">${svg('lock',18)}<input type="password" id="password" required autocomplete="current-password"></div>
        </div>
        <button type="submit" class="btn">${svg('check',18)} Ingresar al panel</button>
        <div class="auth-msg" id="authMsg"></div>
      </form>
      <div class="auth-footer"><a href="../index.html">Volver a la tienda</a></div>
    </div>
  </div>`;
}

function initLoginView(){
  $('app').innerHTML = buildLoginView();
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
// VISTA: ACCESO DENEGADO
// ---------------------------------------------------------------------
function initDeniedView(){
  $('app').innerHTML = `
  <div class="access-denied">
    <div class="icon-box">${svg('alert',30)}</div>
    <h2>Acceso denegado</h2>
    <p>Tu cuenta no tiene permisos de administrador.</p>
    <button class="btn" style="max-width:220px; margin:18px auto 0;" id="backBtn">${svg('logout',16)} Cerrar sesión</button>
  </div>`;
  $('backBtn').addEventListener('click', async () => { await signOut(auth); });
}

// ---------------------------------------------------------------------
// VISTA: PANEL
// ---------------------------------------------------------------------
function buildPanelView(){
  return `
  <header>
    <div class="brand">${iconBox('shield',20)} Julio <span class="accent-word">Ventas</span> · Admin</div>
    <div class="header-right">
      <span class="user-tag" id="adminEmail"></span>
      <a href="../index.html" class="iconbtn">${svg('cart',16)} Ir a la tienda</a>
      <button class="iconbtn" id="logoutBtn">${svg('logout',16)} Salir</button>
    </div>
  </header>
  <main>
    <div class="section-head">
      <h2>${iconBox('users',18)} Gestión de APK y Proxy</h2>
      <p class="subtext">Busca un usuario por correo y ajusta manualmente sus balances de APK y Proxy.</p>
    </div>

    <div class="stats-row">
      <div class="stat-card"><div class="icon-wrap">${svg('users',22)}</div><div><div class="num" id="statUsers">0</div><div class="lbl">Usuarios registrados</div></div></div>
      <div class="stat-card"><div class="icon-wrap">${svg('wallet',22)}</div><div><div class="num" id="statKeys">0</div><div class="lbl">Keys en circulación</div></div></div>
      <div class="stat-card"><div class="icon-wrap">${svg('shield',22)}</div><div><div class="num" id="statAdmins">0</div><div class="lbl">Administradores</div></div></div>
    </div>

    <div class="search-bar">
      ${svg('search',18)}
      <input type="text" id="searchInput" placeholder="Buscar por correo...">
    </div>

    <table class="admin-table">
      <thead>
        <tr><th>Correo</th><th>Rol</th><th>APK</th><th>Proxy</th><th>Acciones</th></tr>
      </thead>
      <tbody id="usersTbody">
        <tr><td colspan="5" class="empty">Cargando usuarios...</td></tr>
      </tbody>
    </table>

    <div class="section-head" style="margin-top:34px;">
      <h2>${iconBox('key',18)} Reclamar URL</h2>
      <p class="subtext">Crea enlaces para entregar APK o Proxy a un usuario y que lo reclame desde la web.</p>
    </div>

    <div class="panel-card">
      <div class="panel-card-head">
        <h3>Nuevo enlace de reclamo</h3>
      </div>
      <div class="grid-two">
        <label class="field-inline">
          <span>Tipo</span>
          <select id="claimTypeSelect">
            <option value="apk">APK</option>
            <option value="proxy">Proxy</option>
          </select>
        </label>
        <label class="field-inline">
          <span>Duración</span>
          <select id="claimDurationSelect"></select>
        </label>
      </div>
      <label class="field-inline full">
        <span>Cantidad de keys</span>
        <input type="number" id="claimAmountInput" min="1" value="1">
      </label>
      <button id="createClaimBtn" class="btn">${svg('plus',16)} Crear URL</button>
      <div class="auth-msg" id="claimCreateMsg"></div>
    </div>

    <div class="panel-card" style="margin-top:18px;">
      <div class="panel-card-head">
        <h3>Enlaces existentes</h3>
      </div>
      <div id="claimLinksList" class="stack-list"></div>
    </div>

    <div class="section-head" style="margin-top:34px;">
      <h2>${iconBox('ticket',18)} Códigos</h2>
      <p class="subtext">Gestiona códigos para clientes CUBAN, HG y DRIP con duración cerrada y tipo APK/Proxy.</p>
    </div>

    <div class="panel-card">
      <div class="panel-card-head">
        <h3>Agregar código</h3>
      </div>
      <div class="grid-two">
        <label class="field-inline">
          <span>Cliente</span>
          <select id="codeClientSelect"></select>
        </label>
        <label class="field-inline">
          <span>Tipo</span>
          <select id="codeTypeSelect">
            <option value="apk">APK</option>
            <option value="proxy">Proxy</option>
          </select>
        </label>
      </div>
      <div class="grid-two">
        <label class="field-inline">
          <span>Duración</span>
          <select id="codeDurationSelect"></select>
        </label>
        <label class="field-inline">
          <span>Keys</span>
          <input type="number" id="codeAmountInput" min="1" value="1">
        </label>
      </div>
      <label class="field-inline full">
        <span>Código</span>
        <input type="text" id="codeValueInput" placeholder="Ej: CUBAN-APK-01">
      </label>
      <button id="createCodeBtn" class="btn">${svg('plus',16)} Guardar código</button>
      <div class="auth-msg" id="codeCreateMsg"></div>
    </div>

    <div class="panel-card" style="margin-top:18px;">
      <div class="panel-card-head">
        <h3>Códigos guardados</h3>
      </div>
      <div id="codesList" class="stack-list"></div>
    </div>
  </main>
  <div class="toast" id="toast"></div>
  `;
}

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
      <td>${u.email || '(sin correo)'}</td>
      <td>${u.isAdmin
        ? `<span class="role-tag admin">${svg('shield',13)} Admin</span>`
        : `<span class="role-tag user">${svg('user',13)} Usuario</span>`}</td>
      <td><input type="number" min="0" value="${apkValue}" data-apk-input="${u.id}"></td>
      <td><input type="number" min="0" value="${proxyValue}" data-proxy-input="${u.id}"></td>
      <td class="row-actions">
        <button data-save="${u.id}">${svg('save',14)} Guardar</button>
        <button data-add-apk="${u.id}">${svg('plus',14)} +50 APK</button>
        <button data-add-proxy="${u.id}">${svg('plus',14)} +50 Proxy</button>
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

function populateDurationSelects(){
  const claimDurationSelect = $('claimDurationSelect');
  const codeDurationSelect = $('codeDurationSelect');
  claimDurationSelect.innerHTML = claimDurationOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
  codeDurationSelect.innerHTML = claimDurationOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
  $('codeClientSelect').innerHTML = clientOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('');
}

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
        <div class="stack-sub">${link.amount} keys · ${link.code}</div>
      </div>
      <div class="stack-actions">
        <button data-copy-link="${link.id}">Copiar</button>
        <button data-edit-link="${link.id}">Editar</button>
      </div>
    </div>
  `).join('');
}

function renderCodes(){
  const list = $('codesList');
  if (!promoCodes.length){
    list.innerHTML = '<div class="empty-card">No hay códigos guardados todavía.</div>';
    return;
  }
  list.innerHTML = promoCodes.map(code => `
    <div class="stack-item">
      <div>
        <div class="stack-title">${code.client} · ${code.type.toUpperCase()} · ${formatDurationForType(code.type, code.duration)}</div>
        <div class="stack-sub">${code.value} · ${code.amount} keys</div>
      </div>
    </div>
  `).join('');
}

async function loadUsers(){
  const snap = await getDocs(collection(db, 'users'));
  allUsers = [];
  snap.forEach(d => allUsers.push({ id: d.id, ...d.data() }));
  renderTable(allUsers);
  renderStats(allUsers);
}

async function saveKeys(uid, apkValue, proxyValue){
  const apkNum = Math.max(0, parseInt(apkValue, 10) || 0);
  const proxyNum = Math.max(0, parseInt(proxyValue, 10) || 0);
  await updateDoc(doc(db, 'users', uid), { apkKeys: apkNum, proxyKeys: proxyNum, keys: apkNum + proxyNum });
  toast('Balances actualizados correctamente');
  await loadUsers();
}

async function loadClaimLinks(){
  const snap = await getDocs(collection(db, 'claimLinks'));
  claimLinks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderClaimLinks();
}

async function loadCodes(){
  const snap = await getDocs(collection(db, 'promoCodes'));
  promoCodes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderCodes();
}

async function createClaimLink(){
  const type = $('claimTypeSelect').value;
  const duration = $('claimDurationSelect').value;
  const amount = Math.max(1, parseInt($('claimAmountInput').value, 10) || 1);
  const code = `claim-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const ref = doc(collection(db, 'claimLinks'));
  await setDoc(ref, { type, duration, amount, code, claimed: false, createdAt: new Date() });
  const baseUrl = 'https://juliojl.vercel.app';
  const claimUrl = `${baseUrl}/claim/${code}`;
  await navigator.clipboard.writeText(claimUrl);
  $('claimCreateMsg').className = 'auth-msg ok';
  $('claimCreateMsg').innerHTML = svg('check',16) + ' URL creada y copiada: ' + claimUrl;
  await loadClaimLinks();
}

async function createPromoCode(){
  const client = $('codeClientSelect').value;
  const type = $('codeTypeSelect').value;
  const duration = $('codeDurationSelect').value;
  const amount = Math.max(1, parseInt($('codeAmountInput').value, 10) || 1);
  const value = $('codeValueInput').value.trim();
  if (!value) {
    $('codeCreateMsg').className = 'auth-msg error';
    $('codeCreateMsg').innerHTML = svg('alert',16) + ' Ingresa un código.';
    return;
  }
  const ref = doc(collection(db, 'promoCodes'));
  await setDoc(ref, { client, type, duration, amount, value, active: true, createdAt: new Date() });
  $('codeCreateMsg').className = 'auth-msg ok';
  $('codeCreateMsg').innerHTML = svg('check',16) + ' Código guardado correctamente.';
  await loadCodes();
}

function initPanelView(user){
  $('app').innerHTML = buildPanelView();
  $('adminEmail').textContent = user.email;
  populateDurationSelects();
  loadUsers();
  loadClaimLinks();
  loadCodes();

  $('createClaimBtn').addEventListener('click', createClaimLink);
  $('createCodeBtn').addEventListener('click', createPromoCode);

  document.addEventListener('click', async (e) => {
    const saveId = e.target.closest('[data-save]')?.getAttribute('data-save');
    const addApkId = e.target.closest('[data-add-apk]')?.getAttribute('data-add-apk');
    const addProxyId = e.target.closest('[data-add-proxy]')?.getAttribute('data-add-proxy');
    const copyLinkId = e.target.closest('[data-copy-link]')?.getAttribute('data-copy-link');
    const editLinkId = e.target.closest('[data-edit-link]')?.getAttribute('data-edit-link');
    if (saveId){
      const apkInput = document.querySelector(`[data-apk-input="${saveId}"]`);
      const proxyInput = document.querySelector(`[data-proxy-input="${saveId}"]`);
      await saveKeys(saveId, apkInput.value, proxyInput.value);
    }
    if (addApkId){
      const apkInput = document.querySelector(`[data-apk-input="${addApkId}"]`);
      const proxyInput = document.querySelector(`[data-proxy-input="${addApkId}"]`);
      const newVal = (parseInt(apkInput.value, 10) || 0) + 50;
      apkInput.value = newVal;
      await saveKeys(addApkId, newVal, proxyInput.value);
    }
    if (addProxyId){
      const apkInput = document.querySelector(`[data-apk-input="${addProxyId}"]`);
      const proxyInput = document.querySelector(`[data-proxy-input="${addProxyId}"]`);
      const newVal = (parseInt(proxyInput.value, 10) || 0) + 50;
      proxyInput.value = newVal;
      await saveKeys(addProxyId, apkInput.value, newVal);
    }
    if (copyLinkId){
      const link = claimLinks.find(item => item.id === copyLinkId);
      if (link) {
        const url = `https://juliojl.vercel.app/claim/${link.code}`;
        await navigator.clipboard.writeText(url);
        toast('URL copiada al portapapeles');
      }
    }
    if (editLinkId){
      const link = claimLinks.find(item => item.id === editLinkId);
      if (link) {
        $('claimTypeSelect').value = link.type;
        $('claimDurationSelect').value = link.duration;
        $('claimAmountInput').value = link.amount;
        $('claimCreateMsg').className = 'auth-msg';
        $('claimCreateMsg').innerHTML = svg('key',16) + ' Editando enlace: ' + link.code;
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
onAuthStateChanged(auth, async (user) => {
  if (!user){
    initLoginView();
    return;
  }
  const snap = await getDoc(doc(db, 'users', user.uid));
  const data = snap.data();
  if (!data?.isAdmin){
    initDeniedView();
    return;
  }
  initPanelView(user);
});
