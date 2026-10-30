// Configuración de Firebase Realtime Database
const firebaseConfig = {
  apiKey: "AIzaSyCqheRJkcSJVPG1XuMEiZlithQKUYV9JKE",
  authDomain: "control-de-asistencia-aef47.firebaseapp.com",
  databaseURL: "https://control-de-asistencia-aef47-default-rtdb.firebaseio.com",
  projectId: "control-de-asistencia-aef47",
  storageBucket: "control-de-asistencia-aef47.firebasestorage.app",
  messagingSenderId: "918828594178",
  appId: "1:918828594178:web:e44ff1902cfc4502fca31b"
};

// Inicialización de Firebase
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Función principal para poblar el contenedor de estudiantes
function cargarEstudiantes() {
  const elGrado = document.getElementById('grado');
  const elAula = document.getElementById('aula');
  const contenedor = document.getElementById('contenedorEstudiantes');

  if (!contenedor) return;

  const grado = elGrado ? elGrado.value.trim() : '';
  const aula = elAula ? elAula.value.trim() : '';

  contenedor.innerHTML = '';

  if (!grado || !aula) {
    contenedor.innerHTML = '<span class="text-muted small">Primero selecciona grado y sección...</span>';
    return;
  }

  // Obtener nómina cargada globalmente
  let lista = [];
  if (typeof window.nominaEstudiantes !== 'undefined' && window.nominaEstudiantes[grado] && window.nominaEstudiantes[grado][aula]) {
    lista = window.nominaEstudiantes[grado][aula];
  } else if (typeof nominaEstudiantes !== 'undefined' && nominaEstudiantes[grado] && nominaEstudiantes[grado][aula]) {
    lista = nominaEstudiantes[grado][aula];
  }

  if (lista.length === 0) {
    contenedor.innerHTML = '<span class="text-muted small">No hay alumnas registradas para este grado y sección.</span>';
    return;
  }

  // Renderizar cada estudiante con su respectivo checkbox
  lista.forEach((estudiante, idx) => {
    const div = document.createElement('div');
    div.className = 'form-check my-1';
    div.innerHTML = `
      <input class="form-check-input chk-estudiante" type="checkbox" value="${estudiante}" id="chk_${idx}">
      <label class="form-check-label small" for="chk_${idx}">
        ${estudiante}
      </label>
    `;
    contenedor.appendChild(div);
  });
}

// Eventos del formulario
document.addEventListener('DOMContentLoaded', () => {
  const elGrado = document.getElementById('grado');
  const elAula = document.getElementById('aula');
  const elForm = document.getElementById('attendanceForm');

  if (elGrado) elGrado.addEventListener('change', cargarEstudiantes);
  if (elAula) elAula.addEventListener('change', cargarEstudiantes);

  // Intento de carga inicial por si ya se seleccionó una opción
  cargarEstudiantes();

  // Envío a Firebase
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
      const fechaFormateada = `${dia}/${mes}/${ano} ${horas}:${minutos}`;

      const docente = document.getElementById('docente')?.value || 'N/A';
      const grado = elGrado?.value || '';
      const aula = elAula?.value || '';
      const area = document.getElementById('area')?.value || 'N/A';
      const estado = document.getElementById('estado')?.value || 'Tardanza';

      const database = firebase.database();
      const promesas = Array.from(checkboxes).map(chk => {
        return database.ref('asistencia').push({
          docente: docente,
          grado: grado,
          aula: aula,
          area: area,
          estudiante: chk.value,
          estado: estado,
          fecha: fechaFormateada,
          fechaFiltro: fechaFiltro
        });
      });

      Promise.all(promesas)
        .then(() => {
          alert(`¡Se registraron con éxito ${checkboxes.length} estudiante(s)!`);
          elForm.reset();
          cargarEstudiantes();
        })
        .catch((error) => {
          console.error("Error al guardar en Firebase:", error);
          alert('Hubo un error al guardar los registros.');
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
