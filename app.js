import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBVcWuR5ePnYhR_nVhxCIKNXbIss2Aa63U",
  authDomain: "consumo-gasoil-8c44f.firebaseapp.com",
  databaseURL: "https://consumo-gasoil-8c44f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "consumo-gasoil-8c44f",
  storageBucket: "consumo-gasoil-8c44f.firebasestorage.app",
  messagingSenderId: "461438225623",
  appId: "1:461438225623:web:e2080f81c9f9765c8a7492"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ===== Tabs =====
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

// ===== Fecha de hoy por defecto =====
const hoy = new Date().toISOString().slice(0, 10);
document.getElementById("carga-fecha").value = hoy;
document.getElementById("bit-fecha").value = hoy;

// ===== Cálculo automático de importe =====
const inputLitros = document.getElementById("carga-litros");
const inputPrecio = document.getElementById("carga-precio");
const inputImporte = document.getElementById("carga-importe");

function calcularImporte() {
  const litros = parseFloat(inputLitros.value) || 0;
  const precio = parseFloat(inputPrecio.value) || 0;
  inputImporte.value = (litros * precio).toFixed(2);
}

inputLitros.addEventListener("input", calcularImporte);
inputPrecio.addEventListener("input", calcularImporte);

// ===== Cargar y mostrar Cargas =====
const tablaCargas = document.getElementById("tabla-cargas");

onValue(ref(db, "cargas"), (snapshot) => {
  const data = snapshot.val() || {};
  const lista = Object.entries(data)
    .map(([id, c]) => ({ id, ...c }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  tablaCargas.innerHTML = lista.map(c => `
    <tr>
      <td>${formatearFecha(c.fecha)}</td>
      <td>${c.litros}</td>
      <td>${Number(c.precioLitro).toFixed(4)}</td>
      <td>${Number(c.importe).toFixed(2)}</td>
    </tr>
  `).join("");

  document.getElementById("cargas-count").textContent = lista.length;

  // Stats
  const totalLitros = lista.reduce((s, c) => s + Number(c.litros), 0);
  const totalGasto = lista.reduce((s, c) => s + Number(c.importe), 0);
  const precioMedio = totalLitros > 0 ? totalGasto / totalLitros : 0;

  document.getElementById("total-litros").textContent = totalLitros.toLocaleString("es-ES", { maximumFractionDigits: 0 });
  document.getElementById("total-gasto").textContent = totalGasto.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  document.getElementById("num-cargas").textContent = lista.length;
  document.getElementById("precio-medio").textContent = precioMedio.toFixed(3);
});

// ===== Cargar y mostrar Bitácora =====
const tablaBitacora = document.getElementById("tabla-bitacora");

onValue(ref(db, "bitacora"), (snapshot) => {
  const data = snapshot.val() || {};
  const lista = Object.entries(data)
    .map(([id, b]) => ({ id, ...b }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  tablaBitacora.innerHTML = lista.map(b => {
    const tipoClass = {
      "Encendido": "tipo-encendido",
      "Apagado": "tipo-apagado",
      "Mejora de instalación": "tipo-mejora",
      "Informativo": "tipo-informativo"
    }[b.tipo] || "";

    return `
      <tr>
        <td>${formatearFecha(b.fecha)}</td>
        <td class="${tipoClass}">${b.tipo}</td>
        <td>${b.cm ?? "—"}</td>
        <td>${b.litrosDeposito ?? "—"}</td>
        <td>${b.descripcion || "—"}</td>
      </tr>
    `;
  }).join("");

  document.getElementById("bitacora-count").textContent = lista.length;
});

// ===== Formulario Nueva Carga =====
document.getElementById("form-carga").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nueva = {
    fecha: document.getElementById("carga-fecha").value,
    litros: parseFloat(document.getElementById("carga-litros").value),
    precioLitro: parseFloat(document.getElementById("carga-precio").value),
    importe: parseFloat(document.getElementById("carga-importe").value)
  };

  const nuevaRef = push(ref(db, "cargas"));
  await set(nuevaRef, nueva);

  e.target.reset();
  document.getElementById("carga-fecha").value = hoy;
  inputImporte.value = "";
});

// ===== Formulario Nueva Bitácora =====
document.getElementById("form-bitacora").addEventListener("submit", async (e) => {
  e.preventDefault();

  const cm = document.getElementById("bit-cm").value;
  const litros = document.getElementById("bit-litros").value;
  const desc = document.getElementById("bit-desc").value;

  const nueva = {
    fecha: document.getElementById("bit-fecha").value,
    tipo: document.getElementById("bit-tipo").value,
    cm: cm ? parseFloat(cm) : null,
    litrosDeposito: litros ? parseFloat(litros) : null,
    descripcion: desc || null
  };

  const nuevaRef = push(ref(db, "bitacora"));
  await set(nuevaRef, nueva);

  e.target.reset();
  document.getElementById("bit-fecha").value = hoy;
});

// ===== Utilidades =====
function formatearFecha(fecha) {
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}