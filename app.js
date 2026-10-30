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
  const gradoElem = document.getElementById('grado');
  const aulaElem = document.getElementById('aula');
  const contenedor = document.getElementById('contenedorEstudiantes');

  if (!contenedor) return;

  const gradoSelect = gradoElem ? gradoElem.value : '';
  const aulaSelect = aulaElem ? aulaElem.value : '';

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

document.addEventListener('DOMContentLoaded', () => {
  const elGrado = document.getElementById('grado');
  const elAula = document.getElementById('aula');
  const elForm = document.getElementById('attendanceForm');

  if (elGrado) elGrado.addEventListener('change', cargarEstudiantes);
  if (elAula) elAula.addEventListener('change', cargarEstudiantes);

  if (elForm) {
    elForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const checkboxes = document.querySelectorAll('.chk-estudiante:checked');
      
      if (checkboxes.length === 0) {
        alert('Por favor selecciona al menos un estudiante de la lista.');
        return;
      }

      const btnGuardar = document.getElementById('btnGuardar');
      if (btnGuardar) {
        btnGuardar.disabled = true;
        btnGuardar.textContent = "Guardando...";
      }

      const ahora = new Date();
      const ano = ahora.getFullYear();
      const mes = String(ahora.getMonth() + 1).padStart(2, '0');
      const dia = String(ahora.getDate()).padStart(2, '0');
      const fechaFiltro = `${ano}-${mes}-${dia}`; 

      const horas = String(ahora.getHours()).padStart(2, '0');
      const minutos = String(ahora.getMinutes()).padStart(2, '0');
      const fechaFormateada = `${ahora.getDate()}/${ahora.getMonth() + 1}/${ano} ${horas}:${minutos}`;

      const elDocente = document.getElementById('docente');
      const elGrado = document.getElementById('grado');
      const elAula = document.getElementById('aula');
      const elArea = document.getElementById('area');
      const elEstado = document.getElementById('estado');

      const docente = elDocente ? elDocente.value : 'N/A';
      const grado = elGrado ? elGrado.value : '';
      const aula = elAula ? elAula.value : '';
      const area = elArea ? elArea.value : 'N/A';
      const estado = elEstado ? elEstado.value : 'Tardanza';

      const promesas = Array.from(checkboxes).map(chk => {
        const nuevoRegistro = {
          docente: docente,
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
          console.error("Error al guardar en Firebase:", error);
          alert('Hubo un error al guardar los registros. Intenta nuevamente.');
        })
        .finally(() => {
          if (btnGuardar) {
            btnGuardar.disabled = false;
            btnGuardar.textContent = "Guardar Registros";
          }
        });
    });
  }
});
