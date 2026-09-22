import React, { useState } from 'react';
import { Usuario } from '../types';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Phone,
  Info,
} from 'lucide-react';

interface UsersManagementViewProps {
  usuarios: Usuario[];
  currentUser: Usuario;
  onOpenNewUserModal: () => void;
  onEditUser: (user: Usuario) => void;
  onToggleUserStatus: (userId: any) => void;
  onDeleteUser: (userId: any) => void;
}

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({
  usuarios = [],
  currentUser,
  onOpenNewUserModal,
  onEditUser,
  onToggleUserStatus,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'todos' | 'cajero' | 'admin'>('todos');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Helpers de extracción segura para compatibilidad con la interfaz unificada
  const getNombre = (u: Usuario) => u.nombre || u.name || 'Sin nombre';
  const getUsername = (u: Usuario) => u.username || '';
  const getRol = (u: Usuario) => u.rol || u.role || 'cajero';
  const getAvatar = (u: Usuario) => u.avatarEmoji || u.avatar || (getRol(u) === 'cajero' ? '🧑‍💼' : '👨‍💼');
  const getActivo = (u: Usuario) => u.activo ?? true;

  const togglePasswordVisibility = (userId: string | number) => {
    const key = String(userId);
    setShowPasswords((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const filteredUsers = usuarios.filter((u) => {
    const nombre = getNombre(u).toLowerCase();
    const username = getUsername(u).toLowerCase();
    const tel = u.telefono || '';
    const q = searchTerm.toLowerCase();

    const matchesSearch =
      nombre.includes(q) ||
      username.includes(q) ||
      tel.includes(searchTerm);

    const matchesRole = roleFilter === 'todos' || getRol(u) === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalUsuarios = usuarios.length;
  const totalCajeros = usuarios.filter((u) => getRol(u) === 'cajero').length;
  const totalAdmins = usuarios.filter((u) => getRol(u) === 'admin').length;
  const totalActivos = usuarios.filter((u) => getActivo(u)).length;

  const currentUsername = getUsername(currentUser).toLowerCase();

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-2">
              <Shield className="w-3.5 h-3.5 text-blue-700" />
              <span>Panel Exclusivo de Administrador</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Gestión de Personal & Accesos
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mt-1 leading-relaxed">
              Da de alta a nuevos trabajadores, define sus credenciales para inicio rápido en mostrador y controla sus permisos operativos por rol.
            </p>
          </div>

          <button
            id="add-new-employee-btn"
            onClick={onOpenNewUserModal}
            className="self-start sm:self-auto px-4 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Dar de Alta Empleado</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-semibold">Total Personal</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl font-black text-stone-900">{totalUsuarios}</p>
          <span className="text-[11px] text-stone-500">Registrados</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-xs font-bold">Cajeros / Mostrador</span>
            <span className="text-base">🧑‍💼</span>
          </div>
          <p className="text-2xl font-black text-amber-800">{totalCajeros}</p>
          <span className="text-[11px] text-amber-700 font-medium">Modo Operador</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs bg-blue-50/20">
          <div className="flex items-center justify-between text-blue-800 mb-1">
            <span className="text-xs font-bold">Administradores</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-800">{totalAdmins}</p>
          <span className="text-[11px] text-blue-700 font-medium">Acceso Total</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-xs font-bold">Activos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-800">{totalActivos}</p>
          <span className="text-[11px] text-emerald-700 font-medium">Con acceso habilitado</span>
        </div>
      </div>

      {/* Permissions Explanatory Note */}
      <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200 text-xs text-stone-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-stone-900">
              Diferenciación de Seguridad por Rol:
            </p>
            <p className="text-stone-600 mt-0.5 leading-relaxed">
              • <strong>Cajero / Operador:</strong> Consulta stock y registra mermas de mostrador en 3 clics. Está protegido de ver costos de proveedor, compras o reportes de pérdidas monetarias.<br />
              • <strong>Administrador:</strong> Acceso irrestricto al catálogo, precios, métricas financieras y a esta administración de usuarios.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, usuario (@carlos) o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setRoleFilter('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              roleFilter === 'todos'
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            Todos ({usuarios.length})
          </button>
          <button
            onClick={() => setRoleFilter('cajero')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              roleFilter === 'cajero'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-stone-200 text-amber-800 hover:bg-amber-50'
            }`}
          >
            🧑‍💼 Cajeros ({totalCajeros})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              roleFilter === 'admin'
                ? 'bg-blue-700 text-white'
                : 'bg-white border border-stone-200 text-blue-800 hover:bg-blue-50'
            }`}
          >
            🛡️ Administradores ({totalAdmins})
          </button>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const userId = user.id ?? user.username ?? '';
          const username = getUsername(user);
          const rol = getRol(user);
          const activo = getActivo(user);
          const isCurrentUser = username.toLowerCase() === currentUsername;
          const isPassVisible = showPasswords[String(userId)] || false;

          return (
            <div
              key={String(userId)}
              id={`user-card-${userId}`}
              className={`bg-white rounded-2xl p-5 border transition flex flex-col justify-between shadow-2xs hover:shadow-sm ${
                !activo
                  ? 'border-stone-200 bg-stone-50/50 opacity-80'
                  : rol === 'admin'
                  ? 'border-blue-200 ring-1 ring-blue-50'
                  : 'border-stone-200'
              }`}
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                      {getAvatar(user)}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-stone-900 text-base leading-tight">
                          {getNombre(user)}
                        </h3>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 text-[10px] font-bold">
                            Tú
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-stone-500 font-semibold">
                        @{username}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {activo ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-stone-200 text-stone-700 border border-stone-300 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                        Bloqueado
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Badges */}
                <div className="space-y-2 py-2 border-y border-stone-100 text-xs">
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="text-stone-400 font-medium">Rol de Acceso:</span>
                    {rol === 'admin' ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-blue-700" />
                        Administrador
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        Operador / Cajero
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-stone-600">
                    <span className="text-stone-400 font-medium">Turno:</span>
                    <span className="font-semibold text-stone-800 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {user.turno || 'Matutino'}
                    </span>
                  </div>

                  {/* Password helper */}
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="text-stone-400 font-medium">Contraseña:</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-stone-900">
                      <span>{isPassVisible ? (user.password || '••••') : '••••'}</span>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(userId)}
                        className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-700 cursor-pointer"
                        title={isPassVisible ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {user.telefono && (
                    <div className="flex items-center justify-between text-stone-600">
                      <span className="text-stone-400 font-medium">Contacto:</span>
                      <span className="font-medium text-stone-700 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400" />
                        {user.telefono}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-stone-400 text-[11px]">
                    <span>Alta en sistema:</span>
                    <span>{user.fechaAlta || '2026-01-01'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onToggleUserStatus(userId)}
                  disabled={isCurrentUser}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                    isCurrentUser
                      ? 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400 border-stone-200'
                      : activo
                      ? 'bg-stone-50 hover:bg-rose-50 text-stone-600 hover:text-rose-700 border-stone-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                  title={isCurrentUser ? 'No puedes bloquear tu propio usuario' : undefined}
                >
                  {activo ? 'Desactivar' : 'Activar Acceso'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditUser(user)}
                    className="p-2 hover:bg-stone-100 text-stone-600 hover:text-stone-900 rounded-lg border border-stone-200 transition cursor-pointer"
                    title="Editar información del empleado"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteUser(userId)}
                    disabled={isCurrentUser}
                    className={`p-2 rounded-lg border transition cursor-pointer ${
                      isCurrentUser
                        ? 'opacity-30 cursor-not-allowed text-stone-300 border-stone-200'
                        : 'hover:bg-rose-50 text-stone-400 hover:text-rose-700 border-stone-200 hover:border-rose-300'
                    }`}
                    title={isCurrentUser ? 'No puedes eliminar tu propio usuario' : 'Eliminar usuario'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-stone-200">
            <Users className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <h4 className="text-base font-bold text-stone-800">
              No se encontraron empleados
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              No hay trabajadores que coincidan con la búsqueda o filtro seleccionado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};