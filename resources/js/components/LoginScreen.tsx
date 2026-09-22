import React, { useState } from 'react';
import { Usuario, UsuarioCuenta } from '../types';
import { USUARIOS_INICIALES } from '../data/initialUsers';
import { Lock, User, ArrowRight, AlertCircle, Sparkles, KeyRound } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: Usuario) => void;
  usuarios?: UsuarioCuenta[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  usuarios = USUARIOS_INICIALES as UsuarioCuenta[],
}) => {
  const [username, setUsername] = useState('carlos');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState<string | null>(null);

  // Helper para obtener el valor del username de un usuario
  const getUsername = (u: UsuarioCuenta) => u.username || u.name || '';
  const getNombre = (u: UsuarioCuenta) => u.nombre || u.name || getUsername(u);
  const isActivo = (u: UsuarioCuenta) => u.activo ?? (u.status === 'active' || u.status === undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const cuenta = usuarios.find((u) => getUsername(u).toLowerCase() === cleanUser);

    if (!cuenta) {
      setError(`El usuario "@${cleanUser}" no está registrado en el sistema.`);
      return;
    }

    if (!isActivo(cuenta)) {
      setError(`La cuenta de "@${getUsername(cuenta)}" está inactiva/bloqueada. Contacta al administrador.`);
      return;
    }

    if (cuenta.password && cuenta.password !== cleanPass) {
      setError('Contraseña incorrecta. Verifica e intenta de nuevo.');
      return;
    }

    onLogin(cuenta);
  };

  const handleQuickLogin = (targetUsername: string) => {
    const cuenta = usuarios.find((u) => getUsername(u).toLowerCase() === targetUsername.toLowerCase());
    if (cuenta) {
      if (!isActivo(cuenta)) {
        setError(`La cuenta de "@${getUsername(cuenta)}" está desactivada.`);
        return;
      }
      setUsername(getUsername(cuenta));
      if (cuenta.password) setPassword(cuenta.password);
      onLogin(cuenta);
    }
  };

  const activeUsers = usuarios.filter((u) => isActivo(u));
  // Separate default ones and any custom newly created employees
  const otherActiveUsers = activeUsers.filter((u) => {
    const un = getUsername(u).toLowerCase();
    return un !== 'carlos' && un !== 'admin';
  });

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white mx-auto flex items-center justify-center text-3xl shadow-md">
            🏪
          </div>
          <h1 className="text-2xl font-black tracking-tight text-stone-900">
            Mi Tiendita • Control & Mermas
          </h1>
          <p className="text-xs text-stone-500">
            Acceso rápido al sistema de inventario, mostrador y empleados
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-md space-y-5">
          <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900">Iniciar Sesión</h2>
              <p className="text-xs text-stone-500">
                Ingresa con tu usuario y contraseña de mostrador
              </p>
            </div>
            <div className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Sistema Oficial v1.0
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Nombre de Usuario
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  id="login-username-input"
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="ej. carlos, admin, laura..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  id="login-password-input"
                  type="password"
                  required
                  placeholder="••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Entrar al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Access Divider */}
          <div className="pt-3 border-t border-stone-100">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-stone-800">
                Acceso Rápido al Sistema (1 solo clic):
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Boton Acceso Rápido Cajero */}
              <button
                type="button"
                id="quick-login-cajero-btn"
                onClick={() => handleQuickLogin('carlos')}
                className="w-full p-3 rounded-xl border-2 border-amber-200 bg-amber-50/80 hover:bg-amber-100/90 active:scale-98 text-left transition flex items-start gap-3 group cursor-pointer shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition shadow-xs">
                  🧑‍💼
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-amber-950">
                      Entrar como Operador / Cajero
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-semibold shrink-0">
                      carlos / 123
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                    Modo Mostrador: Búsqueda ágil de stock y registro express de mermas en 3 pasos. Sin costos monetarios ni reportes.
                  </p>
                </div>
              </button>

              {/* Boton Acceso Rápido Admin */}
              <button
                type="button"
                id="quick-login-admin-btn"
                onClick={() => handleQuickLogin('admin')}
                className="w-full p-3 rounded-xl border-2 border-stone-300 bg-stone-50 hover:bg-stone-100 active:scale-98 text-left transition flex items-start gap-3 group cursor-pointer shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition shadow-xs">
                  👨‍💼
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-stone-900">
                      Entrar como Administrador / Dueño
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 font-semibold shrink-0">
                      admin / 1234
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                    Control total: gestión de empleados, altas de productos, finanzas y cálculo de reabastecimiento.
                  </p>
                </div>
              </button>
            </div>

            {/* Other registered employees quick chips */}
            {otherActiveUsers.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-stone-100">
                <span className="text-[11px] font-bold text-stone-600 block mb-1.5">
                  Otros empleados dados de alta:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {otherActiveUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(getUsername(u))}
                      className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 hover:border-amber-400 text-xs text-stone-700 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>{u.avatarEmoji || u.avatar || '👤'}</span>
                      <span className="font-semibold">{getNombre(u)}</span>
                      <span className="font-mono text-[10px] text-stone-400">@{getUsername(u)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer credentials reminder */}
        <div className="text-center space-y-1">
          <p className="text-xs text-stone-500 flex items-center justify-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-stone-400" />
            <span>Usuarios principales: <strong>carlos</strong> (clave 123) / <strong>admin</strong> (clave 1234)</span>
          </p>
          <p className="text-[11px] text-stone-400">
            {usuarios.length} cuentas de empleados registradas en el sistema
          </p>
        </div>
      </div>
    </div>
  );
};