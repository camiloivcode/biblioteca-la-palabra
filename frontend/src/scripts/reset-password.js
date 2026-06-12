document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('reset-form');
  var passwordInput = document.getElementById('password');
  var confirmInput = document.getElementById('confirm-password');
  var submitBtn = document.getElementById('btn-submit');
  var errorDiv = document.getElementById('reset-error');
  var errorText = document.getElementById('reset-error-text');

  if (!document.getElementById('token').value) return;

  form?.addEventListener('submit', async function (e) {
    e.preventDefault();
    var password = passwordInput.value;
    var confirm = confirmInput.value;

    if (!password || !confirm) {
      showError('Por favor completa todos los campos');
      return;
    }
    if (password.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      showError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    hideError();
    try {
      var response = await fetch(window.API_URL + '/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: document.getElementById('token').value, password }),
      });
      var data = await response.json();
      if (!data.success) {
        showError(data.message || 'Error al restablecer la contraseña');
        return;
      }
      Swal.fire({
        icon: 'success',
        title: 'Contraseña actualizada',
        text: 'Tu contraseña se ha restablecido correctamente. Ahora puedes iniciar sesión.',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true,
      }).then(function () { window.location.href = '/login'; });
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

  function hideError() {
    if (errorDiv) errorDiv.classList.add('hidden');
  }

  function setLoading(loading) {
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.innerHTML = loading
        ? '<span class="material-symbols-outlined animate-spin">sync</span> Restableciendo...'
        : '<span>Restablecer contraseña</span><span class="material-symbols-outlined">lock_reset</span>';
    }
  }
});
