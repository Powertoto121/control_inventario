import React from 'react';
import { Usuario } from '../types';
import { 
  Package, 
  RefreshCw, 
  AlertTriangle, 
  BarChart3, 
  Users, 
  LogOut, 
  PackageX 
} from 'lucide-react';

interface NavbarProps {
  currentUser: Usuario;
  currentTab: string;
  onSelectTab: (tab: 'inventory' | 'quick-merma' | 'restock' | 'analytics' | 'users') => void;
  onLogout: () => void;
  onOpenQuickMerma: () => void;
  totalAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentTab,
  onSelectTab,
  onLogout,
  totalAlertsCount,
}) => {
  const isCajero = (currentUser.rol || currentUser.role) === 'cajero';
  const roleName = isCajero ? 'Operador / Cajero' : 'Administrador';

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Cabecera superior simplificada */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-xs">
              🛒
            </div>
            <div>
              <h1 className="text-base font-black text-stone-900 tracking-tight">
                Mi Tiendita • Control & Mermas
              </h1>
            </div>
          </div>

          {/* Información del usuario y botón de cerrar sesión */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center text-xs font-bold">
                👤
              </div>
              <div className="text-xs">
                <p className="font-bold text-stone-900 leading-none">
                  {currentUser.nombre || currentUser.name}
                </p>
                <span className="text-[10px] text-stone-500 font-medium">
                  {roleName}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="px-3 py-2 bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-stone-200"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Barra de Pestañas / Navegación */}
        <nav className="flex items-center gap-1.5 pt-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onSelectTab('inventory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              currentTab === 'inventory'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventario & Stock</span>
            {totalAlertsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-black">
                {totalAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('quick-merma')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              currentTab === 'quick-merma'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <PackageX className="w-4 h-4" />
            <span>Módulo de Merma Express</span>
          </button>

          <button
            onClick={() => onSelectTab('restock')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              currentTab === 'restock'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Alertas de Reabastecimiento</span>
          </button>

          {!isCajero && (
            <>
              <button
                onClick={() => onSelectTab('analytics')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  currentTab === 'analytics'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Control de Pérdidas ($)</span>
              </button>

              <button
                onClick={() => onSelectTab('users')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  currentTab === 'users'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Gestión de Personal</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};