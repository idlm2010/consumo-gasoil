import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, onValue, push, set, remove, update } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

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

let todasLasCargas = [];
let todaLaBitacora = [];
let todosLosMantenimientos = [];
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

// ===== Fecha hoy =====
const hoy = new Date().toISOString().slice(0, 10);
document.getElementById("carga-fecha").value = hoy;
document.getElementById("bit-fecha").value = hoy;
document.getElementById("mant-fecha").value = hoy;

// ===== Cálculo importe =====
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
  actualizarComparativa();
  calcularTemporadas();
});

// ===== Cargar Bitácora =====
onValue(ref(db, "bitacora"), (snapshot) => {
  const data = snapshot.val() || {};
  todaLaBitacora = Object.entries(data)
    .map(([id, b]) => ({ id, ...b }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  renderBitacora();
  actualizarNivelDeposito();
  calcularTemporadas();
});

// ===== Cargar Mantenimientos =====
onValue(ref(db, "mantenimientos"), (snapshot) => {
  const data = snapshot.val() || {};
  todosLosMantenimientos = Object.entries(data)
    .map(([id, m]) => ({ id, ...m }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  renderMantenimientos();
  actualizarStats();
});

// ===== Render Bitácora =====
function renderBitacora() {
  const tbody = document.getElementById("tabla-bitacora");
  tbody.innerHTML = todaLaBitacora.map(b => {
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
        <td>
          <button class="btn-icon" onclick="editarBitacora('${b.id}')">✏️</button>
          <button class="btn-icon danger" onclick="borrarBitacora('${b.id}')">🗑️</button>
        </td>
      </tr>
    `;
  }).join("");

  document.getElementById("bitacora-count").textContent = todaLaBitacora.length;
}

// ===== Render Mantenimientos =====
function renderMantenimientos() {
  const tbody = document.getElementById("tabla-mantenimientos");
  tbody.innerHTML = todosLosMantenimientos.map(m => `
    <tr>
      <td>${formatearFecha(m.fecha)}</td>
      <td>${Number(m.importe).toFixed(2)}</td>
      <td style="white-space: normal; max-width: 320px;">${m.descripcion || "—"}</td>
      <td>
        <button class="btn-icon" onclick="editarMantenimiento('${m.id}')">✏️</button>
        <button class="btn-icon danger" onclick="borrarMantenimiento('${m.id}')">🗑️</button>
      </td>
    </tr>
  `).join("");

  document.getElementById("mant-count").textContent = todosLosMantenimientos.length;
}

// ===== Filtro año =====
document.getElementById("filtro-ano-cargas").addEventListener("change", renderCargas);

function actualizarFiltroAnos() {
  const select = document.getElementById("filtro-ano-cargas");
  const anos = [...new Set(todasLasCargas.map(c => c.fecha.slice(0, 4)))].sort((a, b) => b - a);
  const valorActual = select.value;
  select.innerHTML = `<option value="todos">Todos los años</option>` +
    anos.map(a => `<option value="${a}">${a}</option>`).join("");
  if ([...select.options].some(o => o.value === valorActual)) select.value = valorActual;
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
      <td>
        <button class="btn-icon" onclick="editarCarga('${c.id}')">✏️</button>
        <button class="btn-icon danger" onclick="borrarCarga('${c.id}')">🗑️</button>
      </td>
    </tr>
  `).join("");

  document.getElementById("cargas-count").textContent = lista.length;
}

// ===== Stats =====
function actualizarStats() {
  const totalLitros = todasLasCargas.reduce((s, c) => s + Number(c.litros), 0);
  const gastoCombustible = todasLasCargas.reduce((s, c) => s + Number(c.importe), 0);
  const gastoMantenimiento = todosLosMantenimientos.reduce((s, m) => s + Number(m.importe), 0);
  const gastoTotal = gastoCombustible + gastoMantenimiento;

  document.getElementById("total-litros").textContent = totalLitros.toLocaleString("es-ES", { maximumFractionDigits: 0 });
  document.getElementById("gasto-combustible").textContent = gastoCombustible.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  document.getElementById("gasto-mantenimiento").textContent = gastoMantenimiento.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  document.getElementById("gasto-total").textContent = gastoTotal.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

// ===== Nivel depósito =====
function actualizarNivelDeposito() {
  const conNivel = todaLaBitacora
    .filter(b => b.litrosDeposito != null || b.cm != null)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  if (conNivel.length === 0) {
    document.getElementById("nivel-deposito").textContent = "Sin datos";
    return;
  }

  const ultimo = conNivel[0];
  let texto = "";
  if (ultimo.litrosDeposito != null) texto += `${ultimo.litrosDeposito} L`;
  if (ultimo.cm != null) texto += (texto ? " · " : "") + `${ultimo.cm} cm`;
  texto += ` (${formatearFecha(ultimo.fecha)})`;

  document.getElementById("nivel-deposito").textContent = texto;
}

// ===== Comparativa año actual vs anterior =====
function actualizarComparativa() {
  const anoActual = new Date().getFullYear().toString();
  const anoAnterior = (parseInt(anoActual) - 1).toString();

  const cargasActual = todasLasCargas.filter(c => c.fecha.startsWith(anoActual));
  const cargasAnterior = todasLasCargas.filter(c => c.fecha.startsWith(anoAnterior));

  const litrosActual = cargasActual.reduce((s, c) => s + Number(c.litros), 0);
  const litrosAnterior = cargasAnterior.reduce((s, c) => s + Number(c.litros), 0);
  const gastoActual = cargasActual.reduce((s, c) => s + Number(c.importe), 0);
  const gastoAnterior = cargasAnterior.reduce((s, c) => s + Number(c.importe), 0);

  if (litrosAnterior > 0) {
    const diff = litrosActual - litrosAnterior;
    const pct = ((diff / litrosAnterior) * 100).toFixed(1);
    const clase = diff > 0 ? "delta-up" : diff < 0 ? "delta-down" : "delta-same";
    document.getElementById("comp-litros").innerHTML = `<span class="${clase}">${diff > 0 ? "+" : ""}${diff.toFixed(0)} L (${pct}%)</span>`;
  } else {
    document.getElementById("comp-litros").textContent = litrosActual > 0 ? `${litrosActual.toFixed(0)} L` : "—";
  }
  document.getElementById("comp-litros-label").textContent = `${anoActual} vs ${anoAnterior} (litros)`;

  if (gastoAnterior > 0) {
    const diff = gastoActual - gastoAnterior;
    const pct = ((diff / gastoAnterior) * 100).toFixed(1);
    const clase = diff > 0 ? "delta-up" : diff < 0 ? "delta-down" : "delta-same";
    document.getElementById("comp-gasto").innerHTML = `<span class="${clase}">${diff > 0 ? "+" : ""}${diff.toFixed(0)} € (${pct}%)</span>`;
  } else {
    document.getElementById("comp-gasto").textContent = gastoActual > 0 ? `${gastoActual.toFixed(0)} €` : "—";
  }
  document.getElementById("comp-gasto-label").textContent = `${anoActual} vs ${anoAnterior} (gasto)`;
}

// ===== Temporadas =====
function calcularTemporadas() {
  if (todaLaBitacora.length === 0) return;

  const eventos = [...todaLaBitacora]
    .filter(b => b.tipo === "Encendido" || b.tipo === "Apagado")
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const temporadas = [];
  let inicio = null;

  for (const ev of eventos) {
    if (ev.tipo === "Encendido") {
      inicio = ev;
    } else if (ev.tipo === "Apagado" && inicio) {
      const dias = diasEntre(inicio.fecha, ev.fecha);
      const cargasPeriodo = todasLasCargas.filter(c => c.fecha >= inicio.fecha && c.fecha <= ev.fecha);
      const litros = cargasPeriodo.reduce((s, c) => s + Number(c.litros), 0);
      const gasto = cargasPeriodo.reduce((s, c) => s + Number(c.importe), 0);
      const litrosDia = dias > 0 ? (litros / dias) : 0;

      temporadas.push({ inicio: inicio.fecha, fin: ev.fecha, dias, litros, litrosDia, gasto });
      inicio = null;
    }
  }

  if (inicio) {
    const dias = diasEntre(inicio.fecha, hoy);
    const cargasPeriodo = todasLasCargas.filter(c => c.fecha >= inicio.fecha);
    const litros = cargasPeriodo.reduce((s, c) => s + Number(c.litros), 0);
    const gasto = cargasPeriodo.reduce((s, c) => s + Number(c.importe), 0);
    const litrosDia = dias > 0 ? (litros / dias) : 0;

    temporadas.push({ inicio: inicio.fecha, fin: "En curso", dias, litros, litrosDia, gasto });
  }

  temporadas.reverse();

  document.getElementById("tabla-temporadas").innerHTML = temporadas.map(t => `
    <tr>
      <td>${formatearFecha(t.inicio)}</td>
      <td>${t.fin === "En curso" ? "<em>En curso</em>" : formatearFecha(t.fin)}</td>
      <td>${t.dias}</td>
      <td>${t.litros.toLocaleString("es-ES", { maximumFractionDigits: 0 })}</td>
      <td>${t.litrosDia.toFixed(1)}</td>
      <td>${t.gasto.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</td>
    </tr>
  `).join("") || `<tr><td colspan="6">No hay temporadas calculables</td></tr>`;
}

function diasEntre(f1, f2) {
  const d1 = new Date(f1);
  const d2 = new Date(f2);
  return Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
}

// ===== Agrupar por año =====
function agruparPorAno() {
  const mapa = {};
  todasLasCargas.forEach(c => {
    const ano = c.fecha.slice(0, 4);
    if (!mapa[ano]) mapa[ano] = { litros: 0, gasto: 0, cargas: 0 };
    mapa[ano].litros += Number(c.litros);
    mapa[ano].gasto += Number(c.importe);
    mapa[ano].cargas += 1;
  });
  return mapa;
}

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
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: textColor, maxRotation: 45 }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true }
    }
  };

  if (chartLitros) chartLitros.destroy();
  if (chartGasto) chartGasto.destroy();
  if (chartPrecio) chartPrecio.destroy();

  const ctxLitros = document.getElementById("chart-litros");
  if (ctxLitros) {
    chartLitros = new Chart(ctxLitros, {
      type: "bar",
      data: { labels: anos, datasets: [{ data: litrosData, backgroundColor: "#3b82f6", borderRadius: 6 }] },
      options: commonOptions
    });
  }

  const ctxGasto = document.getElementById("chart-gasto");
  if (ctxGasto) {
    chartGasto = new Chart(ctxGasto, {
      type: "bar",
      data: { labels: anos, datasets: [{ data: gastoData, backgroundColor: "#22c55e", borderRadius: 6 }] },
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
          y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: false }
        }
      }
    });
  }
}

// ===== Formulario Cargas =====
document.getElementById("form-carga").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("carga-id").value;
  const datos = {
    fecha: document.getElementById("carga-fecha").value,
    litros: parseFloat(document.getElementById("carga-litros").value),
    precioLitro: parseFloat(document.getElementById("carga-precio").value),
    importe: parseFloat(document.getElementById("carga-importe").value)
  };

  if (id) {
    await update(ref(db, `cargas/${id}`), datos);
  } else {
    await set(push(ref(db, "cargas")), datos);
  }
  resetFormCarga();
});

document.getElementById("btn-carga-cancelar").addEventListener("click", resetFormCarga);

function resetFormCarga() {
  document.getElementById("form-carga").reset();
  document.getElementById("carga-id").value = "";
  document.getElementById("carga-fecha").value = hoy;
  document.getElementById("btn-carga").textContent = "Añadir carga";
  document.getElementById("btn-carga-cancelar").style.display = "none";
  inputImporte.value = "";
}

window.editarCarga = function(id) {
  const c = todasLasCargas.find(x => x.id === id);
  if (!c) return;
  document.getElementById("carga-id").value = id;
  document.getElementById("carga-fecha").value = c.fecha;
  document.getElementById("carga-litros").value = c.litros;
  document.getElementById("carga-precio").value = c.precioLitro;
  document.getElementById("carga-importe").value = c.importe;
  document.getElementById("btn-carga").textContent = "Guardar cambios";
  document.getElementById("btn-carga-cancelar").style.display = "inline-flex";
  document.querySelector('[data-tab="cargas"]').click();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.borrarCarga = async function(id) {
  if (!confirm("¿Borrar esta carga?")) return;
  await remove(ref(db, `cargas/${id}`));
};

// ===== Formulario Bitácora =====
document.getElementById("form-bitacora").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("bit-id").value;
  const cm = document.getElementById("bit-cm").value;
  const litros = document.getElementById("bit-litros").value;
  const desc = document.getElementById("bit-desc").value;

  const datos = {
    fecha: document.getElementById("bit-fecha").value,
    tipo: document.getElementById("bit-tipo").value,
    cm: cm ? parseFloat(cm) : null,
    litrosDeposito: litros ? parseFloat(litros) : null,
    descripcion: desc || null
  };

  if (id) {
    await update(ref(db, `bitacora/${id}`), datos);
  } else {
    await set(push(ref(db, "bitacora")), datos);
  }
  resetFormBitacora();
});

document.getElementById("btn-bit-cancelar").addEventListener("click", resetFormBitacora);

function resetFormBitacora() {
  document.getElementById("form-bitacora").reset();
  document.getElementById("bit-id").value = "";
  document.getElementById("bit-fecha").value = hoy;
  document.getElementById("btn-bit").textContent = "Añadir entrada";
  document.getElementById("btn-bit-cancelar").style.display = "none";
}

window.editarBitacora = function(id) {
  const b = todaLaBitacora.find(x => x.id === id);
  if (!b) return;
  document.getElementById("bit-id").value = id;
  document.getElementById("bit-fecha").value = b.fecha;
  document.getElementById("bit-tipo").value = b.tipo;
  document.getElementById("bit-cm").value = b.cm ?? "";
  document.getElementById("bit-litros").value = b.litrosDeposito ?? "";
  document.getElementById("bit-desc").value = b.descripcion ?? "";
  document.getElementById("btn-bit").textContent = "Guardar cambios";
  document.getElementById("btn-bit-cancelar").style.display = "inline-flex";
  document.querySelector('[data-tab="bitacora"]').click();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.borrarBitacora = async function(id) {
  if (!confirm("¿Borrar esta entrada de bitácora?")) return;
  await remove(ref(db, `bitacora/${id}`));
};

// ===== Formulario Mantenimientos =====
document.getElementById("form-mantenimiento").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("mant-id").value;
  const datos = {
    fecha: document.getElementById("mant-fecha").value,
    importe: parseFloat(document.getElementById("mant-importe").value),
    descripcion: document.getElementById("mant-desc").value
  };

  if (id) {
    await update(ref(db, `mantenimientos/${id}`), datos);
  } else {
    await set(push(ref(db, "mantenimientos")), datos);
  }
  resetFormMantenimiento();
});

document.getElementById("btn-mant-cancelar").addEventListener("click", resetFormMantenimiento);

function resetFormMantenimiento() {
  document.getElementById("form-mantenimiento").reset();
  document.getElementById("mant-id").value = "";
  document.getElementById("mant-fecha").value = hoy;
  document.getElementById("btn-mant").textContent = "Añadir mantenimiento";
  document.getElementById("btn-mant-cancelar").style.display = "none";
}

window.editarMantenimiento = function(id) {
  const m = todosLosMantenimientos.find(x => x.id === id);
  if (!m) return;
  document.getElementById("mant-id").value = id;
  document.getElementById("mant-fecha").value = m.fecha;
  document.getElementById("mant-importe").value = m.importe;
  document.getElementById("mant-desc").value = m.descripcion || "";
  document.getElementById("btn-mant").textContent = "Guardar cambios";
  document.getElementById("btn-mant-cancelar").style.display = "inline-flex";
  document.querySelector('[data-tab="mantenimientos"]').click();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.borrarMantenimiento = async function(id) {
  if (!confirm("¿Borrar este mantenimiento?")) return;
  await remove(ref(db, `mantenimientos/${id}`));
};

// ===== Utilidades =====
function formatearFecha(fecha) {
  if (!fecha || fecha === "En curso") return fecha;
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}
