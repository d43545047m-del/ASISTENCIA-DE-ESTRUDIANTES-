// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCqheRJkcSJVPG1XuMEiZlithQKUYV9JKE",
  authDomain: "control-de-asistencia-aef47.firebaseapp.com",
  databaseURL: "https://control-de-asistencia-aef47-default-rtdb.firebaseio.com",
  projectId: "control-de-asistencia-aef47",
  storageBucket: "control-de-asistencia-aef47.firebasestorage.app",
  messagingSenderId: "918828594178",
  appId: "1:918828594178:web:e44ff1902cfc4502fca31b",
  measurementId: "G-56QDYD0B6Y"
};

// Inicialización de Firebase
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

let todosLosRegistros = [];
let chartEstadoInstance = null;
let chartGradoInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  // Establecer fecha actual por defecto en el filtro
  const hoy = new Date().toISOString().split('T')[0];
  const elFiltroFecha = document.getElementById('filtroFecha');
  if (elFiltroFecha) elFiltroFecha.value = hoy;

  // Escuchar cambios en la base de datos Realtime
  database.ref('asistencia').on('value', (snapshot) => {
    const data = snapshot.val();
    todosLosRegistros = [];
    
    if (data) {
      Object.keys(data).forEach(key => {
        todosLosRegistros.push({ id: key, ...data[key] });
      });
    }

    aplicarFiltrosYRenderizar();
  });

  // Listener para los filtros
  if (elFiltroFecha) elFiltroFecha.addEventListener('change', aplicarFiltrosYRenderizar);
  const elFiltroGrado = document.getElementById('filtroGrado');
  if (elFiltroGrado) elFiltroGrado.addEventListener('change', aplicarFiltrosYRenderizar);
  const elFiltroAula = document.getElementById('filtroAula');
  if (elFiltroAula) elFiltroAula.addEventListener('change', aplicarFiltrosYRenderizar);
  
  // Limpiar filtros
  const btnLimpiar = document.getElementById('btnLimpiarFiltros');
  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', () => {
      if (elFiltroFecha) elFiltroFecha.value = '';
      if (elFiltroGrado) elFiltroGrado.value = '';
      if (elFiltroAula) elFiltroAula.value = '';
      aplicarFiltrosYRenderizar();
    });
  }

  // Exportar archivos
  const btnExcel = document.getElementById('btnExportExcel');
  if (btnExcel) btnExcel.addEventListener('click', exportarExcel);

  const btnPDF = document.getElementById('btnExportPDF');
  if (btnPDF) btnPDF.addEventListener('click', exportarPDF);
});

function aplicarFiltrosYRenderizar() {
  const fFecha = document.getElementById('filtroFecha')?.value || '';
  const fGrado = document.getElementById('filtroGrado')?.value || '';
  const fAula = document.getElementById('filtroAula')?.value || '';

  const filtrados = todosLosRegistros.filter(r => {
    const coincideFecha = !fFecha || r.fechaFiltro === fFecha;
    const coincideGrado = !fGrado || r.grado === fGrado;
    const coincideAula = !fAula || r.aula === fAula;
    return coincideFecha && coincideGrado && coincideAula;
  });

  renderizarTabla(filtrados);
  renderizarGraficos(filtrados);
}

function renderizarTabla(registros) {
  const tbody = document.getElementById('tbodyRegistros');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (registros.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No se encontraron registros.</td></tr>`;
    return;
  }

  registros.forEach(r => {
    const esTardanza = r.estado === 'Tardanza';
    const badgeClass = esTardanza ? 'bg-warning text-dark' : 'bg-danger text-white';
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.fecha || 'N/A'}</td>
      <td><strong>${r.estudiante || 'Sin nombre'}</strong></td>
      <td>${r.grado || 'N/A'}</td>
      <td>${r.aula || 'N/A'}</td>
      <td>${r.area || 'N/A'}</td>
      <td>${r.docente || 'N/A'}</td>
      <td><span class="badge ${badgeClass}">${r.estado || 'Inasistencia'}</span></td>
      <td class="text-center">
        <button class="btn btn-outline-danger btn-sm" onclick="eliminarRegistro('${r.id}')">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderizarGraficos(registros) {
  const estados = { Tardanza: 0, Inasistencia: 0, Falta: 0 };
  const grados = {};

  registros.forEach(r => {
    const est = r.estado || 'Inasistencia';
    if (est === 'Falta' || est === 'Inasistencia') {
      estados.Inasistencia++;
    } else if (est === 'Tardanza') {
      estados.Tardanza++;
    }

    if (r.grado) {
      grados[r.grado] = (grados[r.grado] || 0) + 1;
    }
  });

  if (chartEstadoInstance) chartEstadoInstance.destroy();
  if (chartGradoInstance) chartGradoInstance.destroy();

  const ctxEstado = document.getElementById('chartEstado');
  if (ctxEstado) {
    chartEstadoInstance = new Chart(ctxEstado, {
      type: 'pie',
      data: {
        labels: ['Tardanzas', 'Inasistencias / Faltas'],
        datasets: [{
          data: [estados.Tardanza, estados.Inasistencia],
          backgroundColor: ['#ffc107', '#dc3545']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  const ctxGrado = document.getElementById('chartGrado');
  if (ctxGrado) {
    chartGradoInstance = new Chart(ctxGrado, {
      type: 'bar',
      data: {
        labels: Object.keys(grados).length ? Object.keys(grados) : ['Sin datos'],
        datasets: [{
          label: 'Cantidad de Incidencias',
          data: Object.values(grados).length ? Object.values(grados) : [0],
          backgroundColor: '#0d6efd'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
  }
}

function eliminarRegistro(id) {
  if (confirm('¿Estás seguro de eliminar este registro de la base de datos?')) {
    database.ref('asistencia/' + id).remove();
  }
}

function exportarExcel() {
  const tabla = document.getElementById("tablaAsistencia");
  if (!tabla || typeof XLSX === 'undefined') {
    alert("No se pudo generar el archivo Excel. Asegúrate de tener la librería SheetJS vinculada.");
    return;
  }
  const wb = XLSX.utils.table_to_book(tabla, { sheet: "Asistencia" });
  XLSX.writeFile(wb, "Reporte_Asistencia.xlsx");
}

function exportarPDF() {
  if (typeof window.jspdf === 'undefined') {
    alert("No se pudo generar el PDF. Asegúrate de incluir la librería jsPDF y autoTable.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Reporte de Asistencia e Inasistencias - I.E 81007 MODELO", 14, 15);
  doc.autoTable({
    html: '#tablaAsistencia',
    startY: 20,
    columns: [0, 1, 2, 3, 4, 5, 6]
  });

  doc.save("Reporte_Asistencia.pdf");
}
