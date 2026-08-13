import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

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

// ===== DATOS DE CARGAS =====
const cargas = [
  { fecha: "2005-12-16", litros: 571, precioLitro: 0.63, importe: 359.73 },
  { fecha: "2006-01-16", litros: 588, precioLitro: 0.661, importe: 388.67 },
  { fecha: "2006-02-15", litros: 500, precioLitro: 0.67, importe: 335 },
  { fecha: "2006-05-03", litros: 500, precioLitro: 0.713, importe: 356.5 },
  { fecha: "2006-12-13", litros: 646, precioLitro: 0.6, importe: 387.6 },
  { fecha: "2007-01-09", litros: 556, precioLitro: 0.617, importe: 343.05 },
  { fecha: "2007-02-14", litros: 576, precioLitro: 0.615, importe: 354.24 },
  { fecha: "2007-04-03", litros: 491, precioLitro: 0.645, importe: 316.7 },
  { fecha: "2007-11-07", litros: 502, precioLitro: 0.705, importe: 353.91 },
  { fecha: "2007-12-19", litros: 681, precioLitro: 0.705, importe: 480.11 },
  { fecha: "2008-01-21", litros: 534, precioLitro: 0.717, importe: 382.88 },
  { fecha: "2008-03-18", litros: 553, precioLitro: 0.798, importe: 441.29 },
  { fecha: "2008-11-10", litros: 514, precioLitro: 0.687, importe: 353.12 },
  { fecha: "2008-12-15", litros: 482, precioLitro: 0.538, importe: 259.32 },
  { fecha: "2009-01-13", litros: 518, precioLitro: 0.555, importe: 287.49 },
  { fecha: "2009-02-17", litros: 527, precioLitro: 0.529, importe: 278.78 },
  { fecha: "2009-04-24", litros: 494, precioLitro: 0.54, importe: 266.76 },
  { fecha: "2009-12-10", litros: 550, precioLitro: 0.603, importe: 331.65 },
  { fecha: "2010-01-07", litros: 482, precioLitro: 0.642, importe: 309.44 },
  { fecha: "2010-02-09", litros: 543, precioLitro: 0.617, importe: 335.03 },
  { fecha: "2010-03-15", litros: 542, precioLitro: 0.68, importe: 368.56 },
  { fecha: "2010-11-03", litros: 523, precioLitro: 0.695, importe: 363.49 },
  { fecha: "2010-12-14", litros: 484, precioLitro: 0.764, importe: 369.78 },
  { fecha: "2011-01-10", litros: 502, precioLitro: 0.783, importe: 393.07 },
  { fecha: "2011-02-10", litros: 531, precioLitro: 0.82, importe: 435.42 },
  { fecha: "2011-03-29", litros: 480, precioLitro: 0.884, importe: 424.32 },
  { fecha: "2011-11-30", litros: 496, precioLitro: 0.90388, importe: 448.32 },
  { fecha: "2012-01-11", litros: 543, precioLitro: 0.95462, importe: 518.36 },
  { fecha: "2012-02-13", litros: 628, precioLitro: 0.94754, importe: 595.06 },
  { fecha: "2012-04-18", litros: 503, precioLitro: 0.96642, importe: 486.11 },
  { fecha: "2012-12-03", litros: 580, precioLitro: 0.95469, importe: 553.72 },
  { fecha: "2013-01-15", litros: 578, precioLitro: 0.94017, importe: 543.42 },
  { fecha: "2013-02-26", litros: 536, precioLitro: 0.968, importe: 518.85 },
  { fecha: "2013-05-28", litros: 497, precioLitro: 0.889955, importe: 442.31 },
  { fecha: "2013-12-02", litros: 471, precioLitro: 0.93775, importe: 441.68 },
  { fecha: "2014-01-02", litros: 480, precioLitro: 0.910041, importe: 436.82 },
  { fecha: "2014-02-06", litros: 424, precioLitro: 0.89903, importe: 381.19 },
  { fecha: "2014-04-05", litros: 463, precioLitro: 0.874951, importe: 405.1 },
  { fecha: "2014-12-12", litros: 539, precioLitro: 0.695024, importe: 374.62 },
  { fecha: "2015-01-13", litros: 435, precioLitro: 0.62194, importe: 270.54 },
  { fecha: "2015-02-10", litros: 428, precioLitro: 0.684981, importe: 293.17 },
  { fecha: "2015-03-19", litros: 346, precioLitro: 0.698049, importe: 241.52 },
  { fecha: "2015-10-29", litros: 380, precioLitro: 0.594957, importe: 226.08 },
  { fecha: "2015-12-15", litros: 360, precioLitro: 0.530948, importe: 191.14 },
  { fecha: "2016-01-19", litros: 389, precioLitro: 0.45496, importe: 176.98 },
  { fecha: "2016-03-04", litros: 487, precioLitro: 0.495979, importe: 241.54 },
  { fecha: "2016-05-19", litros: 365, precioLitro: 0.564949, importe: 206.21 },
  { fecha: "2016-12-06", litros: 548, precioLitro: 0.630047, importe: 345.27 },
  { fecha: "2017-01-09", litros: 542, precioLitro: 0.677963, importe: 367.46 },
  { fecha: "2017-02-17", litros: 512, precioLitro: 0.675059, importe: 345.63 },
  { fecha: "2017-09-07", litros: 503, precioLitro: 0.626054, importe: 314.91 },
  { fecha: "2017-12-15", litros: 571, precioLitro: 0.689942, importe: 393.96 },
  { fecha: "2018-01-18", litros: 464, precioLitro: 0.70906, importe: 329 },
  { fecha: "2018-02-22", litros: 486, precioLitro: 0.675059, importe: 328.08 },
  { fecha: "2018-08-23", litros: 563, precioLitro: 0.770044, importe: 433.53 },
  { fecha: "2018-12-20", litros: 578, precioLitro: 0.699985, importe: 404.59 },
  { fecha: "2019-01-29", litros: 547, precioLitro: 0.725032, importe: 396.59 },
  { fecha: "2019-02-15", litros: 201, precioLitro: 0.75504, importe: 151.76 },
  { fecha: "2019-07-09", litros: 524, precioLitro: 0.729993, importe: 382.52 },
  { fecha: "2019-12-11", litros: 555, precioLitro: 0.749958, importe: 416.23 },
  { fecha: "2020-01-15", litros: 495, precioLitro: 0.760001, importe: 376.2 },
  { fecha: "2020-03-06", litros: 525, precioLitro: 0.639969, importe: 335.98 },
  { fecha: "2020-05-26", litros: 351, precioLitro: 0.484968, importe: 170.22 },
  { fecha: "2020-11-17", litros: 292, precioLitro: 0.52998, importe: 154.75 },
  { fecha: "2020-12-29", litros: 533, precioLitro: 0.579953, importe: 309.11 },
  { fecha: "2021-01-25", litros: 430, precioLitro: 0.61, importe: 262.3 },
  { fecha: "2021-03-25", litros: 528, precioLitro: 0.67, importe: 353.76 },
  { fecha: "2021-11-15", litros: 522, precioLitro: 0.86, importe: 448.92 },
  { fecha: "2021-12-27", litros: 529, precioLitro: 0.81, importe: 428.49 },
  { fecha: "2022-02-01", litros: 563, precioLitro: 0.945, importe: 532.04 },
  { fecha: "2022-03-01", litros: 350, precioLitro: 1.6, importe: 560 },
  { fecha: "2022-10-21", litros: 491, precioLitro: 1.419, importe: 696.73 },
  { fecha: "2022-12-27", litros: 373, precioLitro: 1, importe: 373 },
  { fecha: "2023-02-17", litros: 520, precioLitro: 1.14, importe: 592.8 },
  { fecha: "2023-12-15", litros: 545, precioLitro: 1.05, importe: 572.25 },
  { fecha: "2024-01-26", litros: 422, precioLitro: 1.05, importe: 443.1 },
  { fecha: "2024-09-10", litros: 513, precioLitro: 0.91, importe: 466.83 },
  { fecha: "2024-12-30", litros: 446, precioLitro: 0.975, importe: 434.85 },
  { fecha: "2025-02-17", litros: 491, precioLitro: 1.02, importe: 500.82 },
  { fecha: "2025-09-05", litros: 362, precioLitro: 0.913, importe: 330.51 },
  { fecha: "2026-01-05", litros: 544, precioLitro: 0.905, importe: 492.32 },
  { fecha: "2026-03-03", litros: 468, precioLitro: 1.09, importe: 510.12 }
];

// ===== DATOS DE BITÁCORA =====
const bitacora = [
  { fecha: "2006-10-21", tipo: "Encendido", cm: 85, litrosDeposito: null, descripcion: null },
  { fecha: "2007-04-23", tipo: "Apagado", cm: 100, litrosDeposito: null, descripcion: null },
  { fecha: "2007-10-23", tipo: "Encendido", cm: 64, litrosDeposito: null, descripcion: null },
  { fecha: "2008-04-23", tipo: "Apagado", cm: 100, litrosDeposito: null, descripcion: null },
  { fecha: "2008-10-26", tipo: "Encendido", cm: 64, litrosDeposito: null, descripcion: null },
  { fecha: "2009-04-23", tipo: "Apagado", cm: 115, litrosDeposito: null, descripcion: null },
  { fecha: "2009-10-19", tipo: "Encendido", cm: 99, litrosDeposito: null, descripcion: null },
  { fecha: "2010-04-23", tipo: "Apagado", cm: 88, litrosDeposito: null, descripcion: null },
  { fecha: "2010-10-17", tipo: "Encendido", cm: 64, litrosDeposito: null, descripcion: null },
  { fecha: "2011-04-03", tipo: "Apagado", cm: 110, litrosDeposito: null, descripcion: null },
  { fecha: "2011-10-27", tipo: "Encendido", cm: 78, litrosDeposito: null, descripcion: null },
  { fecha: "2012-04-05", tipo: "Apagado", cm: 112, litrosDeposito: null, descripcion: null },
  { fecha: "2012-10-28", tipo: "Encendido", cm: 81, litrosDeposito: null, descripcion: null },
  { fecha: "2013-06-03", tipo: "Apagado", cm: 111, litrosDeposito: null, descripcion: null },
  { fecha: "2013-10-30", tipo: "Encendido", cm: 93, litrosDeposito: null, descripcion: null },
  { fecha: "2014-04-15", tipo: "Apagado", cm: 114, litrosDeposito: null, descripcion: null },
  { fecha: "2014-11-04", tipo: "Encendido", cm: 83, litrosDeposito: null, descripcion: null },
  { fecha: "2015-04-19", tipo: "Apagado", cm: 96, litrosDeposito: null, descripcion: null },
  { fecha: "2015-10-17", tipo: "Encendido", cm: 69, litrosDeposito: null, descripcion: null },
  { fecha: "2016-04-23", tipo: "Apagado", cm: 72, litrosDeposito: null, descripcion: null },
  { fecha: "2016-10-29", tipo: "Encendido", cm: 88, litrosDeposito: null, descripcion: null },
  { fecha: "2017-04-12", tipo: "Apagado", cm: 69, litrosDeposito: null, descripcion: null },
  { fecha: "2017-11-01", tipo: "Encendido", cm: 104, litrosDeposito: null, descripcion: null },
  { fecha: "2018-04-21", tipo: "Apagado", cm: 50, litrosDeposito: null, descripcion: null },
  { fecha: "2018-10-26", tipo: "Encendido", cm: 102, litrosDeposito: null, descripcion: null },
  { fecha: "2018-11-01", tipo: "Mejora de instalación", cm: null, litrosDeposito: null, descripcion: "Cerramiento cubo" },
  { fecha: "2019-05-01", tipo: "Apagado", cm: 98, litrosDeposito: null, descripcion: null },
  { fecha: "2019-10-21", tipo: "Encendido", cm: 100, litrosDeposito: null, descripcion: null },
  { fecha: "2020-03-15", tipo: "Informativo", cm: null, litrosDeposito: null, descripcion: "Confinamiento por COVID hasta el 21/06/2020" },
  { fecha: "2020-04-18", tipo: "Apagado", cm: 76, litrosDeposito: null, descripcion: null },
  { fecha: "2020-10-05", tipo: "Encendido", cm: 103, litrosDeposito: null, descripcion: null },
  { fecha: "2021-04-25", tipo: "Apagado", cm: 95, litrosDeposito: null, descripcion: null },
  { fecha: "2021-10-16", tipo: "Encendido", cm: 68, litrosDeposito: null, descripcion: null },
  { fecha: "2022-02-12", tipo: "Informativo", cm: null, litrosDeposito: null, descripcion: "Guerra Ucrania" },
  { fecha: "2022-04-30", tipo: "Apagado", cm: 73, litrosDeposito: null, descripcion: null },
  { fecha: "2022-10-21", tipo: "Mejora de instalación", cm: null, litrosDeposito: null, descripcion: "Caldera nueva" },
  { fecha: "2022-11-07", tipo: "Encendido", cm: 114, litrosDeposito: null, descripcion: null },
  { fecha: "2023-03-26", tipo: "Apagado", cm: 88, litrosDeposito: null, descripcion: null },
  { fecha: "2023-11-01", tipo: "Encendido", cm: 72, litrosDeposito: 320, descripcion: null },
  { fecha: "2024-04-07", tipo: "Apagado", cm: 54, litrosDeposito: 535, descripcion: null },
  { fecha: "2024-10-28", tipo: "Encendido", cm: 110, litrosDeposito: 700, descripcion: null },
  { fecha: "2025-04-08", tipo: "Apagado", cm: 75, litrosDeposito: 300, descripcion: null },
  { fecha: "2025-10-29", tipo: "Encendido", cm: 110, litrosDeposito: 700, descripcion: null },
  { fecha: "2026-04-09", tipo: "Apagado", cm: 93, litrosDeposito: 640, descripcion: null }
];

async function importar() {
  console.log("Importando cargas...");
  const cargasObj = {};
  cargas.forEach((c, i) => {
    const id = `c${String(i + 1).padStart(3, "0")}`;
    cargasObj[id] = c;
  });
  await set(ref(db, "cargas"), cargasObj);
  console.log(`✅ ${cargas.length} cargas importadas`);

  console.log("Importando bitácora...");
  const bitacoraObj = {};
  bitacora.forEach((b, i) => {
    const id = `b${String(i + 1).padStart(3, "0")}`;
    bitacoraObj[id] = b;
  });
  await set(ref(db, "bitacora"), bitacoraObj);
  console.log(`✅ ${bitacora.length} entradas de bitácora importadas`);

  console.log("\n🎉 Importación completada");
  process.exit(0);
}

importar().catch(console.error);