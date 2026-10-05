// Cargar lista de estudiantes según Grado y Sección seleccionados
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

// Escuchar cambios en el selector de Grado y Sección
document.getElementById('grado').addEventListener('change', cargarEstudiantes);
document.getElementById('aula').addEventListener('change', cargarEstudiantes);
