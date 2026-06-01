const API = 'http://localhost:4000/api';
let currentPage = 1;
let currentFilters = {};
let editingId = null;
let modal = null;

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  };
}

function estadoBadge(estado) {
  const map = {
    ACTIVO: 'badge-activo',
    MOROSO: 'badge-moroso',
    SUSPENDIDO: 'badge-suspendido',
  };
  return `<span class="status-badge ${map[estado] || ''}">${estado}</span>`;
}

async function cargarSocios(page = 1, filters = {}) {
  currentPage = page;
  currentFilters = filters;
  const params = new URLSearchParams({ page, limit: 15, ...filters });

  try {
    const res = await fetch(`${API}/socios?${params}`, { headers: headers() });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    const tbody = document.getElementById('tbody-socios');
    const { data: socios, meta } = data;

    if (!socios.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center py-5 text-muted">No se encontraron socios</td></tr>';
      document.getElementById('paginacion-container').style.display = 'none';
      return;
    }

    tbody.innerHTML = socios.map((s, i) => `
      <tr>
        <td class="text-muted-sm">${(meta.page - 1) * meta.limit + i + 1}</td>
        <td>
          <div class="d-flex align-items-center gap-3">
            <div class="user-avatar" style="width:32px;height:32px;font-size:12px;background:var(--color-primary);">
              ${s.apellido.charAt(0)}
            </div>
            <div>
              <div class="fw-semibold">${s.apellido}, ${s.nombre}</div>
            </div>
          </div>
        </td>
        <td class="fw-semibold">${s.dni}</td>
        <td>
          <div>${s.email || '—'}</div>
          <div class="text-muted-sm">${s.telefono || '—'}</div>
        </td>
        <td>${estadoBadge(s.estado)}</td>
        <td>
          <span class="badge bg-light text-dark fw-semibold">${s._count?.prestamos ?? 0}</span>
        </td>
        <td class="text-muted-sm">${new Date(s.createdAt).toLocaleDateString('es-CO')}</td>
        <td>
          <div class="d-flex gap-1 justify-content-center">
            <button class="btn btn-icon btn-sm btn-outline-primary" onclick="editarSocio(${s.id})" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-icon btn-sm btn-outline-danger" onclick="eliminarSocio(${s.id}, '${s.apellido}, ${s.nombre}')" title="Eliminar">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Paginación
    const pContainer = document.getElementById('paginacion-container');
    pContainer.style.display = 'flex';
    document.getElementById('paginacion-info').textContent =
      `Mostrando ${socios.length} de ${meta.total} socios`;

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
    document.getElementById('tbody-socios').innerHTML =
      `<tr><td colspan="8" class="text-center py-4 text-danger"><i class="bi bi-exclamation-triangle me-2"></i>${err.message}</td></tr>`;
  }
}

async function editarSocio(id) {
  try {
    showLoader();
    const res = await fetch(`${API}/socios/${id}`, { headers: headers() });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

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

    document.getElementById('modal-title-socio').innerHTML =
      `<i class="bi bi-pencil me-2"></i>Editar Socio`;

    modal.show();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: err.message });
  } finally {
    hideLoader();
  }
}

async function eliminarSocio(id, nombre) {
  const result = await Swal.fire({
    title: `¿Eliminar socio?`,
    html: `Se eliminará a <strong>${nombre}</strong>. Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#c02d2d',
    cancelButtonColor: '#6b7080',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (!result.isConfirmed) return;

  try {
    showLoader();
    const res = await fetch(`${API}/socios/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    Swal.fire({ icon: 'success', title: 'Eliminado', text: data.data.message, timer: 1800, showConfirmButton: false });
    cargarSocios(currentPage, currentFilters);
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'No se puede eliminar', text: err.message });
  } finally {
    hideLoader();
  }
}

document.addEventListener('DOMContentLoaded', function () {
  modal = new bootstrap.Modal(document.getElementById('modalSocio'));

  cargarSocios();

  // Nuevo socio
  document.getElementById('btn-nuevo-socio')?.addEventListener('click', function () {
    editingId = null;
    document.getElementById('form-socio').reset();
    document.getElementById('socio-id').value = '';
    document.getElementById('modal-title-socio').innerHTML =
      '<i class="bi bi-person-plus me-2"></i>Nuevo Socio';
    modal.show();
  });

  // Guardar
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
      const url = isEdit ? `${API}/socios/${editingId}` : `${API}/socios`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });
      const data = await res.json();

      if (!data.success) {
        if (data.errors) {
          const msgs = data.errors.map(e => `• ${e.message}`).join('\n');
          Swal.fire({ icon: 'warning', title: 'Errores de validación', text: msgs });
        } else {
          throw new Error(data.message);
        }
        return;
      }

      modal.hide();
      Swal.fire({
        icon: 'success',
        title: isEdit ? 'Socio actualizado' : 'Socio registrado',
        timer: 1600,
        showConfirmButton: false,
      });
      cargarSocios(currentPage, currentFilters);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      hideLoader();
    }
  });

  // Filtros
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

  // Enter en búsqueda
  document.getElementById('filtro-search')?.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('btn-filtrar').click();
  });
});

// Hacer funciones globales para los onclick inline
window.editarSocio = editarSocio;
window.eliminarSocio = eliminarSocio;   