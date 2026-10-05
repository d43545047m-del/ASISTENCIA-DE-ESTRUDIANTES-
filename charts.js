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

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let todosLosRegistros = [];
let chartEstadoInstance = null;
let chartGradoInstance = null;

document.addEventListener('DOMContentLoaded', () => {
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

  document.getElementById('filtroFecha').addEventListener('change', aplicarFiltrosYRenderizar);
  document.getElementById('filtroGrado').addEventListener('change', aplicarFiltrosYRenderizar);
  document.getElementById('filtroAula').addEventListener('change', aplicarFiltrosYRenderizar);
  document.getElementById('btnLimpiarFiltros').addEventListener('click', () => {
    document.getElementById('filtroFecha').value = '';
    document.getElementById('filtroGrado').value = '';
    document.getElementById('filtroAula').value = '';
    aplicarFiltrosYRenderizar();
  });

  document.getElementById('btnExportExcel').addEventListener('click', exportarExcel);
  document.getElementById('btnExportPDF').addEventListener('click', exportarPDF);
});

function aplicarFiltrosYRenderizar() {
  const fFecha = document.getElementById('filtroFecha').value;
  const fGrado = document.getElementById('filtroGrado').value;
  const fAula = document.getElementById('filtroAula').value;

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
  tbody.innerHTML = '';

  if (registros.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No se encontraron registros.</td></tr>`;
    return;
  }

  registros.forEach(r => {
    const badgeClass = r.estado === 'Tardanza' ? 'bg-warning text-dark' : 'bg-danger';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.fecha}</td>
      <td><strong>${r.estudiante}</strong></td>
      <td>${r.grado}</td>
      <td>${r.aula}</td>
      <td>${r.area || 'N/A'}</td>
      <td><span class="badge ${badgeClass}">${r.estado}</span></td>
      <td class="text-center">
        <button class="btn btn-outline-danger btn-sm" onclick="eliminarRegistro('${r.id}')">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderizarGraficos(registros) {
  const estados = { Tardanza: 0, Inasistencia: 0 };
  const grados = {};

  registros.forEach(r => {
    if (estados[r.estado] !== undefined) estados[r.estado]++;
    grados[r.grado] = (grados[r.grado] || 0) + 1;
  });

  if (chartEstadoInstance) chartEstadoInstance.destroy();
  if (chartGradoInstance) chartGradoInstance.destroy();

  const ctxEstado = document.getElementById('chartEstado');
  chartEstadoInstance = new Chart(ctxEstado, {
    type: 'pie',
    data: {
      labels: ['Tardanzas', 'Inasistencias'],
      datasets: [{
        data: [estados.Tardanza, estados.Inasistencia],
        backgroundColor: ['#ffc107', '#dc3545']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  const ctxGrado = document.getElementById('chartGrado');
  chartGradoInstance = new Chart(ctxGrado, {
    type: 'bar',
    data: {
      labels: Object.keys(grados),
      datasets: [{
        label: 'Cantidad de Incidencias',
        data: Object.values(grados),
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

function eliminarRegistro(id) {
  if (confirm('¿Estás seguro de eliminar este registro de la base de datos?')) {
    database.ref('asistencia/' + id).remove();
  }
}

function exportarExcel() {
  const tabla = document.getElementById("tablaAsistencia");
  const wb = XLSX.utils.table_to_book(tabla, { sheet: "Asistencia" });
  XLSX.writeFile(wb, "Reporte_Asistencia.xlsx");
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Reporte de Asistencia e Inasistencias", 14, 15);
  doc.autoTable({
    html: '#tablaAsistencia',
    startY: 20,
    columns: [0, 1, 2, 3, 4, 5]
  });

  doc.save("Reporte_Asistencia.pdf");
}
