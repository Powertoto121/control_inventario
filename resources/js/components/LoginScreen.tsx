import React, { useState, useEffect } from 'react';
import { Usuario } from '../types';
import { Lock, User, ArrowRight, AlertCircle, KeyRound, Server, RefreshCw } from 'lucide-react';
import {
  apiFetch,
  autoDiscoverServer,
  getServerBaseUrl,
  setServerBaseUrl,
} from '../utils/apiConfig';

interface LoginScreenProps {
  onLogin: (user: Usuario) => void;
}

const isNativeApp = (): boolean => {
  return typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.());
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Estado de servidor local (solo relevante en APK Android)
  const [nativeMode] = useState<boolean>(isNativeApp);
  const [serverUrl, setServerUrl] = useState<string>(() => getServerBaseUrl());
  const [isSearchingServer, setIsSearchingServer] = useState<boolean>(false);
  const [showServerConfig, setShowServerConfig] = useState<boolean>(false);
  const [manualIpInput, setManualIpInput] = useState<string>(() => getServerBaseUrl());

  const runDiscovery = async () => {
    setIsSearchingServer(true);
    const found = await autoDiscoverServer();
    if (found) {
      setServerUrl(found);
      setManualIpInput(found);
      setError(null);
    }
    setIsSearchingServer(false);
  };

  useEffect(() => {
    if (nativeMode) {
      void runDiscovery();
    }
  }, [nativeMode]);

  const handleSaveManualServer = () => {
    const saved = setServerBaseUrl(manualIpInput);
    setServerUrl(saved);
    setManualIpInput(saved);
    setShowServerConfig(false);
    setError(null);
  };

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
      // Si es app nativa y aún no hay servidor detectado, intenta descubrirlo antes de enviar
      if (nativeMode && !getServerBaseUrl()) {
        await runDiscovery();
      }

      const response = await apiFetch('/api/login', {
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
      setError(
        nativeMode
          ? 'No se pudo conectar al servidor local. Verifica que tu celular y laptop estén en el mismo Wi-Fi o ajusta la IP abajo.'
          : 'Ocurrió un error al conectar con el servidor. Inténtalo de nuevo.'
      );
      if (nativeMode) {
        setShowServerConfig(true);
      }
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

          {/* Barra de Servidor Local (solo visible en APK móvil) */}
          {nativeMode && (
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-stone-600">
                <span className="flex items-center gap-1.5 truncate">
                  <Server className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  {isSearchingServer ? (
                    <span className="animate-pulse">Buscando servidor en Wi-Fi...</span>
                  ) : serverUrl ? (
                    <span className="truncate font-mono text-emerald-700">{serverUrl}</span>
                  ) : (
                    <span className="text-rose-600">Servidor no detectado</span>
                  )}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => void runDiscovery()}
                    disabled={isSearchingServer}
                    className="p-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                    title="Volver a buscar servidor automáticamente"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSearchingServer ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowServerConfig((prev) => !prev)}
                    className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200 cursor-pointer"
                  >
                    {showServerConfig ? 'Cerrar' : 'IP Manual'}
                  </button>
                </div>
              </div>

              {showServerConfig && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="ej. 192.168.43.120:8081"
                    value={manualIpInput}
                    onChange={(e) => setManualIpInput(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveManualServer}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              )}
            </div>
          )}
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