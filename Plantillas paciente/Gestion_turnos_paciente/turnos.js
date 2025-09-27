document.addEventListener('DOMContentLoaded', function () {
  // ----- helpers fecha / alert -----
  const todayStr = new Date().toISOString().split('T')[0];

  function parseDate(dateStr) {
    if (!dateStr) return NaN;
    const s = dateStr.trim();
    // formato DD/MM/YYYY
    if (s.includes('/')) {
      const parts = s.split('/');
      if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    // formato con guiones: YYYY-MM-DD o DD-MM-YYYY
    if (s.includes('-')) {
      const parts = s.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) return new Date(parts[0], parts[1] - 1, parts[2]); // YYYY-MM-DD
        return new Date(parts[2], parts[1] - 1, parts[0]); // DD-MM-YYYY
      }
    }
    const d = new Date(s);
    return isNaN(d) ? NaN : d;
  }
// nuevo
  function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')                   // separa acentos de letras
    .replace(/[\u0300-\u036f]/g, '')    // elimina los acentos
    .trim();
}

//para arriba es lo nuevo


  function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alert);
    setTimeout(() => { try { alert.remove(); } catch (e) {} }, 4000);
  }

  // ----- elementos -----
  const filtroFechaInput = document.getElementById('filtro-fecha');
  const filtroFechaEstudioInput = document.getElementById('filtro-fecha-estudio');
  const filtroEspecialidadSelect = document.getElementById('filtro-especialidad');
  const filtroPersonalSelect = document.getElementById('filtro-personal-salud');
  const filtroEstudioSelect = document.getElementById('filtro-estudio');
  const nuevaFechaInput = document.getElementById('nueva-fecha');

  if (filtroFechaInput) filtroFechaInput.min = todayStr;
  if (filtroFechaEstudioInput) filtroFechaEstudioInput.min = todayStr;
  if (nuevaFechaInput) nuevaFechaInput.min = todayStr;

  const tablaDisponibles = document.getElementById('tabla-disponibles'); // tbody consultas
  const tablaEstudios = document.getElementById('tabla-estudios');       // tbody estudios
  const tablaHistorial = document.getElementById('tabla-historial');     // tbody historial

  const modalSolicitarEl = document.getElementById('modalSolicitar');
  const modalSolicitar = modalSolicitarEl ? new bootstrap.Modal(modalSolicitarEl) : null;
  const modalCancelar = new bootstrap.Modal(document.getElementById('modalCancelar'));
  const modalReprogramar = new bootstrap.Modal(document.getElementById('modalReprogramar'));

  const btnConfirmarSolicitud = document.getElementById('btn-confirmar-solicitud');
  const btnConfirmarCancelacion = document.getElementById('btn-confirmar-cancelacion');
  const btnConfirmarReprogramacion = document.getElementById('btn-confirmar-reprogramacion');

  let turnoSeleccionado = null;

  // ----- aplicar filtro genérico -----
  function applyFilterToTable(tbody, evaluateRowFn, noResultsColspan, noResultsMessage) {
    if (!tbody) return;
    const existingNr = tbody.querySelector('.no-results');
    if (existingNr) existingNr.remove();

    const rows = Array.from(tbody.querySelectorAll('tr'));
    let visibleCount = 0;

    rows.forEach(row => {
      // ignorar filas que sean el no-results
      if (row.classList.contains('no-results')) return;
      const visible = evaluateRowFn(row);
      row.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });

    if (visibleCount === 0) {
      const tr = document.createElement('tr');
      tr.className = 'no-results';
      tr.innerHTML = `<td colspan="${noResultsColspan}" class="text-center text-muted py-3">${noResultsMessage}</td>`;
      tbody.appendChild(tr);
    }
  }

  // ----- formularios de búsqueda -----
  const formConsultas = document.getElementById('filtros-turnos');
  if (formConsultas && tablaDisponibles) {
    formConsultas.addEventListener('submit', function (e) {
      e.preventDefault();

      console.log('Filas encontradas en tablaDisponibles:', tablaDisponibles.querySelectorAll('tr').length);
 

     const filterEspText = filtroEspecialidadSelect && filtroEspecialidadSelect.value
  ? normalizeText(filtroEspecialidadSelect.options[filtroEspecialidadSelect.selectedIndex].text)
  : '';
const filterProfText = filtroPersonalSelect && filtroPersonalSelect.value
  ? normalizeText(filtroPersonalSelect.options[filtroPersonalSelect.selectedIndex].text)
  : '';



        const fechaFiltroStr = filtroFechaInput ? filtroFechaInput.value : '';
      const fechaFiltro = fechaFiltroStr ? parseDate(fechaFiltroStr) : null;

      applyFilterToTable(tablaDisponibles, (row) => {

        const profesional = normalizeText(row.cells[0]?.textContent || ''); //nuevo
const especialidad = normalizeText(row.cells[1]?.textContent || ''); //nuevo

        
        const fechaRowStr = (row.cells[2]?.textContent || '').trim();
        const fechaRow = parseDate(fechaRowStr);

        if (filterEspText && !especialidad.includes(filterEspText)) return false;
        if (filterProfText && !profesional.includes(filterProfText)) return false;
        if (fechaFiltro && (isNaN(fechaRow) || fechaRow.getTime() < fechaFiltro.getTime())) return false;
        return true;
      }, 5, 'No se encontraron turnos de consultas con esos filtros.');
    });
  }

  const formEstudios = document.getElementById('filtros-estudios');
  if (formEstudios && tablaEstudios) {
    formEstudios.addEventListener('submit', function (e) {
      e.preventDefault();
      const filtroEstudioText = filtroEstudioSelect && filtroEstudioSelect.value
        ? filtroEstudioSelect.options[filtroEstudioSelect.selectedIndex].text.trim().toLowerCase()
        : '';
      const fechaFiltroStr = filtroFechaEstudioInput ? filtroFechaEstudioInput.value : '';
      const fechaFiltro = fechaFiltroStr ? parseDate(fechaFiltroStr) : null;

      applyFilterToTable(tablaEstudios, (row) => {
        // columnas: Estudio(0), Fecha(1), Hora(2)
        const estudio = (row.cells[0]?.textContent || '').trim().toLowerCase();
        const fechaRowStr = (row.cells[1]?.textContent || '').trim();
        const fechaRow = parseDate(fechaRowStr);

        if (filtroEstudioText && !estudio.includes(filtroEstudioText)) return false;
        if (fechaFiltro && (isNaN(fechaRow) || fechaRow.getTime() < fechaFiltro.getTime())) return false;
        return true;
      }, 4, 'No se encontraron turnos de estudios con esos filtros.');
    });
  }

  // ----- pedir turno (consultas) -----
  if (tablaDisponibles) {
    tablaDisponibles.addEventListener('click', function (e) {
      if (e.target.classList.contains('btn-solicitar')) {
        const fila = e.target.closest('tr');
        // ojo a los índices (coinciden con tu HTML)
        const medico = (fila.cells[0]?.textContent || '').trim();
        const especialidad = (fila.cells[1]?.textContent || '').trim();
        const fecha = (fila.cells[2]?.textContent || '').trim();
        const hora = (fila.cells[3]?.textContent || '').trim();

        turnoSeleccionado = { tipo: 'consulta', medico, especialidad, fecha, hora, fila };
        document.getElementById('detalle-solicitud').innerHTML =
          `<strong>Médico:</strong> ${medico}<br><strong>Especialidad:</strong> ${especialidad}<br><strong>Fecha:</strong> ${fecha} - ${hora}`;
        if (modalSolicitar) modalSolicitar.show();
      }
    });
  }

  // ----- pedir turno (estudios) -----
  if (tablaEstudios) {
    tablaEstudios.addEventListener('click', function (e) {
      if (e.target.classList.contains('btn-solicitar')) {
        const fila = e.target.closest('tr');
        const estudio = (fila.cells[0]?.textContent || '').trim();
        const fecha = (fila.cells[1]?.textContent || '').trim();
        const hora = (fila.cells[2]?.textContent || '').trim();

        turnoSeleccionado = { tipo: 'estudio', estudio, fecha, hora, fila };
        document.getElementById('detalle-solicitud').innerHTML =
          `<strong>Estudio:</strong> ${estudio}<br><strong>Fecha:</strong> ${fecha} - ${hora}`;
        if (modalSolicitar) modalSolicitar.show();
      }
    });
  }

  // ----- agregar fila al historial -----
  function addToHistorial(obj) {
    if (!tablaHistorial) return;
    const tr = document.createElement('tr');

    if (obj.tipo === 'consulta') {
      tr.innerHTML = `
        <td>${obj.medico}</td>
        <td>${obj.especialidad || ''}</td>
        <td>${obj.fecha}</td>
        <td>${obj.hora}</td>
        <td class="text-center"><span class="badge bg-primary">Confirmado</span></td>
        <td class="text-center btn-group">
          <button class="btn btn-warning btn-sm btn-reprogramar">Reprogramar</button>
          <button class="btn btn-danger btn-sm btn-cancelar">Cancelar</button>
        </td>`;
    } else { // estudio
      tr.innerHTML = `
        <td>${obj.estudio}</td>
        <td>Estudio</td>
        <td>${obj.fecha}</td>
        <td>${obj.hora}</td>
        <td class="text-center"><span class="badge bg-primary">Confirmado</span></td>
        <td class="text-center btn-group">
          <button class="btn btn-warning btn-sm btn-reprogramar">Reprogramar</button>
          <button class="btn btn-danger btn-sm btn-cancelar">Cancelar</button>
        </td>`;
    }

    tablaHistorial.appendChild(tr);
  }

  // ----- confirmar solicitud (común) -----
  if (btnConfirmarSolicitud) {
    btnConfirmarSolicitud.addEventListener('click', function () {
      if (!turnoSeleccionado) return;

      let mensaje;
      if (turnoSeleccionado.tipo === 'consulta') {
        mensaje = `Turno con <strong>${turnoSeleccionado.medico}</strong> reservado para el <strong>${turnoSeleccionado.fecha}</strong> a las <strong>${turnoSeleccionado.hora}</strong>.`;
        addToHistorial(turnoSeleccionado);
      } else {
        mensaje = `Turno de <strong>${turnoSeleccionado.estudio}</strong> reservado para el <strong>${turnoSeleccionado.fecha}</strong> a las <strong>${turnoSeleccionado.hora}</strong>.`;
        addToHistorial(turnoSeleccionado);
      }

      showAlert(mensaje, 'success');

      // eliminar fila de la tabla de disponibles/estudios (si existe)
      try { if (turnoSeleccionado.fila) turnoSeleccionado.fila.remove(); } catch (e) {}
      turnoSeleccionado = null;
      if (modalSolicitar) modalSolicitar.hide();
    });
  }

  // ----- historial: reprogramar / cancelar (delegación) -----
  if (tablaHistorial) {
    tablaHistorial.addEventListener('click', function (e) {
      const fila = e.target.closest('tr');
      if (!fila) return;

      const medico = (fila.cells[0]?.textContent || '').trim();
      const fecha = (fila.cells[2]?.textContent || '').trim();
      const hora = (fila.cells[3]?.textContent || '').trim();

      if (e.target.classList.contains('btn-cancelar')) {
        turnoSeleccionado = { medico, fecha, hora, fila };
        document.getElementById('detalle-cancelacion').innerHTML =
          `<strong>Profesional / Estudio:</strong> ${medico}<br><strong>Fecha:</strong> ${fecha} - ${hora}`;
        modalCancelar.show();
      }

      if (e.target.classList.contains('btn-reprogramar')) {
        turnoSeleccionado = { medico, fila };
        document.getElementById('detalle-reprogramacion').innerHTML =
          `<strong>Profesional / Estudio:</strong> ${medico}`;
        modalReprogramar.show();
      }
    });
  }

  // ----- confirmar cancelación -----
  if (btnConfirmarCancelacion) {
    btnConfirmarCancelacion.addEventListener('click', function () {
      if (!turnoSeleccionado) return;
      modalCancelar.hide();
      showAlert(`El turno con <strong>${turnoSeleccionado.medico}</strong> ha sido cancelado.`, 'danger');

      const estado = turnoSeleccionado.fila.querySelector('.badge');
      const acciones = turnoSeleccionado.fila.cells[5];
      if (estado) { estado.className = 'badge bg-secondary'; estado.textContent = 'Cancelado'; }
      if (acciones) acciones.innerHTML = '';
      turnoSeleccionado = null;
    });
  }

  // ----- confirmar reprogramación -----
  if (btnConfirmarReprogramacion) {
    btnConfirmarReprogramacion.addEventListener('click', function () {
      const nuevaFecha = document.getElementById('nueva-fecha').value;
      const nuevaHora = document.getElementById('nueva-hora').value;
      if (!nuevaFecha || !nuevaHora) { showAlert('Por favor, selecciona una nueva fecha y hora.', 'warning'); return; }
      if (parseDate(nuevaFecha) < parseDate(todayStr)) { showAlert('La fecha seleccionada no puede ser anterior al día de hoy.', 'danger'); return; }

      modalReprogramar.hide();
      if (turnoSeleccionado && turnoSeleccionado.fila) {
        showAlert(`Turno con <strong>${turnoSeleccionado.medico}</strong> reprogramado para el ${nuevaFecha} a las ${nuevaHora}.`, 'info');
        turnoSeleccionado.fila.cells[2].textContent = nuevaFecha;
        turnoSeleccionado.fila.cells[3].textContent = nuevaHora;
        document.getElementById('form-reprogramar').reset();
        turnoSeleccionado = null;
      }
    });
  }

}); // DOMContentLoaded
