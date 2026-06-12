document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('forgot-form');
  var emailInput = document.getElementById('email');
  var submitBtn = document.getElementById('btn-submit');
  var errorDiv = document.getElementById('forgot-error');
  var errorText = document.getElementById('forgot-error-text');
  var successDiv = document.getElementById('forgot-success');
  var successText = document.getElementById('forgot-success-text');

  form?.addEventListener('submit', async function (e) {
    e.preventDefault();
    var email = emailInput.value.trim();
    if (!email) {
      showError('Por favor ingresa tu correo electrónico');
      return;
    }
    setLoading(true);
    hideMessages();
    try {
      var response = await fetch(window.API_URL + '/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      var data = await response.json();
      if (!data.success) {
        showError(data.message || 'Error al procesar la solicitud');
        return;
      }
      showSuccess('Si el correo existe en el sistema, recibirás un enlace de recuperación.');
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
        : '<span>Enviar enlace</span><span class="material-symbols-outlined">send</span>';
    }
  }
});
