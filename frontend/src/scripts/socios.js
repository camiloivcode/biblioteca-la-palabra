let currentPage = 1;
let currentFilters = {};
let editingId = null;
let modal = null;

async function cargarSocios(page = 1, filters = {}) {
  currentPage = page;
  currentFilters = filters;
  try {
    const data = await api.get('/socios', { page, limit: 15, ...filters });
    const socios = data.data;
    const meta = data.meta;
    const tbody = document.getElementById('tbody-socios');

    if (!socios.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center py-5 text-muted"><i class="bi bi-people fs-3 d-block mb-2"></i>No se encontraron socios</td></tr>';
      document.getElementById('paginacion-container').style.display = 'none';
      return;
    }

    tbody.innerHTML = socios.map((s, i) => `
      <tr>
        <td class="text-muted-sm">${(meta.page - 1) * meta.limit + i + 1}</td>
        <td>
          <div class="d-flex align-items-center gap-3">
            <div class="user-avatar" style="width:34px;height:34px;font-size:13px;background:linear-gradient(135deg,var(--color-primary-light),var(--color-primary));">${s.apellido.charAt(0)}</div>
            <div class="fw-semibold">${s.apellido}, ${s.nombre}</div>
          </div>
        </td>
        <td class="fw-semibold">${s.dni}</td>
        <td><div>${s.email || '—'}</div><div class="text-muted-sm">${s.telefono || '—'}</div></td>
        <td>${estadoBadge(s.estado)}</td>
        <td><span class="badge bg-light text-dark fw-semibold">${s._count?.prestamos ?? 0}</span></td>
        <td class="text-muted-sm">${formatDate(s.createdAt)}</td>
        <td>
          <div class="d-flex gap-1 justify-content-center">
            <button class="btn btn-icon btn-sm btn-outline-primary" onclick="editarSocio(${s.id})" title="Editar"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-icon btn-sm btn-outline-danger" onclick="eliminarSocio(${s.id}, '${s.apellido}, ${s.nombre}')" title="Eliminar"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');

    const pContainer = document.getElementById('paginacion-container');
    pContainer.style.display = 'flex';
    document.getElementById('paginacion-info').textContent = `${socios.length} de ${meta.total} socios`;
    const btns = document.getElementById('paginacion-btns');
    btns.innerHTML = '';
    for (let p = 1; p <= meta.totalPages; p++) {
      const btn = document.createElement('button');
      btn.className = `btn btn-sm ${p === meta.page ? 'btn-primary' : 'btn-outline-secondary'}`;
      btn.textContent = p;
      btn.onclick = () => cargarSocios(p, currentFilters);
      btns.appendChild(btn);
    }
  } catch (err) {
    document.getElementById('tbody-socios').innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger"><i class="bi bi-exclamation-triangle me-2"></i>${err.message}</td></tr>`;
  }
}

async function editarSocio(id) {
  try {
    showLoader();
    const data = await api.get(`/socios/${id}`);
    const s = data.data;
    editingId = id;
    document.getElementById('socio-id').value = s.id;
    document.getElementById('socio-nombre').value = s.nombre;
    document.getElementById('socio-apellido').value = s.apellido;
    document.getElementById('socio-dni').value = s.dni;
    document.getElementById('socio-email').value = s.email || '';
    document.getElementById('socio-telefono').value = s.telefono || '';
    document.getElementById('socio-direccion').value = s.direccion || '';
    document.getElementById('socio-fechanac').value = s.fechaNac ? s.fechaNac.substring(0, 10) : '';
    document.getElementById('modal-title-socio').innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Socio';
    modal.show();
  } catch (err) {
    showToast('error', err.message);
  } finally {
    hideLoader();
  }
}

async function eliminarSocio(id, nombre) {
  const result = await Swal.fire({
    title: '¿Eliminar socio?',
    html: `Se eliminará a <strong>${nombre}</strong>. Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });
  if (!result.isConfirmed) return;
  try {
    showLoader();
    const data = await api.del(`/socios/${id}`);
    showToast('success', data.data?.message || 'Socio eliminado');
    cargarSocios(currentPage, currentFilters);
  } catch (err) {
    showToast('error', err.message);
  } finally {
    hideLoader();
  }
}

document.addEventListener('DOMContentLoaded', function () {
  modal = new bootstrap.Modal(document.getElementById('modalSocio'));
  cargarSocios();

  document.getElementById('btn-nuevo-socio')?.addEventListener('click', function () {
    editingId = null;
    document.getElementById('form-socio').reset();
    document.getElementById('socio-id').value = '';
    document.getElementById('modal-title-socio').innerHTML = '<i class="bi bi-person-plus me-2"></i>Nuevo Socio';
    modal.show();
  });

  document.getElementById('btn-guardar-socio')?.addEventListener('click', async function () {
    const body = {
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
      const isEdit = !!editingId;
      const data = isEdit ? await api.put(`/socios/${editingId}`, body) : await api.post('/socios', body);
      modal.hide();
      showToast('success', isEdit ? 'Socio actualizado' : 'Socio registrado');
      cargarSocios(currentPage, currentFilters);
    } catch (err) {
      if (err.errors) {
        Swal.fire({ icon: 'warning', title: 'Errores de validación', text: err.errors.map(e => `• ${e.message}`).join('\n') });
      } else {
        showToast('error', err.message);
      }
    } finally {
      hideLoader();
    }
  });

  document.getElementById('btn-filtrar')?.addEventListener('click', function () {
    const filters = {};
    const search = document.getElementById('filtro-search').value.trim();
    const estado = document.getElementById('filtro-estado').value;
    if (search) filters.search = search;
    if (estado) filters.estado = estado;
    cargarSocios(1, filters);
  });

  document.getElementById('btn-limpiar-filtros')?.addEventListener('click', function () {
    document.getElementById('filtro-search').value = '';
    document.getElementById('filtro-estado').value = '';
    cargarSocios(1, {});
  });

  document.getElementById('filtro-search')?.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('btn-filtrar').click();
  });
});

window.editarSocio = editarSocio;
window.eliminarSocio = eliminarSocio;
