import React, { useState, useEffect } from 'react';
import { Usuario } from '../types';
import { X, UserPlus, UserCheck, Shield, KeyRound, Clock, Phone, AlertCircle } from 'lucide-react';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveUser: (userData: Omit<Usuario, 'id' | 'fechaAlta'> & { id?: string | number }) => void;
  userToEdit?: Usuario | null;
  existingUsers: Usuario[];
}

const AVATARES_DISPONIBLES = ['🧑‍💼', '👩‍💼', '👨‍💼', '🙋‍♂️', '🙋‍♀️', '👷', '🧕', '🧔'];

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSaveUser,
  userToEdit,
  existingUsers = [],
}) => {
  const [nombre, setNombre] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<string>('cajero');
  const [turno, setTurno] = useState<'Matutino' | 'Vespertino' | 'Nocturno' | 'Completo' | string>('Matutino');
  const [telefono, setTelefono] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🧑‍💼');
  const [activo, setActivo] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setNombre(userToEdit.nombre || userToEdit.name || '');
      setUsername(userToEdit.username || '');
      setPassword(userToEdit.password || '123');
      setRol(userToEdit.rol || userToEdit.role || 'cajero');
      setTurno(userToEdit.turno || 'Matutino');
      setTelefono(userToEdit.telefono || '');
      setAvatarEmoji(userToEdit.avatarEmoji || userToEdit.avatar || '🧑‍💼');
      setActivo(userToEdit.activo ?? true);
    } else {
      setNombre('');
      setUsername('');
      setPassword('123'); // Contraseña rápida por defecto para mostrador
      setRol('cajero');
      setTurno('Matutino');
      setTelefono('');
      setAvatarEmoji('🧑‍💼');
      setActivo(true);
    }
    setError(null);
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanNombre = nombre.trim();
    const cleanPass = password.trim();

    if (!cleanNombre) {
      setError('Por favor ingresa el nombre completo del empleado.');
      return;
    }

    if (!cleanUsername) {
      setError('Por favor asigna un nombre de usuario para el inicio de sesión.');
      return;
    }

    if (!cleanPass) {
      setError('Por favor define una contraseña de acceso.');
      return;
    }

    // Verificar si el username ya está en uso por otro usuario
    const yaExiste = existingUsers.some(
      (u) =>
        (u.username || '').toLowerCase() === cleanUsername &&
        (!userToEdit || String(u.id) !== String(userToEdit.id))
    );

    if (yaExiste) {
      setError(`El nombre de usuario "@${cleanUsername}" ya está registrado. Elige otro.`);
      return;
    }

    onSaveUser({
      ...(userToEdit ? { id: userToEdit.id } : {}),
      nombre: cleanNombre,
      name: cleanNombre,
      username: cleanUsername,
      password: cleanPass,
      rol,
      role: rol,
      turno,
      telefono: telefono.trim() || undefined,
      avatarEmoji,
      avatar: avatarEmoji,
      activo,
      email: `${cleanUsername}@tienda.com`,
    });

    onClose();
  };

  const handleAutoUsername = () => {
    if (!username && nombre) {
      const suggested = nombre.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      setUsername(suggested);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-stone-200 overflow-hidden my-6 transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              {userToEdit ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-base">
                {userToEdit ? 'Editar Empleado / Usuario' : 'Dar de Alta a Nuevo Empleado'}
              </h3>
              <p className="text-xs text-stone-500">
                {userToEdit
                  ? 'Modifica credenciales, rol o estado del personal'
                  : 'Registra un nuevo trabajador para acceso al sistema de mostrador'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-xl text-stone-400 hover:text-stone-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Icono de Perfil
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {AVATARES_DISPONIBLES.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setAvatarEmoji(av)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition cursor-pointer ${
                    avatarEmoji === av
                      ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400'
                      : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre Completo */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Nombre Completo del Trabajador *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Laura Gómez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onBlur={handleAutoUsername}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Username y Contraseña */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Usuario (Login ID) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 text-sm font-bold">@</span>
                <input
                  type="text"
                  required
                  placeholder="ej. laura"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm font-bold font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1">Sin espacios, en minúsculas</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                <span>Contraseña *</span>
                <button
                  type="button"
                  onClick={() => setPassword('123')}
                  className="text-[10px] text-amber-700 hover:underline font-semibold cursor-pointer"
                >
                  PIN rápido (123)
                </button>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="ej. 123 o 1234"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm font-bold font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1">Visible para conveniencia del mostrador</p>
            </div>
          </div>

          {/* Rol de Acceso */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Rol de Acceso en el Sistema *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label
                onClick={() => setRol('cajero')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                  rol === 'cajero'
                    ? 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-400'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="rol"
                  value="cajero"
                  checked={rol === 'cajero'}
                  onChange={() => setRol('cajero')}
                  className="mt-1 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-stone-900">Operador / Cajero</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                    Solo búsqueda de stock y merma express de mostrador. Sin acceso a dinero ni costos.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setRol('admin')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                  rol === 'admin'
                    ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-400'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="rol"
                  value="admin"
                  checked={rol === 'admin'}
                  onChange={() => setRol('admin')}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-stone-900">Administrador / Dueño</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                    Acceso total a finanzas, compras, edición de productos y gestión de empleados.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Turno y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>Turno de Trabajo</span>
              </label>
              <select
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="Matutino">Matutino (Mañanas)</option>
                <option value="Vespertino">Vespertino (Tardes)</option>
                <option value="Nocturno">Nocturno</option>
                <option value="Completo">Turno Completo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>Teléfono de Contacto (Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="ej. 555-123-4567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Estado Activo / Inactivo */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-800">Estado de la cuenta</span>
              <p className="text-[11px] text-stone-500">
                {activo ? 'Permitir inicio de sesión en mostrador' : 'Bloquear acceso al sistema'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivo(!activo)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activo
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-stone-200 text-stone-600 border border-stone-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activo ? 'bg-emerald-600' : 'bg-stone-400'}`} />
              <span>{activo ? 'Activo' : 'Inactivo (Bloqueado)'}</span>
            </button>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-extrabold shadow-sm transition cursor-pointer flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>{userToEdit ? 'Guardar Cambios' : 'Dar de Alta Empleado'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};