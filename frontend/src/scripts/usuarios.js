var editingUserId = null;

function openUserModal() {
  document.getElementById('modalUserBackdrop').classList.remove('modal-hidden');
}
function closeUserModal() {
  document.getElementById('modalUserBackdrop').classList.add('modal-hidden');
}

async function cargarUsuarios() {
  try {
    var data = await api.get('/users');
    var tbody = document.getElementById('tbody-users');
    tbody.innerHTML = data.data.map(function(u, i) {
      var avatar = u.nombre.charAt(0).toUpperCase();
      var roleBadge = u.role === 'ADMIN'
        ? '<span class="px-3 py-1 rounded-full text-label-sm font-semibold uppercase bg-yellow-100 text-yellow-800">ADMIN</span>'
        : '<span class="px-3 py-1 rounded-full text-label-sm font-semibold uppercase bg-primary-fixed text-primary">BIBLIOTECARIO</span>';
      var estadoHTML = u.activo
        ? '<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-sm font-semibold uppercase bg-tertiary-fixed text-on-tertiary-fixed-variant"><span class="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span> ACTIVO</span>'
        : '<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-sm font-semibold uppercase bg-error-container text-on-error-container"><span class="w-1.5 h-1.5 rounded-full bg-error"></span> INACTIVO</span>';
      return '<tr class="border-b border-outline-variant hover:bg-surface-container transition-colors group">' +
        '<td class="p-md font-mono text-xs text-on-surface-variant">' + (i + 1) + '</td>' +
        '<td class="p-md"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full flex items-center justify-center text-label-sm font-bold text-on-primary" style="background:' + (u.role === 'ADMIN' ? '#1E3A5F' : '#2563EB') + '">' + avatar + '</div><span class="font-medium text-on-surface">' + u.nombre + '</span></div></td>' +
        '<td class="p-md text-on-surface-variant font-label-md">' + u.email + '</td>' +
        '<td class="p-md">' + roleBadge + '</td>' +
        '<td class="p-md text-center">' + estadoHTML + '</td>' +
        '<td class="p-md text-center text-on-surface-variant font-label-md">' + formatDate(u.createdAt) + '</td>' +
        '<td class="p-md text-right"><div class="flex justify-end gap-2">' +
        '<button class="p-2 hover:bg-primary-fixed hover:text-primary rounded-lg transition-colors border-0 bg-transparent cursor-pointer" onclick="editarUser(' + u.id + ')" title="Editar"><span class="material-symbols-outlined">edit</span></button>' +
        '<button class="p-2 rounded-lg transition-colors border-0 bg-transparent cursor-pointer ' + (u.activo ? 'hover:bg-error-container hover:text-error' : 'hover:bg-tertiary-fixed hover:text-tertiary-container') + '" onclick="toggleUser(' + u.id + ')" title="' + (u.activo ? 'Desactivar' : 'Activar') + '"><span class="material-symbols-outlined">' + (u.activo ? 'person_off' : 'person_check') + '</span></button>' +
        '</div></td></tr>';
    }).join('');
  } catch (err) {
    document.getElementById('tbody-users').innerHTML = '<tr><td colspan="7" class="p-md text-center font-body-md text-error">No tienes permisos o error al cargar</td></tr>';
  }
}

window.editarUser = async function(id) {
  try {
    showLoader();
    var res = await fetch(window.API_URL + '/users/' + id, { headers: getHeaders() });
    var d = await res.json();
    if (!d.success) throw new Error(d.message);
    editingUserId = id;
    var u = d.data;
    document.getElementById('user-id').value = u.id;
    document.getElementById('user-nombre').value = u.nombre;
    document.getElementById('user-email').value = u.email;
    document.getElementById('user-password').value = '';
    document.getElementById('user-role').value = u.role;
    document.getElementById('modal-title-user').textContent = 'Editar Usuario';
    document.getElementById('pass-required').style.display = 'none';
    document.getElementById('pass-hint').style.display = 'block';
    openUserModal();
  } catch (err) { showToast('error', err.message); }
  finally { hideLoader(); }
};

window.toggleUser = async function(id) {
  try {
    showLoader();
    var data = await api.patch('/users/' + id + '/toggle');
    showToast('success', data.message);
    cargarUsuarios();
  } catch (err) { showToast('error', err.message); }
  finally { hideLoader(); }
};

document.addEventListener('DOMContentLoaded', function() {
  var user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role !== 'ADMIN') { window.location.href = '/dashboard'; return; }

  cargarUsuarios();

  document.querySelectorAll('.modal-close-user').forEach(function(el) {
    el.addEventListener('click', closeUserModal);
  });

  document.getElementById('btn-nuevo-user').addEventListener('click', function() {
    editingUserId = null;
    ['user-id', 'user-nombre', 'user-email', 'user-password'].forEach(function(id) { document.getElementById(id).value = ''; });
    document.getElementById('user-role').value = 'BIBLIOTECARIO';
    document.getElementById('modal-title-user').textContent = 'Nuevo Usuario';
    document.getElementById('pass-required').style.display = 'inline';
    document.getElementById('pass-hint').style.display = 'none';
    openUserModal();
  });

  document.getElementById('form-user').addEventListener('submit', async function(e) {
    e.preventDefault();
    var isEdit = !!editingUserId;
    var body = {
      nombre: document.getElementById('user-nombre').value.trim(),
      email: document.getElementById('user-email').value.trim(),
      role: document.getElementById('user-role').value,
    };
    var password = document.getElementById('user-password').value;
    if (password) body.password = password;
    if (!body.nombre || !body.email) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Nombre y email son obligatorios.' });
      return;
    }
    if (!isEdit && !password) {
      Swal.fire({ icon: 'warning', title: 'Contrase\u00f1a requerida', text: 'Ingresa una contrase\u00f1a para el nuevo usuario.' });
      return;
    }
    try {
      showLoader();
      if (isEdit) {
        await api.put('/users/' + editingUserId, body);
        showToast('success', 'Usuario actualizado');
      } else {
        await api.post('/users', body);
        showToast('success', 'Usuario creado');
      }
      closeUserModal();
      cargarUsuarios();
    } catch (err) { showToast('error', err.message); }
    finally { hideLoader(); }
  });
});
