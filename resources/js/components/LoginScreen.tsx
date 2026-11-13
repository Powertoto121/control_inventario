import React, { useState } from 'react';
import { Usuario } from '../types';
import { Lock, User, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: Usuario) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    try {
      // Petición al backend de Laravel con PostgreSQL
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: cleanUser,
          password: cleanPass,
        }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        onLogin(data.user);
      } else {
        setError(data.message || 'Usuario o contraseña incorrectos. Verifica tus datos.');
      }
    } catch (err) {
      console.error('Error al conectar con la API:', err);
      setError('Ocurrió un error al conectar con el servidor. Inténtalo de nuevo.');
    }
  };

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
            Sistema seguro de control de inventario y mostrador
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-md space-y-5">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-base font-bold text-stone-900">Iniciar Sesión</h2>
            <p className="text-xs text-stone-500">
              Ingresa con tus credenciales asignadas
            </p>
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
                  placeholder="ej. admin o carlos"
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
        </div>

        {/* Footer credentials reminder */}
        <div className="text-center space-y-1">
          <p className="text-xs text-stone-500 flex items-center justify-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-stone-400" />
            <span>Credenciales de prueba: <strong>carlos</strong> (123) / <strong>admin</strong> (1234)</span>
          </p>
        </div>
      </div>
    </div>
  );
};