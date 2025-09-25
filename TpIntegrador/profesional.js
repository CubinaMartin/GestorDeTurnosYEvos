// Sesión y panel del profesional

(function() {
  const correoSesion = sessionStorage.getItem('usuarioCorreo');
  const rolSesion = sessionStorage.getItem('usuarioRol');

  if (!correoSesion || rolSesion !== 'staff') {
    window.location.href = 'Login.html';
    return;
  }

  const turnosProximos = [
    { fecha: '2025-09-25 09:00', paciente: 'Juan Pérez', especialidad: 'Clínica', estado: 'Confirmado' },
    { fecha: '2025-09-25 10:30', paciente: 'María Gómez', especialidad: 'Pediatría', estado: 'Pendiente' },
    { fecha: '2025-09-25 11:15', paciente: 'Carlos Ruiz', especialidad: 'Cardiología', estado: 'Confirmado' }
  ];

  const etiquetaUsuario = document.getElementById('etiquetaUsuario');
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');

  function renderizarTurnos() {
    const cuerpo = document.getElementById('tablaProximos');
    if (!cuerpo) return;
    cuerpo.innerHTML = '';
    for (let i = 0; i < turnosProximos.length; i++) {
      const t = turnosProximos[i];
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + t.fecha + '</td>' +
                     '<td>' + t.paciente + '</td>' +
                     '<td>' + t.especialidad + '</td>' +
                     '<td>' + t.estado + '</td>';
      cuerpo.appendChild(tr);
    }
  }

  if (etiquetaUsuario) {
    etiquetaUsuario.textContent = 'Conectado: ' + correoSesion;
  }

  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', function() {
      sessionStorage.removeItem('usuarioCorreo');
      sessionStorage.removeItem('usuarioRol');
      window.location.href = 'Login.html';
    });
  }

  renderizarTurnos();
})();


