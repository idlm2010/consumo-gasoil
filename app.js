// ===== Gráficos =====
function actualizarGraficos() {
  if (todasLasCargas.length === 0) return;

  const porAno = agruparPorAno();
  const anos = Object.keys(porAno).sort();

  const litrosData = anos.map(a => porAno[a].litros);
  const gastoData = anos.map(a => Math.round(porAno[a].gasto * 100) / 100);

  // Precio
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

  // Destruir gráficos anteriores si existen
  if (chartLitros) chartLitros.destroy();
  if (chartGasto) chartGasto.destroy();
  if (chartPrecio) chartPrecio.destroy();

  // Gráfico litros
  const ctxLitros = document.getElementById("chart-litros");
  if (ctxLitros) {
    chartLitros = new Chart(ctxLitros, {
      type: "bar",
      data: {
        labels: anos,
        datasets: [{
          label: "Litros",
          data: litrosData,
          backgroundColor: "#3b82f6",
          borderRadius: 6
        }]
      },
      options: commonOptions
    });
  }

  // Gráfico gasto
  const ctxGasto = document.getElementById("chart-gasto");
  if (ctxGasto) {
    chartGasto = new Chart(ctxGasto, {
      type: "bar",
      data: {
        labels: anos,
        datasets: [{
          label: "Gasto €",
          data: gastoData,
          backgroundColor: "#22c55e",
          borderRadius: 6
        }]
      },
      options: commonOptions
    });
  }

  // Gráfico evolución precio
  const ctxPrecio = document.getElementById("chart-precio");
  if (ctxPrecio) {
    chartPrecio = new Chart(ctxPrecio, {
      type: "line",
      data: {
        labels: fechasPrecio,
        datasets: [{
          label: "Precio €/L",
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
              callback: function(value, index, ticks) {
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
