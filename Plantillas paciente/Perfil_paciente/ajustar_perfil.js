console.log("JS cargado correctamente");
console.log("profileForm encontrado:", document.getElementById('profileForm'));

document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profileForm');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const alertContainer = document.getElementById('alert-container');
    const formInputs = profileForm.querySelectorAll('input');

    // Guardamos los valores iniciales para usar en "Cancelar"
    const initialValues = {};
    formInputs.forEach(input => {
        initialValues[input.id] = input.value;
    });

    // Función para activar/desactivar modo edición
    function setEditing(isEditing) {
        formInputs.forEach(input => {
            if (input.id === 'email' || input.id === 'telefono' || input.id === 'direccion') {
                input.readOnly = !isEditing;
                input.classList.toggle('bg-light', isEditing); // estilo visual opcional
            }
        });

        editBtn.classList.toggle('d-none', isEditing);
        saveBtn.classList.toggle('d-none', !isEditing);
        cancelBtn.classList.toggle('d-none', !isEditing);
    }

    // Función para mostrar alertas de Bootstrap
    function showAlert(message, type = 'success') {
        const alertEl = document.createElement('div');
        alertEl.className = `alert alert-${type} alert-dismissible fade show`;
        alertEl.setAttribute('role', 'alert');
        alertEl.innerHTML = `
            <strong>${message}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Limpiar alertas previas
        alertContainer.innerHTML = '';
        alertContainer.appendChild(alertEl);

        // Cerrar automáticamente en 5 segundos
        setTimeout(() => {
            if (alertEl.parentNode) {
                if (typeof bootstrap !== 'undefined' && bootstrap && bootstrap.Alert) {
                    try {
                        const bsAlert = new bootstrap.Alert(alertEl);
                        bsAlert.close();
                    } catch (err) {
                        alertEl.remove();
                    }
                } else {
                    alertEl.remove();
                }
            }
        }, 5000);
    }

    // Botón "Editar Perfil"
    editBtn.addEventListener('click', () => {
        setEditing(true);
        alertContainer.innerHTML = ''; // limpia alertas previas
    });

    // Botón "Cancelar"
    cancelBtn.addEventListener('click', () => {
        formInputs.forEach(input => {
            if (initialValues.hasOwnProperty(input.id)) {
                input.value = initialValues[input.id];
            }
        });
        setEditing(false);
        alertContainer.innerHTML = '';
    });

    // Botón "Guardar Cambios" (submit del formulario)
    profileForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const saveSuccessful = true; // simulación de guardado OK

        if (saveSuccessful) {
            console.log("✅ Evento de guardado disparado correctamente");
            // Guardar nuevos valores como iniciales
            formInputs.forEach(input => {
                initialValues[input.id] = input.value;
            });

            // Mostrar confirmación
            showAlert('✅ ¡Cambios guardados exitosamente! Tu perfil ha sido actualizado.', 'success');

            // Volver a modo lectura
            setEditing(false);

        } else {
            // Mostrar error
            showAlert('❌ Error al guardar los cambios. Inténtalo de nuevo.', 'danger');
        }
    });
});
