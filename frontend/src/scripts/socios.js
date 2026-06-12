var currentPage = 1;
var currentFilters = {};
var editingId = null;

function openModal() {
  document.getElementById('modalSocioBackdrop').classList.remove('modal-hidden');
}

function closeModal() {
  document.getElementById('modalSocioBackdrop').classList.add('modal-hidden');
}

async function cargarSocios(page, filters) {
  if (!page) page = 1;
  currentPage = page;
  if (filters) currentFilters = filters;
  try {
    var data = await api.get('/socios', { page: page, limit: 15, ...currentFilters });
    var socios = data.data;
    var meta = data.meta;
    var tbody = document.getElementById('tbody-socios');

    if (!socios || !socios.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="px-lg py-8 text-center font-body-md text-outline">No se encontraron socios</td></tr>';
      return;
    }

    tbody.innerHTML = socios.map(function(s) {
      var initials = (s.nombre.charAt(0) + s.apellido.charAt(0)).toUpperCase();
      var badgeClass, dotClass;
      if (s.estado === 'ACTIVO') { badgeClass = 'bg-tertiary-fixed-dim text-on-tertiary-fixed-variant'; dotClass = 'bg-tertiary'; }
      else if (s.estado === 'MOROSO' || s.estado === 'MORA') { badgeClass = 'bg-error-container text-on-error-container'; dotClass = 'bg-error'; }
      else { badgeClass = 'bg-surface-container-highest text-on-surface-variant'; dotClass = 'bg-outline'; }
      return '<tr class="hover:bg-surface-bright transition-colors group">' +
        '<td class="px-lg py-5"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-label-md">' + initials + '</div><div><p class="text-body-md font-semibold text-on-surface">' + s.apellido + ', ' + s.nombre + '</p><p class="text-label-sm text-outline">' + (s.email || '—') + '</p></div></div></td>' +
        '<td class="px-lg py-5 text-body-md text-on-surface">' + s.dni + '</td>' +
        '<td class="px-lg py-5 text-body-md text-on-surface">' + (s.telefono || '—') + '</td>' +
        '<td class="px-lg py-5"><span class="font-mono font-bold text-primary">' + (s._count ? s._count.prestamos : 0) + '</span></td>' +
        '<td class="px-lg py-5"><span class="px-3 py-1 rounded-full text-label-sm ' + badgeClass + ' flex items-center w-fit gap-1"><span class="w-1.5 h-1.5 rounded-full ' + dotClass + '"></span>' + s.estado + '</span></td>' +
        '<td class="px-lg py-5 text-right"><div class="flex justify-end gap-1">' +
        '<button class="p-2 text-outline hover:text-primary transition-colors material-symbols-outlined" onclick="editarSocio(' + s.id + ')" title="Editar">edit</button>' +
        '<button class="p-2 text-outline hover:text-error transition-colors material-symbols-outlined" onclick="eliminarSocio(' + s.id + ',\'' + s.apellido + ', ' + s.nombre + '\')" title="Eliminar">delete</button>' +
        '</div></td></tr>';
    }).join('');

    document.getElementById('paginacion-info').textContent = 'Mostrando ' + socios.length + ' de ' + meta.total + ' socios';
    var btns = document.getElementById('paginacion-btns');
    btns.innerHTML = '';
    var prevBtn = document.createElement('button');
    prevBtn.className = 'p-2 rounded-lg hover:bg-surface-container-high text-outline transition-colors border-0 bg-transparent cursor-pointer' + (meta.page <= 1 ? ' opacity-40' : '');
    prevBtn.innerHTML = '<span class="material-symbols-outlined">chevron_left</span>';
    if (meta.page > 1) prevBtn.onclick = function() { cargarSocios(meta.page - 1); };
    btns.appendChild(prevBtn);
    for (var p = 1; p <= meta.totalPages; p++) {
      (function(pageNum) {
        var btn = document.createElement('button');
        btn.className = 'w-8 h-8 rounded font-label-md transition-colors border-0 cursor-pointer ' + (pageNum === meta.page ? 'bg-primary text-on-primary' : 'hover:bg-surface-variant text-on-surface');
        btn.textContent = pageNum;
        btn.onclick = function() { cargarSocios(pageNum); };
        btns.appendChild(btn);
      })(p);
    }
    var nextBtn = document.createElement('button');
    nextBtn.className = 'p-2 rounded-lg hover:bg-surface-container-high text-outline transition-colors border-0 bg-transparent cursor-pointer' + (meta.page >= meta.totalPages ? ' opacity-40' : '');
    nextBtn.innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';
    if (meta.page < meta.totalPages) nextBtn.onclick = function() { cargarSocios(meta.page + 1); };
    btns.appendChild(nextBtn);
  } catch (err) {
    document.getElementById('tbody-socios').innerHTML = '<tr><td colspan="6" class="px-lg py-8 text-center font-body-md text-error">Error: ' + err.message + '</td></tr>';
  }
}

window.editarSocio = async function(id) {
  try {
    showLoader();
    var data = await api.get('/socios/' + id);
    var s = data.data;
    editingId = id;
    document.getElementById('socio-id').value = s.id;
    document.getElementById('socio-nombre').value = s.nombre;
    document.getElementById('socio-apellido').value = s.apellido;
    document.getElementById('socio-dni').value = s.dni;
    document.getElementById('socio-email').value = s.email || '';
    document.getElementById('socio-telefono').value = s.telefono || '';
    document.getElementById('socio-direccion').value = s.direccion || '';
    document.getElementById('socio-fechanac').value = s.fechaNac ? s.fechaNac.substring(0, 10) : '';
    document.getElementById('modal-title-socio').innerHTML = 'Editar Socio';
    openModal();
  } catch (err) {
    showToast('error', err.message);
  } finally {
    hideLoader();
  }
};

window.eliminarSocio = async function(id, nombre) {
  var result = await Swal.fire({
    title: '¿Eliminar socio?',
    html: 'Se eliminará a <strong>' + nombre + '</strong>. Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ba1a1a',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });
  if (!result.isConfirmed) return;
  try {
    showLoader();
    await api.del('/socios/' + id);
    showToast('success', 'Socio eliminado');
    cargarSocios(currentPage);
  } catch (err) {
    showToast('error', err.message);
  } finally {
    hideLoader();
  }
};

document.addEventListener('DOMContentLoaded', function() {
  cargarSocios();

  document.getElementById('btn-nuevo-socio').addEventListener('click', function() {
    editingId = null;
    document.getElementById('form-socio').reset();
    document.getElementById('socio-id').value = '';
    document.getElementById('modal-title-socio').innerHTML = 'Registrar Nuevo Socio';
    openModal();
  });

  document.querySelectorAll('.modal-close').forEach(function(el) {
    el.addEventListener('click', closeModal);
  });

  document.getElementById('form-socio').addEventListener('submit', async function(e) {
    e.preventDefault();
    var body = {
      nombre: document.getElementById('socio-nombre').value.trim(),
      apellido: document.getElementById('socio-apellido').value.trim(),
      dni: document.getElementById('socio-dni').value.trim(),
      email: document.getElementById('socio-email').value.trim(),
      telefono: document.getElementById('socio-telefono').value.trim(),
      direccion: document.getElementById('socio-direccion').value.trim(),
      fechaNac: document.getElementById('socio-fechanac').value || null,
    };
    if (!body.nombre || !body.apellido || !body.dni) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Nombre, apellido y DNI son obligatorios.' });
      return;
    }
    try {
      showLoader();
      if (editingId) {
        await api.put('/socios/' + editingId, body);
        showToast('success', 'Socio actualizado');
      } else {
        await api.post('/socios', body);
        showToast('success', 'Socio registrado');
      }
      closeModal();
      cargarSocios(currentPage);
    } catch (err) {
      showToast('error', err.errors ? err.errors.map(function(e) { return e.message; }).join('. ') : err.message);
    } finally {
      hideLoader();
    }
  });

  document.getElementById('btn-filtrar').addEventListener('click', function() {
    var filters = {};
    var search = document.getElementById('filtro-search').value.trim();
    if (search) filters.search = search;
    var estados = [];
    if (document.getElementById('filtro-activo').checked) estados.push('ACTIVO');
    if (document.getElementById('filtro-moroso').checked) estados.push('MOROSO');
    if (document.getElementById('filtro-inactivo').checked) estados.push('SUSPENDIDO', 'INACTIVO');
    if (document.getElementById('filtro-suspendido').checked) estados.push('SUSPENDIDO');
    if (estados.length > 0) filters.estado = estados.join(',');
    cargarSocios(1, filters);
  });

  document.getElementById('btn-limpiar-filtros').addEventListener('click', function() {
    document.getElementById('filtro-search').value = '';
    document.querySelectorAll('#filtro-activo, #filtro-inactivo, #filtro-moroso, #filtro-suspendido').forEach(function(cb) { cb.checked = false; });
    document.getElementById('filtro-activo').checked = true;
    cargarSocios(1, {});
  });
});
