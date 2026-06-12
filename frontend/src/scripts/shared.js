window.API_URL = window.API_URL || 'http://localhost:4000/api';

window.showToast = function (icon, title, timer = 3000) {
  Swal.fire({ icon, title, toast: true, position: 'top-end', showConfirmButton: false, timer, timerProgressBar: true, didOpen: (t) => { t.addEventListener('mouseenter', Swal.stopTimer); t.addEventListener('mouseleave', Swal.resumeTimer); } });
};

window.getHeaders = function () {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` };
};

window.estadoBadge = function (estado) {
  var map = {
    ACTIVO: 'bg-primary-fixed text-primary',
    DISPONIBLE: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    MOROSO: 'bg-error-container text-on-error-container',
    SUSPENDIDO: 'bg-surface-variant text-on-surface-variant',
    MORA: 'bg-error-container text-on-error-container',
    DEVUELTO: 'bg-primary-fixed text-primary',
    PRESTADO: 'bg-secondary-fixed text-on-secondary-fixed-variant',
    EN_REPARACION: 'bg-error-container text-on-error-container',
    DADO_DE_BAJA: 'bg-surface-variant text-on-surface-variant',
  };
  var dot = {
    ACTIVO: 'bg-primary',
    DISPONIBLE: 'bg-tertiary-container',
    MOROSO: 'bg-error',
    SUSPENDIDO: 'bg-outline',
    MORA: 'bg-error',
    DEVUELTO: 'bg-primary',
    PRESTADO: 'bg-secondary',
    EN_REPARACION: 'bg-error',
    DADO_DE_BAJA: 'bg-outline',
  };
  var cls = map[estado] || 'bg-surface-variant text-on-surface-variant';
  var dotCls = dot[estado] || 'bg-outline';
  return '<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-sm font-semibold uppercase ' + cls + '"><span class="w-1.5 h-1.5 rounded-full ' + dotCls + '"></span> ' + estado.replace(/_/g, ' ') + '</span>';
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
