let currentPage = 1;
let currentFilters = {};
let editingId = null;
let modal = null;

async function cargarMateriales(page = 1, filters = {}) {
  currentPage = page;
  currentFilters = filters;
  try {
    const data = await api.get('/materiales', { page, limit: 15, ...filters });
    const materiales = data.data;
    const meta = data.meta;
    const tbody = document.getElementById('tbody-materiales');

    if (!materiales.length) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center py-5 text-muted"><i class="bi bi-book fs-3 d-block mb-2"></i>No se encontraron materiales</td></tr>';
      return;
    }

    tbody.innerHTML = materiales.map((m, i) => `
      <tr>
        <td class="text-muted-sm">${(meta.page - 1) * meta.limit + i + 1}</td>
        <td>
          <div class="fw-semibold">${m.titulo}</div>
          ${m.editorial ? `<div class="text-muted-sm">${m.editorial}</div>` : ''}
        </td>
        <td><span class="badge bg-light text-dark" style="font-size:11px;">${m.tipo}</span></td>
        <td>${m.autor ? `${m.autor.apellido}, ${m.autor.nombre}` : '—'}</td>
        <td>${m.categoria?.nombre || '—'}</td>
        <td class="text-muted-sm">${m.isbn || '—'}</td>
        <td><span class="fw-semibold">${m.stock}</span>${m.anioPubl ? `<div class="text-muted-sm">${m.anioPubl}</div>` : ''}</td>
        <td>${estadoBadge(m.estado)}</td>
        <td>
          <div class="d-flex gap-1 justify-content-center">
            <button class="btn btn-icon btn-sm btn-outline-primary" onclick="editarMaterial(${m.id})" title="Editar"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-icon btn-sm btn-outline-danger" onclick="eliminarMaterial(${m.id}, '${m.titulo.replace(/'/g, "\\'")}')" title="Eliminar"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');

    document.getElementById('pag-mat-info').textContent = `${materiales.length} de ${meta.total} materiales`;
    const btns = document.getElementById('pag-mat-btns');
    btns.innerHTML = '';
    for (let p = 1; p <= meta.totalPages; p++) {
      const btn = document.createElement('button');
      btn.className = `btn btn-sm ${p === meta.page ? 'btn-primary' : 'btn-outline-secondary'}`;
      btn.textContent = p;
      btn.onclick = () => cargarMateriales(p, currentFilters);
      btns.appendChild(btn);
    }
  } catch (err) {
    document.getElementById('tbody-materiales').innerHTML = `<tr><td colspan="9" class="text-center py-4 text-danger">${err.message}</td></tr>`;
  }
}

async function cargarSelectsMaterial() {
  try {
    const [autData, catData] = await Promise.all([
      api.get('/autores'),
      api.get('/categorias'),
    ]);
    const selAutor = document.getElementById('mat-autor');
    const selCat = document.getElementById('mat-categoria');
    selAutor.innerHTML = '<option value="">Selecciona un autor...</option>';
    selCat.innerHTML = '<option value="">Selecciona una categoría...</option>';
    (autData.data || []).forEach(a => {
      const opt = document.createElement('option');
      opt.value = a.id;
      opt.textContent = `${a.apellido}, ${a.nombre}`;
      selAutor.appendChild(opt);
    });
    (catData.data || []).forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nombre;
      selCat.appendChild(opt);
    });
  } catch (err) {
    console.error('Error cargando selects:', err);
  }
}

async function editarMaterial(id) {
  try {
    showLoader();
    if (document.getElementById('mat-autor').options.length <= 1) await cargarSelectsMaterial();
    const data = await api.get(`/materiales/${id}`);
    const m = data.data;
    editingId = id;
    document.getElementById('material-id').value = m.id;
    document.getElementById('mat-titulo').value = m.titulo;
    document.getElementById('mat-tipo').value = m.tipo;
    document.getElementById('mat-isbn').value = m.isbn || '';
    document.getElementById('mat-anio').value = m.anioPubl || '';
    document.getElementById('mat-autor').value = m.autorId;
    document.getElementById('mat-categoria').value = m.categoriaId;
    document.getElementById('mat-editorial').value = m.editorial || '';
    document.getElementById('mat-stock').value = m.stock;
    document.getElementById('mat-desc').value = m.descripcion || '';
    document.getElementById('modal-title-material').innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Material';
    modal.show();
  } catch (err) {
    showToast('error', err.message);
  } finally {
    hideLoader();
  }
}

async function eliminarMaterial(id, titulo) {
  const result = await Swal.fire({
    title: '¿Eliminar material?',
    html: `Se eliminará <strong>${titulo}</strong>.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });
  if (!result.isConfirmed) return;
  try {
    showLoader();
    await api.del(`/materiales/${id}`);
    showToast('success', 'Material eliminado');
    cargarMateriales(currentPage, currentFilters);
  } catch (err) {
    showToast('error', err.message);
  } finally {
    hideLoader();
  }
}

document.addEventListener('DOMContentLoaded', function () {
  modal = new bootstrap.Modal(document.getElementById('modalMaterial'));
  cargarMateriales();

  document.getElementById('btn-nuevo-material')?.addEventListener('click', async function () {
    editingId = null;
    document.getElementById('form-material').reset();
    document.getElementById('material-id').value = '';
    document.getElementById('modal-title-material').innerHTML = '<i class="bi bi-book me-2"></i>Nuevo Material';
    if (document.getElementById('mat-autor').options.length <= 1) await cargarSelectsMaterial();
    modal.show();
  });

  document.getElementById('btn-guardar-material')?.addEventListener('click', async function () {
    const body = {
      titulo: document.getElementById('mat-titulo').value.trim(),
      tipo: document.getElementById('mat-tipo').value,
      isbn: document.getElementById('mat-isbn').value.trim() || null,
      anioPubl: parseInt(document.getElementById('mat-anio').value) || null,
      autorId: parseInt(document.getElementById('mat-autor').value),
      categoriaId: parseInt(document.getElementById('mat-categoria').value),
      editorial: document.getElementById('mat-editorial').value.trim() || null,
      stock: parseInt(document.getElementById('mat-stock').value) || 1,
      descripcion: document.getElementById('mat-desc').value.trim() || null,
    };
    if (!body.titulo || !body.autorId || !body.categoriaId) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Título, autor y categoría son obligatorios.' });
      return;
    }
    try {
      showLoader();
      const isEdit = !!editingId;
      isEdit ? await api.put(`/materiales/${editingId}`, body) : await api.post('/materiales', body);
      modal.hide();
      showToast('success', isEdit ? 'Material actualizado' : 'Material registrado');
      cargarMateriales(currentPage, currentFilters);
    } catch (err) {
      showToast('error', err.message);
    } finally {
      hideLoader();
    }
  });

  document.getElementById('btn-filtrar-mat')?.addEventListener('click', function () {
    const filters = {};
    const s = document.getElementById('filtro-search-mat').value.trim();
    const t = document.getElementById('filtro-tipo-mat').value;
    const e = document.getElementById('filtro-estado-mat').value;
    if (s) filters.search = s;
    if (t) filters.tipo = t;
    if (e) filters.estado = e;
    cargarMateriales(1, filters);
  });

  document.getElementById('btn-limpiar-mat')?.addEventListener('click', function () {
    document.getElementById('filtro-search-mat').value = '';
    document.getElementById('filtro-tipo-mat').value = '';
    document.getElementById('filtro-estado-mat').value = '';
    cargarMateriales(1, {});
  });
});

window.editarMaterial = editarMaterial;
window.eliminarMaterial = eliminarMaterial;
