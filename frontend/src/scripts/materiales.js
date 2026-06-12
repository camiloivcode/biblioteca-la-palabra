var currentPage = 1;
var currentFilters = {};
var editingId = null;

function openMatModal() {
  document.getElementById('modalMaterialBackdrop').classList.remove('modal-hidden');
}
function closeMatModal() {
  document.getElementById('modalMaterialBackdrop').classList.add('modal-hidden');
}

async function loadMatStats() {
  try {
    var data = await api.get('/reportes/dashboard');
    var m = data.data.materiales;
    document.getElementById('stat-total').textContent = m.total || '0';
    document.getElementById('stat-disponibles').textContent = m.disponibles || '0';
    document.getElementById('stat-prestados').textContent = (m.total - m.disponibles) || '0';
    document.getElementById('stat-mora').textContent = '0';
  } catch(e) {}
}

async function cargarMateriales(page, filters) {
  if (!page) page = 1;
  currentPage = page;
  if (filters) currentFilters = filters;
  try {
    var data = await api.get('/materiales', { page: page, limit: 15, ...currentFilters });
    var materiales = data.data;
    var meta = data.meta;
    var tbody = document.getElementById('tbody-materiales');

    if (!materiales || !materiales.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="p-md text-center font-body-md text-outline">No se encontraron materiales</td></tr>';
      updateMatPagination(meta);
      return;
    }

    tbody.innerHTML = materiales.map(function(m) {
      var catBadge = m.categoria ? '<span class="px-3 py-1 rounded-full bg-surface-variant text-on-surface-variant text-label-sm uppercase">' + m.categoria.nombre + '</span>' : '—';
      var estadoBadge = m.estado === 'DISPONIBLE'
        ? '<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-sm font-semibold uppercase bg-tertiary-fixed text-on-tertiary-fixed-variant"><span class="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span> DISPONIBLE</span>'
        : '<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-sm font-semibold uppercase bg-secondary-fixed text-on-secondary-fixed-variant"><span class="w-1.5 h-1.5 rounded-full bg-secondary"></span> PRESTADO</span>';
      return '<tr class="border-b border-outline-variant hover:bg-surface-container transition-colors group">' +
        '<td class="p-md font-mono text-xs text-on-surface-variant">' + (m.id || '—') + '</td>' +
        '<td class="p-md"><span class="font-medium text-on-surface group-hover:text-primary transition-colors">' + m.titulo + '</span></td>' +
        '<td class="p-md">' + catBadge + '</td>' +
        '<td class="p-md">' + estadoBadge + '</td>' +
        '<td class="p-md text-right"><div class="flex justify-end gap-2">' +
        '<button class="p-2 hover:bg-primary-fixed hover:text-primary rounded-lg transition-colors border-0 bg-transparent cursor-pointer" onclick="editarMaterial(' + m.id + ')" title="Editar"><span class="material-symbols-outlined">edit</span></button>' +
        '<button class="p-2 hover:bg-secondary-container hover:text-secondary rounded-lg transition-colors border-0 bg-transparent cursor-pointer" onclick="eliminarMaterial(' + m.id + ',\'' + m.titulo.replace(/'/g, '') + '\')" title="Eliminar"><span class="material-symbols-outlined">delete</span></button>' +
        '</div></td></tr>';
    }).join('');

    updateMatPagination(meta);
  } catch (err) {
    document.getElementById('tbody-materiales').innerHTML = '<tr><td colspan="5" class="p-md text-center font-body-md text-error">Error: ' + err.message + '</td></tr>';
  }
}

function updateMatPagination(meta) {
  if (!meta) return;
  document.getElementById('pag-mat-info').textContent = 'Mostrando ' + (meta.page || '1') + ' de ' + (meta.totalPages || '1') + ' páginas';
  var btns = document.getElementById('pag-mat-btns');
  btns.innerHTML = '';
  for (var p = 1; p <= meta.totalPages && p <= 7; p++) {
    (function(pageNum) {
      var btn = document.createElement('button');
      btn.className = 'w-8 h-8 rounded font-label-md transition-colors border-0 cursor-pointer ' + (pageNum === meta.page ? 'bg-primary text-on-primary' : 'hover:bg-surface-variant text-on-surface');
      btn.textContent = pageNum;
      btn.onclick = function() { cargarMateriales(pageNum); };
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
      btn.onclick = function() { cargarMateriales(meta.totalPages); };
      btns.appendChild(btn);
    })();
  }
  document.getElementById('pag-prev').disabled = meta.page <= 1;
  document.getElementById('pag-next').disabled = meta.page >= meta.totalPages;
  document.getElementById('pag-prev').className = 'flex items-center gap-1 transition-colors border-0 bg-transparent cursor-pointer ' + (meta.page <= 1 ? 'text-outline opacity-40' : 'text-on-surface-variant hover:text-primary');
  document.getElementById('pag-next').className = 'flex items-center gap-1 transition-colors border-0 bg-transparent cursor-pointer ' + (meta.page >= meta.totalPages ? 'text-outline opacity-40' : 'text-on-surface-variant hover:text-primary');
  document.getElementById('pag-prev').onclick = function() { if (meta.page > 1) cargarMateriales(meta.page - 1); };
  document.getElementById('pag-next').onclick = function() { if (meta.page < meta.totalPages) cargarMateriales(meta.page + 1); };
}

async function cargarSelectsMaterial() {
  try {
    var autData = await api.get('/autores');
    var catData = await api.get('/categorias');
    var selAutor = document.getElementById('mat-autor');
    var selCat = document.getElementById('mat-categoria');
    selAutor.innerHTML = '<option value="">Seleccionar autor...</option>';
    selCat.innerHTML = '<option value="">Seleccionar...</option>';
    (autData.data || []).forEach(function(a) {
      var opt = document.createElement('option');
      opt.value = a.id;
      opt.textContent = a.apellido + ', ' + a.nombre;
      selAutor.appendChild(opt);
    });
    (catData.data || []).forEach(function(c) {
      var opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nombre;
      selCat.appendChild(opt);
    });
  } catch (err) { console.error('Error cargando selects:', err); }
}

window.editarMaterial = async function(id) {
  try {
    showLoader();
    if (document.getElementById('mat-autor').options.length <= 1) await cargarSelectsMaterial();
    var data = await api.get('/materiales/' + id);
    var m = data.data;
    editingId = id;
    document.getElementById('material-id').value = m.id;
    document.getElementById('mat-titulo').value = m.titulo;
    document.getElementById('mat-tipo').value = m.tipo;
    document.getElementById('mat-isbn').value = m.isbn || '';
    document.getElementById('mat-anio').value = m.anioPubl || '';
    document.getElementById('mat-autor').value = m.autorId || '';
    document.getElementById('mat-categoria').value = m.categoriaId || '';
    document.getElementById('mat-stock').value = m.stock || 1;
    document.getElementById('mat-desc').value = m.descripcion || '';
    document.getElementById('modal-title-material').textContent = 'Editar Material';
    openMatModal();
  } catch (err) { showToast('error', err.message); }
  finally { hideLoader(); }
};

window.eliminarMaterial = async function(id, titulo) {
  var result = await Swal.fire({
    title: '¿Eliminar material?',
    html: 'Se eliminará <strong>' + titulo + '</strong>.',
    icon: 'warning', showCancelButton: true,
    confirmButtonColor: '#ba1a1a', confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar',
  });
  if (!result.isConfirmed) return;
  try {
    showLoader();
    await api.del('/materiales/' + id);
    showToast('success', 'Material eliminado');
    cargarMateriales(currentPage);
  } catch (err) { showToast('error', err.message); }
  finally { hideLoader(); }
};

document.addEventListener('DOMContentLoaded', function() {
  loadMatStats();
  cargarMateriales();

  document.querySelectorAll('.modal-close-material').forEach(function(el) {
    el.addEventListener('click', closeMatModal);
  });

  document.getElementById('btn-nuevo-material').addEventListener('click', async function() {
    editingId = null;
    document.getElementById('form-material').reset();
    document.getElementById('material-id').value = '';
    document.getElementById('modal-title-material').textContent = 'Registrar Nuevo Material';
    if (document.getElementById('mat-autor').options.length <= 1) await cargarSelectsMaterial();
    openMatModal();
  });

  document.getElementById('form-material').addEventListener('submit', async function(e) {
    e.preventDefault();
    var body = {
      titulo: document.getElementById('mat-titulo').value.trim(),
      tipo: document.getElementById('mat-tipo').value,
      isbn: document.getElementById('mat-isbn').value.trim() || null,
      anioPubl: parseInt(document.getElementById('mat-anio').value) || null,
      autorId: parseInt(document.getElementById('mat-autor').value),
      categoriaId: parseInt(document.getElementById('mat-categoria').value),
      stock: parseInt(document.getElementById('mat-stock').value) || 1,
      descripcion: document.getElementById('mat-desc').value.trim() || null,
    };
    if (!body.titulo || !body.autorId || !body.categoriaId) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Título, autor y categoría son obligatorios.' });
      return;
    }
    try {
      showLoader();
      if (editingId) {
        await api.put('/materiales/' + editingId, body);
        showToast('success', 'Material actualizado');
      } else {
        await api.post('/materiales', body);
        showToast('success', 'Material registrado');
      }
      closeMatModal();
      cargarMateriales(currentPage);
    } catch (err) { showToast('error', err.message); }
    finally { hideLoader(); }
  });

  document.getElementById('btn-filtrar-mat').addEventListener('click', function() {
    var filters = {};
    var cat = document.getElementById('filtro-categoria-mat').value;
    var tipo = document.getElementById('filtro-tipo-mat').value;
    var estado = document.getElementById('filtro-estado-mat').value;
    if (cat) filters.categoriaId = cat;
    if (tipo) filters.tipo = tipo;
    if (estado) filters.estado = estado;
    cargarMateriales(1, filters);
  });
});
