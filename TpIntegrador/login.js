//Login del sistema

const usuariosPersonalSalud = [
  { correo: 'medico@example.com', contrasena: 'Salud123' },
  { correo: 'enfermeria@example.com', contrasena: 'Salud123' }
];

const formularioLogin = document.getElementById('formularioLogin');
const inputCorreo = document.getElementById('inputCorreo');
const inputContrasena = document.getElementById('inputContrasena');
const alertaLogin = document.getElementById('alertaLogin');

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

  // Guardar sesión simple y redirigir al panel del profesional
  sessionStorage.setItem('usuarioCorreo', correo);
  sessionStorage.setItem('usuarioRol', 'staff');

  formularioLogin.reset();
  formularioLogin.classList.remove('was-validated');
  window.location.href = 'viewProfesional.html';
});



