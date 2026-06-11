document.addEventListener('DOMContentLoaded', function () {
  if (localStorage.getItem('accessToken')) {
    window.location.href = '/dashboard';
    return;
  }

  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitBtn = document.getElementById('btn-submit');
  const errorDiv = document.getElementById('login-error');

  form?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
      showError('Por favor completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${window.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!data.success) {
        showError(data.message || 'Credenciales incorrectas');
        return;
      }
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      Swal.fire({
        icon: 'success', title: `¡Bienvenido, ${data.data.user.nombre}!`,
        text: 'Redirigiendo al dashboard...',
        timer: 1500, showConfirmButton: false, timerProgressBar: true,
      }).then(() => { window.location.href = '/dashboard'; });
    } catch {
      showError('Error de conexión. Verifica que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  });

  function showError(msg) {
    if (errorDiv) { errorDiv.textContent = msg; errorDiv.style.display = 'flex'; }
  }

  function setLoading(loading) {
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.innerHTML = loading
        ? '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando sesión...'
        : '<i class="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión';
    }
  }
});
