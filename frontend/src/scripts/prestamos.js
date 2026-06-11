let currentPage = 1;
let currentFilters = {};
let modal = null;

async function cargarPrestamos(page = 1, filters = {}) {
  currentPage = page;
  currentFilters = filters;
  try {
    const data = await api.get('/prestamos', { page, limit: 15, ...filters });
    const prestamos = data.data;
    const meta = data.meta;
    const tbody = document.getElementById('tbody-prestamos-full');

    if (!prestamos.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-5 text-muted"><i class="bi bi-arrow-left-right fs-3 d-block mb-2"></i>No se encontraron préstamos</td></tr>';
      return;
    }

    const hoy = new Date();
    tbody.innerHTML = prestamos.map((p, i) => {
      const fPrestamo = new Date(p.fechaPrestamo);
      const fVence = new Date(p.fechaDevolucion);
      const diasRestantes = Math.ceil((fVence - hoy) / (1000 * 60 * 60 * 24));
      return `
        <tr>
          <td class="text-muted-sm">${(meta.page - 1) * meta.limit + i + 1}</td>
          <td>
            <div class="fw-semibold">${p.socio.apellido}, ${p.socio.nombre}</div>
            <div class="text-muted-sm">DNI: ${p.socio.dni}</div>
          </td>
          <td><div>${p.material.titulo}</div><div class="text-muted-sm">${p.material.tipo}${p.material.isbn ? ' · ' + p.material.isbn : ''}</div></td>
          <td class="text-muted-sm">${formatDate(p.fechaPrestamo)}</td>
          <td>
            <div>${formatDate(p.fechaDevolucion)}</div>
            ${p.estado !== 'DEVUELTO' ? `<div class="text-muted-sm" style="color:${diasRestantes < 0 ? 'var(--color-danger)' : 'inherit'}">${diasRestantes < 0 ? `Vencido hace ${Math.abs(diasRestantes)} días` : `${diasRestantes} días restantes`}</div>` : ''}
          </td>
          <td>${estadoBadge(p.estado)}</td>
          <td>
            <div class="d-flex gap-1 justify-content-center">
              ${p.estado !== 'DEVUELTO' ? `<button class="btn btn-sm btn-success" onclick="registrarDevolucion(${p.id}, '${p.material.titulo.replace(/'/g, "\\'")}')"><i class="bi bi-arrow-return-left me-1"></i>Devolver</button>` : '<span class="text-muted-sm">Devuelto</span>'}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    document.getElementById('pag-prestamos-info').textContent = `${prestamos.length} de ${meta.total} préstamos`;
    const btns = document.getElementById('pag-prestamos-btns');
    btns.innerHTML = '';
    for (let p = 1; p <= meta.totalPages; p++) {
      const btn = document.createElement('button');
      btn.className = `btn btn-sm ${p === meta.page ? 'btn-primary' : 'btn-outline-secondary'}`;
      btn.textContent = p;
      btn.onclick = () => cargarPrestamos(p, currentFilters);
      btns.appendChild(btn);
    }
  } catch (err) {
    document.getElementById('tbody-prestamos-full').innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger">${err.message}</td></tr>`;
  }
}

async function cargarSelects() {
  try {
    const [sociosData, materialesData] = await Promise.all([
      api.get('/socios', { limit: 200 }),
      api.get('/materiales', { estado: 'DISPONIBLE', limit: 200 }),
    ]);
    const selectSocio = document.getElementById('prestamo-socio');
    const selectMaterial = document.getElementById('prestamo-material');
    selectSocio.innerHTML = '<option value="">Selecciona un socio...</option>';
    selectMaterial.innerHTML = '<option value="">Selecciona un material disponible...</option>';
    (sociosData.data || []).filter(s => s.estado === 'ACTIVO').forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id; opt.textContent = `${s.apellido}, ${s.nombre} — DNI: ${s.dni}`;
      selectSocio.appendChild(opt);
    });
    (materialesData.data || []).forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id; opt.textContent = `${m.titulo} (${m.tipo}) — ${m.autor?.apellido || ''}, ${m.autor?.nombre || ''}`;
      selectMaterial.appendChild(opt);
    });
  } catch (err) {
    console.error('Error cargando selects:', err);
  }
}

async function registrarDevolucion(id, titulo) {
  const result = await Swal.fire({
    title: 'Registrar Devolución',
    html: `¿Confirmas la devolución de <strong>${titulo}</strong>?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    confirmButtonText: '<i class="bi bi-arrow-return-left me-1"></i>Sí, devolver',
    cancelButtonText: 'Cancelar',
  });
  if (!result.isConfirmed) return;
  try {
    showLoader();
    await api.patch(`/prestamos/${id}/devolver`);
    showToast('success', `"${titulo}" devuelto correctamente`);
    cargarPrestamos(currentPage, currentFilters);
  } catch (err) {
    showToast('error', err.message);
  } finally {
    hideLoader();
  }
}

document.addEventListener('DOMContentLoaded', function () {
  modal = new bootstrap.Modal(document.getElementById('modalPrestamo'));
  cargarPrestamos();

  document.getElementById('btn-nuevo-prestamo')?.addEventListener('click', function () {
    const select = document.getElementById('prestamo-socio');
    if (select.options.length <= 1) cargarSelects();
    document.getElementById('form-prestamo').reset();
    modal.show();
  });

  document.getElementById('btn-guardar-prestamo')?.addEventListener('click', async function () {
    const socioId = document.getElementById('prestamo-socio').value;
    const materialId = document.getElementById('prestamo-material').value;
    const observaciones = document.getElementById('prestamo-obs').value.trim();
    if (!socioId || !materialId) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Selecciona socio y material.' });
      return;
    }
    try {
      showLoader();
      const data = await api.post('/prestamos', { socioId: parseInt(socioId), materialId: parseInt(materialId), observaciones });
      modal.hide();
      Swal.fire({
        icon: 'success', title: 'Préstamo registrado',
        html: `Préstamo para <strong>${data.data.socio.nombre} ${data.data.socio.apellido}</strong> creado correctamente.<br><small>Vence el: ${formatDate(data.data.fechaDevolucion)}</small>`,
        confirmButtonColor: '#0f1729',
      });
      cargarPrestamos(1, {});
    } catch (err) {
      showToast('error', err.message);
    } finally {
      hideLoader();
    }
  });

  document.getElementById('btn-filtrar-prestamo')?.addEventListener('click', function () {
    const estado = document.getElementById('filtro-estado-prestamo').value;
    const filters = {};
    if (estado) filters.estado = estado;
    cargarPrestamos(1, filters);
  });
});

window.registrarDevolucion = registrarDevolucion;
