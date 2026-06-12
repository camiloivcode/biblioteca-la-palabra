document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('register-form');
  var nombreInput = document.getElementById('nombre');
  var emailInput = document.getElementById('email');
  var telefonoInput = document.getElementById('telefono');
  var mensajeInput = document.getElementById('mensaje');
  var submitBtn = document.getElementById('btn-submit');
  var errorDiv = document.getElementById('register-error');
  var errorText = document.getElementById('register-error-text');
  var successDiv = document.getElementById('register-success');
  var successText = document.getElementById('register-success-text');

  form?.addEventListener('submit', async function (e) {
    e.preventDefault();
    var nombre = nombreInput.value.trim();
    var email = emailInput.value.trim();

    if (!nombre || !email) {
      showError('Por favor completa los campos obligatorios');
      return;
    }
    setLoading(true);
    hideMessages();
    try {
      var response = await fetch(window.API_URL + '/auth/register-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          email,
          telefono: telefonoInput.value.trim(),
          mensaje: mensajeInput.value.trim(),
        }),
      });
      var data = await response.json();
      if (!data.success) {
        showError(data.message || 'Error al enviar la solicitud');
        return;
      }
      showSuccess('Tu solicitud ha sido enviada. El administrador se comunicará contigo.');
      form.reset();
    } catch (err) {
      showError('Error de conexión. Verifica que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  });

  function showError(msg) {
    if (errorDiv && errorText) {
      errorText.textContent = msg;
      errorDiv.classList.remove('hidden');
    }
  }

  function showSuccess(msg) {
    if (successDiv && successText) {
      successText.textContent = msg;
      successDiv.classList.remove('hidden');
    }
  }

  function hideMessages() {
    if (errorDiv) errorDiv.classList.add('hidden');
    if (successDiv) successDiv.classList.add('hidden');
  }

  function setLoading(loading) {
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.innerHTML = loading
        ? '<span class="material-symbols-outlined animate-spin">sync</span> Enviando...'
        : '<span>Enviar solicitud</span><span class="material-symbols-outlined">how_to_reg</span>';
    }
  }
});
