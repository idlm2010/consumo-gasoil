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

// Datos en memoria
let todasLasCargas = [];
let chartLitros = null;
let chartGasto = null;
let chartPrecio = null;

// ===== Tabs =====
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

// ===== Fecha de hoy =====
const hoy = new Date().toISOString().slice(0, 10);
document.getElementById("carga-fecha").value = hoy;
document.getElementById("bit-fecha").value = hoy;

// ===== Cálculo automático importe =====
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

// ===== Cargar Cargas =====
onValue(ref(db, "cargas"), (snapshot) => {
  const data = snapshot.val() || {};
  todasLasCargas = Object.entries(data)
    .map(([id, c]) => ({ id, ...c }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  actualizarFiltroAnos();
  renderCargas();
  actualizarStats();
  actualizarGraficos();
  actualizarTablaAnual();
});

// ===== Cargar Bitácora =====
onValue(ref(db, "bitacora"), (snapshot) => {
  const data = snapshot.val() || {};
  const lista = Object.entries(data)
    .map(([id, b]) => ({ id, ...b }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const tbody = document.getElementById("tabla-bitacora");
  tbody.innerHTML = lista.map(b => {
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

// ===== Filtro por año =====
document.getElementById("filtro-ano-cargas").addEventListener("change", renderCargas);

function actualizarFiltroAnos() {
  const select = document.getElementById("filtro-ano-cargas");
  const anos = [...new Set(todasLasCargas.map(c => c.fecha.slice(0, 4)))].sort((a, b) => b - a);
  const valorActual = select.value;

  select.innerHTML = `<option value="todos">Todos los años</option>` +
    anos.map(a => `<option value="${a}">${a}</option>`).join("");

  if ([...select.options].some(o => o.value === valorActual)) {
    select.value = valorActual;
  }
}

function renderCargas() {
  const filtro = document.getElementById("filtro-ano-cargas").value;
  const lista = filtro === "todos"
    ? todasLasCargas
    : todasLasCargas.filter(c => c.fecha.startsWith(filtro));

  document.getElementById("tabla-cargas").innerHTML = lista.map(c => `
    <tr>
      <td>${formatearFecha(c.fecha)}</td>
      <td>${c.litros}</td>
      <td>${Number(c.precioLitro).toFixed(4)}</td>
      <td>${Number(c.importe).toFixed(2)}</td>
    </tr>
  `).join("");

  document.getElementById("cargas-count").textContent = lista.length;
}

// ===== Stats globales =====
function actualizarStats() {
  const totalLitros = todasLasCargas.reduce((s, c) => s + Number(c.litros), 0);
  const totalGasto = todasLasCargas.reduce((s, c) => s + Number(c.importe), 0);
  const precioMedio = totalLitros > 0 ? totalGasto / totalLitros : 0;

  document.getElementById("total-litros").textContent = totalLitros.toLocaleString("es-ES", { maximumFractionDigits: 0 });
  document.getElementById("total-gasto").textContent = totalGasto.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  document.getElementById("num-cargas").textContent = todasLasCargas.length;
  document.getElementById("precio-medio").textContent = precioMedio.toFixed(3);
}

// ===== Agrupar por año =====
function agruparPorAno() {
  const mapa = {};
  todasLasCargas.forEach(c => {
    const ano = c.fecha.slice(0, 4);
    if (!mapa[ano]) {
      mapa[ano] = { litros: 0, gasto: 0, cargas: 0 };
    }
    mapa[ano].litros += Number(c.litros);
    mapa[ano].gasto += Number(c.importe);
    mapa[ano].cargas += 1;
  });
  return mapa;
}

// ===== Tabla resumen anual =====
function actualizarTablaAnual() {
  const porAno = agruparPorAno();
  const anos = Object.keys(porAno).sort((a, b) => b - a);

  document.getElementById("tabla-anual").innerHTML = anos.map(ano => {
    const d = porAno[ano];
    const medio = d.litros > 0 ? (d.gasto / d.litros).toFixed(3) : "—";
    return `
      <tr>
        <td><strong>${ano}</strong></td>
        <td>${d.cargas}</td>
        <td>${d.litros.toLocaleString("es-ES", { maximumFractionDigits: 0 })}</td>
        <td>${d.gasto.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</td>
        <td>${medio}</td>
      </tr>
    `;
  }).join("");
}

// ===== Gráficos =====
function actualizarGraficos() {
  if (todasLasCargas.length === 0) return;

  const porAno = agruparPorAno();
  const anos = Object.keys(porAno).sort();

  const litrosData = anos.map(a => porAno[a].litros);
  const gastoData = anos.map(a => Math.round(porAno[a].gasto * 100) / 100);

  const ordenadas = [...todasLasCargas].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const fechasPrecio = ordenadas.map(c => c.fecha);
  const precios = ordenadas.map(c => Number(c.precioLitro));

  const textColor = "#8b9bb4";
  const gridColor = "#2d3a4f";

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        ticks: { color: textColor, maxRotation: 45 },
        grid: { color: gridColor }
      },
      y: {
        ticks: { color: textColor },
        grid: { color: gridColor },
        beginAtZero: true
      }
    }
  };

  if (chartLitros) chartLitros.destroy();
  if (chartGasto) chartGasto.destroy();
  if (chartPrecio) chartPrecio.destroy();

  const ctxLitros = document.getElementById("chart-litros");
  if (ctxLitros) {
    chartLitros = new Chart(ctxLitros, {
      type: "bar",
      data: {
        labels: anos,
        datasets: [{
          data: litrosData,
          backgroundColor: "#3b82f6",
          borderRadius: 6
        }]
      },
      options: commonOptions
    });
  }

  const ctxGasto = document.getElementById("chart-gasto");
  if (ctxGasto) {
    chartGasto = new Chart(ctxGasto, {
      type: "bar",
      data: {
        labels: anos,
        datasets: [{
          data: gastoData,
          backgroundColor: "#22c55e",
          borderRadius: 6
        }]
      },
      options: commonOptions
    });
  }

  const ctxPrecio = document.getElementById("chart-precio");
  if (ctxPrecio) {
    chartPrecio = new Chart(ctxPrecio, {
      type: "line",
      data: {
        labels: fechasPrecio,
        datasets: [{
          data: precios,
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.15)",
          fill: true,
          tension: 0.3,
          pointRadius: 2,
          pointHoverRadius: 5
        }]
      },
      options: {
        ...commonOptions,
        scales: {
          x: {
            ticks: {
              color: textColor,
              maxTicksLimit: 10,
              callback: function(value) {
                const label = this.getLabelForValue(value);
                return label ? label.slice(0, 4) : "";
              }
            },
            grid: { color: gridColor }
          },
          y: {
            ticks: { color: textColor },
            grid: { color: gridColor },
            beginAtZero: false
          }
        }
      }
    });
  }
}

// ===== Formularios =====
document.getElementById("form-carga").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nueva = {
    fecha: document.getElementById("carga-fecha").value,
    litros: parseFloat(document.getElementById("carga-litros").value),
    precioLitro: parseFloat(document.getElementById("carga-precio").value),
    importe: parseFloat(document.getElementById("carga-importe").value)
  };
  await set(push(ref(db, "cargas")), nueva);
  e.target.reset();
  document.getElementById("carga-fecha").value = hoy;
  inputImporte.value = "";
});

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
  await set(push(ref(db, "bitacora")), nueva);
  e.target.reset();
  document.getElementById("bit-fecha").value = hoy;
});

// ===== Utilidades =====
function formatearFecha(fecha) {
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}
