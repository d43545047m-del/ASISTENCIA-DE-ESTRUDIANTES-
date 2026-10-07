// 1. Configuración de Firebase
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

// Evitar errores de inicialización duplicada
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// 2. Cargar lista de estudiantes según Grado y Sección seleccionados
function cargarEstudiantes() {
  const gradoSelect = document.getElementById('grado').value;
  const aulaSelect = document.getElementById('aula').value;
  const selectEstudiante = document.getElementById('estudiante');

  selectEstudiante.innerHTML = '<option value="">Seleccionar estudiante...</option>';

  if (gradoSelect && aulaSelect && typeof nominaEstudiantes !== 'undefined' && nominaEstudiantes[gradoSelect] && nominaEstudiantes[gradoSelect][aulaSelect]) {
    selectEstudiante.disabled = false;
    const lista = nominaEstudiantes[gradoSelect][aulaSelect];
    
    lista.forEach(estudiante => {
      const option = document.createElement('option');
      option.value = estudiante;
      option.textContent = estudiante;
      selectEstudiante.appendChild(option);
    });
  } else {
    selectEstudiante.disabled = true;
    selectEstudiante.innerHTML = '<option value="">Primero selecciona grado y sección...</option>';
  }
}

// Escuchar cambios en los desplegables de Grado y Sección
document.getElementById('grado').addEventListener('change', cargarEstudiantes);
document.getElementById('aula').addEventListener('change', cargarEstudiantes);

// 3. Lógica para guardar el registro en Firebase Realtime Database
document.getElementById('attendanceForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const btnGuardar = document.getElementById('btnGuardar');
  btnGuardar.disabled = true;
  btnGuardar.textContent = "Guardando...";

  // Generar fechas en el formato correcto
  const ahora = new Date();
  
  // Formato YYYY-MM-DD necesario para que el filtro de fecha en reportes lo reconozca
  const ano = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  const fechaFiltro = `${ano}-${mes}-${dia}`; 

  // Formato D/M/YYYY HH:MM para mostrar legiblemente en la tabla
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const fechaFormateada = `${ahora.getDate()}/${ahora.getMonth() + 1}/${ano} ${horas}:${minutos}`;

  const nuevoRegistro = {
    grado: document.getElementById('grado').value,
    aula: document.getElementById('aula').value,
    area: document.getElementById('area').value,
    estudiante: document.getElementById('estudiante').value,
    estado: document.getElementById('estado').value,
    fecha: fechaFormateada,
    fechaFiltro: fechaFiltro
  };

  // Enviar a Firebase Database
  database.ref('asistencia').push(nuevoRegistro)
    .then(() => {
      alert('¡Registro de asistencia guardado con éxito!');
      document.getElementById('attendanceForm').reset();
      cargarEstudiantes(); // Limpiar y deshabilitar desplegable de estudiantes
    })
    .catch((error) => {
      console.error("Error al guardar en Firebase:", error);
      alert('Hubo un error al guardar el registro. Por favor intente de nuevo.');
    })
    .finally(() => {
      btnGuardar.disabled = false;
      btnGuardar.textContent = "Guardar Registro";
    });
});
