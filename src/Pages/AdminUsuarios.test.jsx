// src/Pages/AdminUsuarios.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminUsuarios from './AdminUsuarios';
import { userService } from '../services/userService';

const MOCK_USUARIOS = [
  {
    id: 1,
    nombre: 'Administrador LevelUp',
    correo: 'admin@levelup.cl',
    telefono: '912345678',
    region: 'Region Metropolitana',
    comuna: 'Santiago',
    rol: 'ROLE_ADMIN'
  },
  {
    id: 2,
    nombre: 'Cliente Juan',
    correo: 'juan@levelup.cl',
    telefono: '987654321',
    region: 'Region de Valparaiso',
    comuna: 'Viña del Mar',
    rol: 'ROLE_CLIENTE'
  },
  {
    id: 3,
    nombre: 'Carlos Gamer',
    correo: 'carlos@levelup.cl',
    telefono: '955555555',
    region: 'Region del bio Bio',
    comuna: 'Concepcion',
    rol: 'ROLE_CLIENTE'
  }
];

describe('Página AdminUsuarios - Gestión de Usuarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(userService, 'getAll').mockResolvedValue([...MOCK_USUARIOS]);
    vi.spyOn(userService, 'create').mockImplementation(async (nuevo) => ({
      id: 4,
      ...nuevo,
      rol: nuevo.rol || 'ROLE_CLIENTE'
    }));
    vi.spyOn(userService, 'update').mockImplementation(async (id, data) => ({
      id,
      ...data
    }));
    vi.spyOn(userService, 'changeRole').mockResolvedValue(true);
    vi.spyOn(userService, 'delete').mockResolvedValue(true);
  });

  const renderComponent = (currentUser = MOCK_USUARIOS[0]) => {
    return render(
      <MemoryRouter>
        <AdminUsuarios currentUser={currentUser} />
      </MemoryRouter>
    );
  };

  it('renderiza el título, métricas y la tabla de usuarios', async () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /Gestión de Usuarios/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('admin@levelup.cl')).toBeInTheDocument();
      expect(screen.getByText('juan@levelup.cl')).toBeInTheDocument();
      expect(screen.getByText('carlos@levelup.cl')).toBeInTheDocument();
    });

    // Métricas
    expect(screen.getByText('Total Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Administradores')).toBeInTheDocument();
    expect(screen.getByText('Clientes Registrados')).toBeInTheDocument();
  });

  it('filtra usuarios exclusivamente por nombre en tiempo real', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('juan@levelup.cl')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText(/Buscar usuario por nombre/i);
    fireEvent.change(searchInput, { target: { value: 'Juan' } });

    expect(screen.getByText('juan@levelup.cl')).toBeInTheDocument();
    expect(screen.queryByText('carlos@levelup.cl')).not.toBeInTheDocument();
    expect(screen.queryByText('admin@levelup.cl')).not.toBeInTheDocument();

    // Búsqueda por comuna o correo no debe filtrar positivamente al ser solo por nombre
    fireEvent.change(searchInput, { target: { value: 'Concepcion' } });
    expect(screen.queryByText('carlos@levelup.cl')).not.toBeInTheDocument();
    expect(screen.getByText(/No se encontraron usuarios con ese nombre/i)).toBeInTheDocument();
  });

  it('filtra usuarios por rol seleccionado', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('admin@levelup.cl')).toBeInTheDocument();
    });

    const filterSelect = screen.getByLabelText(/Filtrar por rol/i);
    fireEvent.change(filterSelect, { target: { value: 'ROLE_ADMIN' } });

    expect(screen.getByText('admin@levelup.cl')).toBeInTheDocument();
    expect(screen.queryByText('juan@levelup.cl')).not.toBeInTheDocument();
    expect(screen.queryByText('carlos@levelup.cl')).not.toBeInTheDocument();
  });

  it('abre el modal de creación y permite registrar un nuevo usuario con regiones oficiales', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('admin@levelup.cl')).toBeInTheDocument();
    });

    const btnNuevo = screen.getByRole('button', { name: /Nuevo Usuario/i });
    fireEvent.click(btnNuevo);

    expect(screen.getByText(/Registrar Nuevo Usuario/i)).toBeInTheDocument();

    const inputNombre = screen.getByPlaceholderText(/Ej: Juan Pérez/i);
    const inputCorreo = screen.getByPlaceholderText(/ejemplo@correo.cl/i);

    fireEvent.change(inputNombre, { target: { value: 'Mario Bros' } });
    fireEvent.change(inputCorreo, { target: { value: 'mario@levelup.cl' } });

    // Verifica que solo existan las 3 regiones del proyecto en el select
    const selectRegion = screen.getAllByRole('combobox').find((cb) =>
      cb.innerHTML.includes('Region Metropolitana')
    );
    expect(selectRegion).toBeInTheDocument();
    expect(selectRegion.children.length).toBe(3);

    const btnGuardar = screen.getByRole('button', { name: /Guardar en BD/i });
    fireEvent.click(btnGuardar);

    await waitFor(() => {
      expect(userService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Mario Bros',
          correo: 'mario@levelup.cl',
          region: 'Region Metropolitana'
        })
      );
    });
  });

  it('abre el modal de edición y permite actualizar los datos de un usuario', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('juan@levelup.cl')).toBeInTheDocument();
    });

    const editBtn = screen.getByRole('button', { name: /Editar Cliente Juan/i });
    fireEvent.click(editBtn);

    expect(screen.getByText(/Editar Usuario #2/i)).toBeInTheDocument();

    const inputNombre = screen.getByDisplayValue('Cliente Juan');
    fireEvent.change(inputNombre, { target: { value: 'Juan Actualizado' } });

    const btnActualizar = screen.getByRole('button', { name: /Actualizar en BD/i });
    fireEvent.click(btnActualizar);

    await waitFor(() => {
      expect(userService.update).toHaveBeenCalledWith(
        2,
        expect.objectContaining({
          nombre: 'Juan Actualizado'
        })
      );
    });
  });

  it('permite cambiar el rol de un usuario con el botón de rol rápido', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('juan@levelup.cl')).toBeInTheDocument();
    });

    // Juan es cliente, clic en el botón para convertir en admin
    const btnRolJuan = screen.getAllByTitle(/Haz clic para alternar rol/i)[1];
    fireEvent.click(btnRolJuan);

    await waitFor(() => {
      expect(userService.changeRole).toHaveBeenCalledWith(2, 'ROLE_ADMIN');
    });
  });

  it('permite abrir el modal de confirmación y eliminar un usuario', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('juan@levelup.cl')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole('button', { name: /Eliminar Cliente Juan/i });
    fireEvent.click(deleteBtn);

    expect(screen.getByText(/¿Estás seguro de que deseas eliminar la cuenta de/i)).toBeInTheDocument();

    const btnConfirmar = screen.getByRole('button', { name: /Confirmar Eliminación/i });
    fireEvent.click(btnConfirmar);

    await waitFor(() => {
      expect(userService.delete).toHaveBeenCalledWith(2);
    });
  });

  it('deshabilita el botón de eliminar para el usuario administrador actualmente en sesión', async () => {
    renderComponent(MOCK_USUARIOS[0]); // Current user es ID 1 (Administrador)

    await waitFor(() => {
      expect(screen.getByText('admin@levelup.cl')).toBeInTheDocument();
    });

    const deleteAdminBtn = screen.getByRole('button', { name: /Eliminar Administrador LevelUp/i });
    expect(deleteAdminBtn).toBeDisabled();
    expect(screen.getByText('Tú')).toBeInTheDocument();
  });
});
