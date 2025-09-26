//Login del sistema

const usuariosPersonalSalud = [
  { correo: 'medico@example.com', contrasena: 'Salud123' },
  { correo: 'enfermeria@example.com', contrasena: 'Salud123' }
];

const formularioLogin = document.getElementById('formularioLogin');
const inputCorreo = document.getElementById('inputCorreo');
const inputContrasena = document.getElementById('inputContrasena');
const alertaLogin = document.getElementById('alertaLogin');
const linkRecuperarContrasena = document.getElementById('linkRecuperarContrasena');
const formRecuperar = document.getElementById('formRecuperar');
const inputRecuperarCorreo = document.getElementById('inputRecuperarCorreo');
const alertaRecuperar = document.getElementById('alertaRecuperar');
const btnEnviarRecuperacion = document.getElementById('btnEnviarRecuperacion');

function mostrarErrorLogin(mensaje) {
  alertaLogin.textContent = mensaje;
  alertaLogin.classList.remove('oculto');
}

function limpiarErrorLogin() {
  alertaLogin.textContent = '';
  alertaLogin.classList.add('oculto');
}

function autenticar(correo, contrasena) {
  const c = String(correo || '').trim().toLowerCase();
  for (let i = 0; i < usuariosPersonalSalud.length; i++) {
    if (usuariosPersonalSalud[i].correo === c && usuariosPersonalSalud[i].contrasena === contrasena) {
      return true;
    }
  }
  return false;
}

formularioLogin.addEventListener('submit', function(e) {
  e.preventDefault();
  limpiarErrorLogin();

  if (!formularioLogin.checkValidity()) {
    formularioLogin.classList.add('was-validated');
    return;
  }

  const correo = inputCorreo.value.trim();
  const contrasena = inputContrasena.value;

  if (!autenticar(correo, contrasena)) {
    mostrarErrorLogin('Credenciales inválidas. Intenta nuevamente.');
    inputContrasena.value = '';
    inputContrasena.focus();
    return;
  }

  // Guardar sesión y redirigir al panel del profesional
  sessionStorage.setItem('usuarioCorreo', correo);
  sessionStorage.setItem('usuarioRol', 'staff');

  formularioLogin.reset();
  formularioLogin.classList.remove('was-validated');
  window.location.href = 'viewProfesional.html';
});


if (linkRecuperarContrasena) {
  linkRecuperarContrasena.addEventListener('click', function(e) {
    e.preventDefault();
    const modalElement = document.getElementById('modalRecuperarContrasena');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  });
}


if (formRecuperar) {
  formRecuperar.addEventListener('submit', function(e) {
    e.preventDefault();
    // reset UI
    alertaRecuperar.classList.add('d-none');
    formRecuperar.classList.remove('was-validated');

    if (!formRecuperar.checkValidity()) {
      formRecuperar.classList.add('was-validated');
      return;
    }

    const correo = String(inputRecuperarCorreo.value || '').trim();
    if (!correo) {
      formRecuperar.classList.add('was-validated');
      return;
    }

    // Simular envío
    if (btnEnviarRecuperacion) {
      btnEnviarRecuperacion.disabled = true;
      btnEnviarRecuperacion.setAttribute('aria-disabled', 'true');
      btnEnviarRecuperacion.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Enviando...';
    }

    setTimeout(function() {
      alertaRecuperar.classList.remove('d-none');
      alertaRecuperar.classList.remove('alert-danger');
      alertaRecuperar.classList.add('alert-success');
      alertaRecuperar.textContent = 'Enlace enviado. Revisá tu correo electrónico.';
      
      

      if (btnEnviarRecuperacion) {
        btnEnviarRecuperacion.disabled = false;
        btnEnviarRecuperacion.removeAttribute('aria-disabled');
        btnEnviarRecuperacion.textContent = 'Enviar enlace';
      }

      inputRecuperarCorreo.value = '';
      formRecuperar.classList.remove('was-validated');
    }, 1200);
  });
}


