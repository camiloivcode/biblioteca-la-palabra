var editingAutorId = null;
var currentAlpha = '';

function openAutorModal() {
  document.getElementById('modalAutorBackdrop').classList.remove('modal-hidden');
}
function closeAutorModal() {
  document.getElementById('modalAutorBackdrop').classList.add('modal-hidden');
}

async function cargarAutores() {
  try {
    var data = await api.get('/autores');
    var autores = data.data;
    var tbody = document.getElementById('tbody-autores');
    if (!autores || !autores.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="p-md text-center font-body-md text-outline">No hay autores registrados</td></tr>';
      return;
    }
    var filtrados = autores;
    if (currentAlpha) {
      var parts = currentAlpha.split('-');
      var start = parts[0].charCodeAt(0);
      var end = parts[1].charCodeAt(0);
      filtrados = autores.filter(function(a) {
        var primera = (a.apellido || ' ').charAt(0).toUpperCase().charCodeAt(0);
        return primera >= start && primera <= end;
      });
    }
    var nac = document.getElementById('filtro-nac-autor').value;
    if (nac) filtrados = filtrados.filter(function(a) { return (a.nacionalidad || '') === nac; });
    tbody.innerHTML = filtrados.map(function(a, i) {
      return '<tr class="border-b border-outline-variant hover:bg-surface-container transition-colors group">' +
        '<td class="p-md font-mono text-xs text-on-surface-variant">' + (i + 1) + '</td>' +
        '<td class="p-md"><span class="font-medium text-on-surface group-hover:text-primary transition-colors">' + a.apellido + ', ' + a.nombre + '</span></td>' +
        '<td class="p-md text-on-surface-variant">' + (a.nacionalidad || '\u2014') + '</td>' +
        '<td class="p-md text-center"><span class="px-3 py-1 rounded-full text-label-sm font-semibold uppercase bg-primary-fixed text-primary">' + (a._count?.materiales || 0) + ' mats.</span></td>' +
        '<td class="p-md text-right"><div class="flex justify-end gap-2">' +
        '<button class="p-2 hover:bg-primary-fixed hover:text-primary rounded-lg transition-colors border-0 bg-transparent cursor-pointer" onclick="editarAutor(' + a.id + ')" title="Editar"><span class="material-symbols-outlined">edit</span></button>' +
        '<button class="p-2 hover:bg-secondary-container hover:text-secondary rounded-lg transition-colors border-0 bg-transparent cursor-pointer" onclick="eliminarAutor(' + a.id + ',\'' + a.apellido.replace(/'/g, '') + ', ' + a.nombre.replace(/'/g, '') + '\')" title="Eliminar"><span class="material-symbols-outlined">delete</span></button>' +
        '</div></td></tr>';
    }).join('');
    document.getElementById('stat-autores-total').textContent = autores.length;
    document.getElementById('stat-autores-con').textContent = autores.filter(function(a) { return (a._count?.materiales || 0) > 0; }).length;
    document.getElementById('stat-autores-sin').textContent = autores.filter(function(a) { return (a._count?.materiales || 0) === 0; }).length;
  } catch (err) {
    document.getElementById('tbody-autores').innerHTML = '<tr><td colspan="5" class="p-md text-center font-body-md text-error">Error: ' + err.message + '</td></tr>';
  }
}

async function cargarNacionalidades() {
  try {
    var data = await api.get('/autores');
    var nacs = new Set();
    (data.data || []).forEach(function(a) { if (a.nacionalidad) nacs.add(a.nacionalidad); });
    var sel = document.getElementById('filtro-nac-autor');
    nacs.forEach(function(n) {
      var opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n;
      sel.appendChild(opt);
    });
  } catch(e) {}
}

window.editarAutor = async function(id) {
  try {
    showLoader();
    var res = await fetch(window.API_URL + '/autores/' + id, { headers: getHeaders() });
    var d = await res.json();
    if (!d.success) throw new Error(d.message);
    var a = d.data;
    editingAutorId = id;
    document.getElementById('autor-id').value = a.id;
    document.getElementById('autor-nombre').value = a.nombre;
    document.getElementById('autor-apellido').value = a.apellido;
    document.getElementById('autor-nacionalidad').value = a.nacionalidad || '';
    document.getElementById('autor-bio').value = a.biografia || '';
    document.getElementById('modal-title-autor').textContent = 'Editar Autor';
    openAutorModal();
  } catch (err) { showToast('error', err.message); }
  finally { hideLoader(); }
};

window.eliminarAutor = async function(id, nombre) {
  var result = await Swal.fire({
    title: '\u00bfEliminar autor?',
    html: 'Se eliminar\u00e1 a <strong>' + nombre + '</strong>.',
    icon: 'warning', showCancelButton: true,
    confirmButtonColor: '#ef4444', confirmButtonText: 'S\u00ed, eliminar', cancelButtonText: 'Cancelar',
  });
  if (!result.isConfirmed) return;
  try {
    showLoader();
    await api.del('/autores/' + id);
    showToast('success', 'Autor eliminado');
    cargarAutores();
  } catch (err) { showToast('error', err.message); }
  finally { hideLoader(); }
};

document.addEventListener('DOMContentLoaded', function() {
  cargarAutores();
  cargarNacionalidades();

  document.querySelectorAll('.modal-close-autor').forEach(function(el) {
    el.addEventListener('click', closeAutorModal);
  });

  document.querySelectorAll('.alpha-filter').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.alpha-filter').forEach(function(b) { b.classList.remove('bg-primary', 'text-on-primary', 'border-primary'); b.classList.add('border-outline-variant'); });
      this.classList.remove('border-outline-variant');
      this.classList.add('bg-primary', 'text-on-primary', 'border-primary');
      currentAlpha = this.getAttribute('data-letter');
      cargarAutores();
    });
  });

  document.getElementById('btn-filtrar-autor').addEventListener('click', function() {
    cargarAutores();
  });

  document.getElementById('btn-nuevo-autor').addEventListener('click', function() {
    editingAutorId = null;
    document.getElementById('form-autor').reset();
    document.getElementById('autor-id').value = '';
    document.getElementById('modal-title-autor').textContent = 'Nuevo Autor';
    openAutorModal();
  });

  document.getElementById('form-autor').addEventListener('submit', async function(e) {
    e.preventDefault();
    var body = {
      nombre: document.getElementById('autor-nombre').value.trim(),
      apellido: document.getElementById('autor-apellido').value.trim(),
      nacionalidad: document.getElementById('autor-nacionalidad').value.trim() || null,
      biografia: document.getElementById('autor-bio').value.trim() || null,
    };
    if (!body.nombre || !body.apellido) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Nombre y apellido son obligatorios.' });
      return;
    }
    try {
      showLoader();
      if (editingAutorId) {
        await api.put('/autores/' + editingAutorId, body);
        showToast('success', 'Autor actualizado');
      } else {
        await api.post('/autores', body);
        showToast('success', 'Autor registrado');
      }
      closeAutorModal();
      cargarAutores();
    } catch (err) { showToast('error', err.message); }
    finally { hideLoader(); }
  });
});
