var editingCatId = null;

var catColors = [
  { bg: 'from-primary-fixed/40 to-primary-container/20', icon: 'menu_book', border: 'border-primary/20' },
  { bg: 'from-secondary-fixed/40 to-secondary-container/20', icon: 'history', border: 'border-secondary/20' },
  { bg: 'from-tertiary-fixed/40 to-tertiary-container/20', icon: 'science', border: 'border-tertiary/20' },
  { bg: 'from-error-container/40 to-error-fixed/20', icon: 'lightbulb', border: 'border-error/20' },
  { bg: 'from-primary-fixed/30 to-tertiary-fixed/20', icon: 'palette', border: 'border-primary/15' },
  { bg: 'from-secondary-fixed/40 to-tertiary-container/20', icon: 'computer', border: 'border-secondary/20' },
  { bg: 'from-surface-container-low to-surface-variant', icon: 'calculate', border: 'border-outline-variant' },
  { bg: 'from-tertiary-fixed/40 to-primary-container/20', icon: 'public', border: 'border-tertiary/20' },
  { bg: 'from-primary-fixed/40 to-secondary-fixed/20', icon: 'music_note', border: 'border-primary/20' },
  { bg: 'from-error-fixed/30 to-error-container/20', icon: 'emoji_events', border: 'border-error/15' },
];

function openCatModal() {
  document.getElementById('modalCatBackdrop').classList.remove('modal-hidden');
}
function closeCatModal() {
  document.getElementById('modalCatBackdrop').classList.add('modal-hidden');
}

async function cargarCategorias() {
  try {
    var data = await api.get('/categorias');
    var cats = data.data;
    var grid = document.getElementById('grid-categorias');

    if (!cats || !cats.length) {
      grid.innerHTML = '<div class="col-span-full text-center py-xl text-outline font-body-md">No hay categor\u00edas registradas</div>';
      return;
    }

    var maxCount = 0;
    var maxName = '\u2014';
    cats.forEach(function(c) {
      var count = c._count?.materiales || 0;
      if (count > maxCount) { maxCount = count; maxName = c.nombre; }
    });

    document.getElementById('stat-cat-total').textContent = cats.length;
    document.getElementById('stat-cat-con').textContent = cats.filter(function(c) { return (c._count?.materiales || 0) > 0; }).length;
    document.getElementById('stat-cat-mas').textContent = maxName;

    var html = '';
    cats.forEach(function(c, i) {
      var color = catColors[i % catColors.length];
      var count = c._count?.materiales || 0;
      html += '<div class="group">' +
        '<div class="bg-white rounded-xl border ' + color.border + ' shadow-sm overflow-hidden transition-all hover:shadow-md h-full">' +
        '<div class="bg-gradient-to-br ' + color.bg + ' p-lg pb-0 flex items-start justify-between">' +
        '<div class="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">' +
        '<span class="material-symbols-outlined text-primary">' + color.icon + '</span></div>' +
        '<div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">' +
        '<button class="w-8 h-8 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border-0 cursor-pointer" onclick="editarCat(' + c.id + ')" title="Editar"><span class="material-symbols-outlined text-[16px]">edit</span></button>' +
        '<button class="w-8 h-8 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center text-on-surface-variant hover:text-error transition-colors border-0 cursor-pointer" onclick="eliminarCat(' + c.id + ',\'' + c.nombre.replace(/'/g, '') + '\')" title="Eliminar"><span class="material-symbols-outlined text-[16px]">delete</span></button>' +
        '</div></div>' +
        '<div class="p-lg"><h4 class="font-headline-sm text-headline-sm text-on-surface mb-1">' + c.nombre + '</h4>' +
        '<p class="text-on-surface-variant font-body-md text-body-md mb-md">' + (c.descripcion || 'Sin descripci\u00f3n') + '</p>' +
        '<div class="flex items-center gap-2 text-on-surface-variant"><span class="material-symbols-outlined text-[18px]">book</span>' +
        '<span class="font-label-md text-label-md">' + count + ' material' + (count !== 1 ? 'es' : '') + '</span></div></div></div></div>';
    });

    html += '<button id="btn-nueva-cat" class="w-full h-full min-h-[220px] border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center gap-3 text-outline hover:text-primary hover:border-primary hover:bg-primary-fixed/10 transition-all cursor-pointer">' +
      '<span class="material-symbols-outlined text-[40px]">add_circle</span>' +
      '<span class="font-title-lg">Crear Categor\u00eda</span>' +
      '<span class="font-body-sm text-body-sm text-on-surface-variant">Agregar nueva categor\u00eda al cat\u00e1logo</span>' +
      '</button>';

    grid.innerHTML = html;
  } catch (err) {
    document.getElementById('grid-categorias').innerHTML = '<div class="col-span-full text-center py-xl text-error font-body-md">Error: ' + err.message + '</div>';
  }
}

window.editarCat = async function(id) {
  try {
    showLoader();
    var res = await fetch(window.API_URL + '/categorias/' + id, { headers: getHeaders() });
    var d = await res.json();
    if (!d.success) throw new Error(d.message);
    editingCatId = id;
    document.getElementById('cat-id').value = d.data.id;
    document.getElementById('cat-nombre').value = d.data.nombre;
    document.getElementById('cat-desc').value = d.data.descripcion || '';
    document.getElementById('modal-title-cat').textContent = 'Editar Categor\u00eda';
    openCatModal();
  } catch (err) { showToast('error', err.message); }
  finally { hideLoader(); }
};

window.eliminarCat = async function(id, nombre) {
  var result = await Swal.fire({
    title: '\u00bfEliminar categor\u00eda?',
    html: 'Se eliminar\u00e1 <strong>' + nombre + '</strong>.',
    icon: 'warning', showCancelButton: true,
    confirmButtonColor: '#ef4444', confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar',
  });
  if (!result.isConfirmed) return;
  try {
    showLoader();
    await api.del('/categorias/' + id);
    showToast('success', 'Categor\u00eda eliminada');
    cargarCategorias();
  } catch (err) { showToast('error', err.message); }
  finally { hideLoader(); }
};

document.addEventListener('DOMContentLoaded', function() {
  cargarCategorias();

  document.querySelectorAll('.modal-close-cat').forEach(function(el) {
    el.addEventListener('click', closeCatModal);
  });

  document.getElementById('grid-categorias').addEventListener('click', function(e) {
    var target = e.target.closest('#btn-nueva-cat');
    if (target) {
      editingCatId = null;
      document.getElementById('cat-id').value = '';
      document.getElementById('cat-nombre').value = '';
      document.getElementById('cat-desc').value = '';
      document.getElementById('modal-title-cat').textContent = 'Nueva Categor\u00eda';
      openCatModal();
    }
  });

  document.getElementById('form-cat').addEventListener('submit', async function(e) {
    e.preventDefault();
    var nombre = document.getElementById('cat-nombre').value.trim();
    if (!nombre) {
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'El nombre es obligatorio.' });
      return;
    }
    try {
      showLoader();
      var body = { nombre: nombre, descripcion: document.getElementById('cat-desc').value.trim() || null };
      if (editingCatId) {
        await api.put('/categorias/' + editingCatId, body);
        showToast('success', 'Categor\u00eda actualizada');
      } else {
        await api.post('/categorias', body);
        showToast('success', 'Categor\u00eda creada');
      }
      closeCatModal();
      cargarCategorias();
    } catch (err) { showToast('error', err.message); }
    finally { hideLoader(); }
  });
});
