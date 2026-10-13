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

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Cargar lista de estudiantes con Checkboxes
function cargarEstudiantes() {
  const gradoSelect = document.getElementById('grado').value;
  const aulaSelect = document.getElementById('aula').value;
  const contenedor = document.getElementById('contenedorEstudiantes');

  contenedor.innerHTML = '';

  if (gradoSelect && aulaSelect && typeof nominaEstudiantes !== 'undefined' && nominaEstudiantes[gradoSelect] && nominaEstudiantes[gradoSelect][aulaSelect]) {
    const lista = nominaEstudiantes[gradoSelect][aulaSelect];
    
    lista.forEach((estudiante, idx) => {
      const div = document.createElement('div');
      div.className = 'form-check';
      div.innerHTML = `
        <input class="form-check-input chk-estudiante" type="checkbox" value="${estudiante}" id="chk_${idx}">
        <label class="form-check-label small" for="chk_${idx}">
          ${estudiante}
        </label>
      `;
      contenedor.appendChild(div);
    });
  } else {
    contenedor.innerHTML = '<span class="text-muted small">Primero selecciona grado y sección...</span>';
  }
}

document.getElementById('grado').addEventListener('change', cargarEstudiantes);
document.getElementById('aula').addEventListener('change', cargarEstudiantes);

// Guardar múltiples estudiantes seleccionados
document.getElementById('attendanceForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Obtener todos los alumnos marcados
  const checkboxes = document.querySelectorAll('.chk-estudiante:checked');
  
  if (checkboxes.length === 0) {
    alert('Por favor selecciona al menos un estudiante de la lista.');
    return;
  }

  const btnGuardar = document.getElementById('btnGuardar');
  btnGuardar.disabled = true;
  btnGuardar.textContent = "Guardando...";

  const ahora = new Date();
  const ano = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  const fechaFiltro = `${ano}-${mes}-${dia}`; 

  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const fechaFormateada = `${ahora.getDate()}/${ahora.getMonth() + 1}/${ano} ${horas}:${minutos}`;

  const grado = document.getElementById('grado').value;
  const aula = document.getElementById('aula').value;
  const area = document.getElementById('area').value;
  const estado = document.getElementById('estado').value;

  // Promesas para guardar en lote en Firebase
  const promesas = Array.from(checkboxes).map(chk => {
    const nuevoRegistro = {
      grado: grado,
      aula: aula,
      area: area,
      estudiante: chk.value,
      estado: estado,
      fecha: fechaFormateada,
      fechaFiltro: fechaFiltro
    };
    return database.ref('asistencia').push(nuevoRegistro);
  });

  Promise.all(promesas)
    .then(() => {
      alert(`¡Se registraron con éxito ${checkboxes.length} estudiante(s)!`);
      document.getElementById('attendanceForm').reset();
      cargarEstudiantes();
    })
    .catch((error) => {
      console.error("Error al guardar:", error);
      alert('Hubo un error al guardar los registros. Intenta nuevamente.');
    })
    .finally(() => {
      btnGuardar.disabled = false;
      btnGuardar.textContent = "Guardar Registros";
    });
});
