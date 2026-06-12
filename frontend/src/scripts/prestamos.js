var currentPage = 1;
var currentFilters = {};

function openPrestModal() {
  document.getElementById('modalPrestamoBackdrop').classList.remove('modal-hidden');
}
function closePrestModal() {
  document.getElementById('modalPrestamoBackdrop').classList.add('modal-hidden');
}

async function loadPrestStats() {
  try {
    var data = await api.get('/reportes/dashboard');
    var p = data.data.prestamos;
    document.getElementById('kpi-activos').textContent = p.activos || '0';
    document.getElementById('kpi-vencidos').textContent = p.vencidos || '0';
    document.getElementById('kpi-mora').textContent = p.mora || '0';
  } catch(e) {}
}

async function cargarPrestamos(page, filters) {
  if (!page) page = 1;
  currentPage = page;
  if (filters) currentFilters = filters;
  try {
    var params = { page: page, limit: 15 };
    if (currentFilters.estado) params.estado = currentFilters.estado;
    var data = await api.get('/prestamos', params);
    var prestamos = data.data;
    var meta = data.meta;
    var tbody = document.getElementById('tbody-prestamos-full');

    if (!prestamos || !prestamos.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="p-md text-center font-body-md text-outline">No se encontraron préstamos</td></tr>';
      updatePrestPagination(meta);
      return;
    }

    var hoy = new Date();
    tbody.innerHTML = prestamos.map(function(p) {
      var fVence = new Date(p.fechaDevolucion);
      var dias = Math.ceil((fVence - hoy) / (1000 * 60 * 60 * 24));
      var badge = '';
      if (p.estado === 'DEVUELTO') {
        badge = '<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-sm font-semibold uppercase bg-tertiary-fixed text-on-tertiary-fixed-variant"><span class="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span> DEVUELTO</span>';
      } else if (p.estado === 'MORA') {
        badge = '<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-sm font-semibold uppercase bg-error-container text-on-error-container"><span class="w-1.5 h-1.5 rounded-full bg-error"></span> EN MORA</span>';
      } else {
        badge = '<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-sm font-semibold uppercase bg-primary-fixed text-primary"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span> ACTIVO</span>';
      }
      var diasHTML = p.estado !== 'DEVUELTO'
        ? '<div class="' + (dias < 0 ? 'text-error' : 'text-on-surface-variant') + ' font-label-md text-xs">' + (dias < 0 ? 'Vencido hace ' + Math.abs(dias) + ' días' : dias + ' días restantes') + '</div>'
        : '';
      return '<tr class="border-b border-outline-variant hover:bg-surface-container transition-colors group">' +
        '<td class="p-md"><span class="font-medium text-on-surface">' + p.socio.apellido + ', ' + p.socio.nombre + '</span><div class="font-label-md text-xs text-on-surface-variant">DNI: ' + p.socio.dni + '</div></td>' +
        '<td class="p-md"><span class="text-on-surface">' + p.material.titulo + '</span><div class="font-label-md text-xs text-on-surface-variant">' + p.material.tipo + (p.material.isbn ? ' \u00b7 ' + p.material.isbn : '') + '</div></td>' +
        '<td class="p-md text-center font-label-md text-sm text-on-surface-variant">' + formatDate(p.fechaPrestamo) + '</td>' +
        '<td class="p-md text-center"><span class="text-on-surface font-medium">' + formatDate(p.fechaDevolucion) + '</span>' + diasHTML + '</td>' +
        '<td class="p-md text-center">' + badge + '</td>' +
        '<td class="p-md text-right"><div class="flex justify-end gap-2">' +
          (p.estado !== 'DEVUELTO'
            ? '<button class="p-2 hover:bg-tertiary-fixed hover:text-tertiary-container rounded-lg transition-colors border-0 bg-transparent cursor-pointer" onclick="registrarDevolucion(' + p.id + ',\'' + p.material.titulo.replace(/'/g, '') + '\')" title="Devolver"><span class="material-symbols-outlined">assignment_return</span></button>'
            : '<span class="text-on-surface-variant font-label-md text-xs italic">Devuelto</span>') +
        '</div></td></tr>';
    }).join('');

    updatePrestPagination(meta);
  } catch (err) {
    document.getElementById('tbody-prestamos-full').innerHTML = '<tr><td colspan="6" class="p-md text-center font-body-md text-error">Error: ' + err.message + '</td></tr>';
  }
}

function updatePrestPagination(meta) {
  if (!meta) return;
  document.getElementById('pag-prestamos-info').textContent = 'Mostrando ' + (meta.page || '1') + ' de ' + (meta.totalPages || '1') + ' páginas';
  var btns = document.getElementById('pag-prestamos-btns');
  btns.innerHTML = '';
  for (var p = 1; p <= meta.totalPages && p <= 7; p++) {
    (function(pageNum) {
      var btn = document.createElement('button');
      btn.className = 'w-8 h-8 rounded font-label-md transition-colors border-0 cursor-pointer ' + (pageNum === meta.page ? 'bg-primary text-on-primary' : 'hover:bg-surface-variant text-on-surface');
      btn.textContent = pageNum;
      btn.onclick = function() { cargarPrestamos(pageNum); };
      btns.appendChild(btn);
    })(p);
  }
  if (meta.totalPages > 7) {
    var ellipsis = document.createElement('span');
    ellipsis.className = 'w-8 h-8 flex items-center justify-center';
    ellipsis.textContent = '...';
    btns.appendChild(ellipsis);
    (function() {
      var btn = document.createElement('button');
      btn.className = 'w-8 h-8 rounded hover:bg-surface-variant font-label-md transition-colors border-0 cursor-pointer';
      btn.textContent = meta.totalPages;
      btn.onclick = function() { cargarPrestamos(meta.totalPages); };
      btns.appendChild(btn);
    })();
  }
}

async function cargarSelectsPrestamo() {
  try {
    var [sociosData, materialesData] = await Promise.all([
      api.get('/socios', { limit: 200 }),
      api.get('/materiales', { estado: 'DISPONIBLE', limit: 200 }),
    ]);
    var selSocio = document.getElementById('prestamo-socio');
    var selMaterial = document.getElementById('prestamo-material');
    selSocio.innerHTML = '<option value="">Selecciona un socio...</option>';
    selMaterial.innerHTML = '<option value="">Selecciona un material disponible...</option>';
    (sociosData.data || []).filter(function(s) { return s.estado === 'ACTIVO'; }).forEach(function(s) {
      var opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.apellido + ', ' + s.nombre + ' \u2014 DNI: ' + s.dni;
      selSocio.appendChild(opt);
    });
    (materialesData.data || []).forEach(function(m) {
      var opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.titulo + ' (' + m.tipo + ') \u2014 ' + (m.autor ? m.autor.apellido + ', ' + m.autor.nombre : '');
      selMaterial.appendChild(opt);
    });
  } catch (err) { console.error('Error cargando selects:', err); }
}

window.registrarDevolucion = async function(id, titulo) {
  var result = await Swal.fire({
    title: 'Registrar Devoluc\u00f3n',
    html: '\u00bfConfirmas la devoluci\u00f3n de <strong>' + titulo + '</strong>?',
    icon: 'question', showCancelButton: true,
    confirmButtonColor: '#10b981', cancelButtonColor: '#6b7280',
    confirmButtonText: 'S\u00ed, devolver', cancelButtonText: 'Cancelar',
  });
  if (!result.isConfirmed) return;
  try {
    showLoader();
    await api.patch('/prestamos/' + id + '/devolver');
    showToast('success', '\u0022' + titulo + '\u0022 devuelto correctamente');
    cargarPrestamos(currentPage, currentFilters);
  } catch (err) { showToast('error', err.message); }
  finally { hideLoader(); }
};

document.addEventListener('DOMContentLoaded', function() {
  loadPrestStats();
  cargarPrestamos();

  document.querySelectorAll('.modal-close-prestamo').forEach(function(el) {
    el.addEventListener('click', closePrestModal);
  });

  document.getElementById('btn-nuevo-prestamo').addEventListener('click', async function() {
    var sel = document.getElementById('prestamo-socio');
    if (sel.options.length <= 1) await cargarSelectsPrestamo();
    document.getElementById('form-prestamo').reset();
    openPrestModal();
  });

  document.getElementById('form-prestamo').addEventListener('submit', async function(e) {
    e.preventDefault();
    var socioId = document.getElementById('prestamo-socio').value;
    var materialId = document.getElementById('prestamo-material').value;
    var observaciones = document.getElementById('prestamo-obs').value.trim();
    if (!socioId || !materialId) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Selecciona socio y material.' });
      return;
    }
    try {
      showLoader();
      var data = await api.post('/prestamos', { socioId: parseInt(socioId), materialId: parseInt(materialId), observaciones: observaciones || null });
      closePrestModal();
      Swal.fire({
        icon: 'success', title: 'Pr\u00e9stamo registrado',
        html: 'Pr\u00e9stamo para <strong>' + data.data.socio.nombre + ' ' + data.data.socio.apellido + '</strong> creado correctamente.<br><small>Vence el: ' + formatDate(data.data.fechaDevolucion) + '</small>',
        confirmButtonColor: '#1E3A5F',
      });
      cargarPrestamos(1, {});
    } catch (err) { showToast('error', err.message); }
    finally { hideLoader(); }
  });

  document.getElementById('btn-actualizar-mora').addEventListener('click', async function() {
    var result = await Swal.fire({
      title: 'Actualizar Mora',
      text: '¿Marcar como morosos los préstamos vencidos y suspender a los socios?',
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, actualizar', cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      showLoader();
      var resp = await api.patch('/prestamos/actualizar-mora');
      showToast('success', resp.message || 'Mora actualizada correctamente');
      loadPrestStats();
      cargarPrestamos(1, {});
    } catch (err) { showToast('error', err.message); }
    finally { hideLoader(); }
  });

  document.getElementById('btn-filtrar-prestamo').addEventListener('click', function() {
    var estado = document.getElementById('filtro-estado-prestamo').value;
    var filters = {};
    if (estado) filters.estado = estado;
    cargarPrestamos(1, filters);
  });
});
