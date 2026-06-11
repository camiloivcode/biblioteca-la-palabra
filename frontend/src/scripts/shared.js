window.API_URL = window.API_URL || 'http://localhost:4000/api';

window.showToast = function (icon, title, timer = 3000) {
  Swal.fire({ icon, title, toast: true, position: 'top-end', showConfirmButton: false, timer, timerProgressBar: true, didOpen: (t) => { t.addEventListener('mouseenter', Swal.stopTimer); t.addEventListener('mouseleave', Swal.resumeTimer); } });
};

window.getHeaders = function () {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` };
};

window.estadoBadge = function (estado) {
  const map = {
    ACTIVO: 'badge-activo', DISPONIBLE: 'badge-activo',
    MOROSO: 'badge-moroso', SUSPENDIDO: 'badge-suspendido',
    MORA: 'badge-mora', DEVUELTO: 'badge-devuelto',
    PRESTADO: 'badge-prestado', EN_REPARACION: 'badge-mora', DADO_DE_BAJA: 'badge-suspendido',
  };
  return `<span class="status-badge ${map[estado] || ''}">${estado.replace(/_/g, ' ')}</span>`;
};

window.formatDate = function (dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CO');
};

window.handleApiError = function (err, defaultMsg = 'Error en la solicitud') {
  window.showToast('error', err?.message || defaultMsg, 4000);
};

window.showLoader = function () { document.getElementById('global-loader')?.classList.add('active'); };
window.hideLoader = function () { document.getElementById('global-loader')?.classList.remove('active'); };
