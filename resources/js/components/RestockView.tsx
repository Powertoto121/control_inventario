import React, { useState } from 'react';
import { Producto } from '../types';
import { getFifoStatus } from '../utils/fifoUtils';
import {
  RefreshCw,
  Search,
  AlertTriangle,
  PackageX,
  CheckCircle2,
  CalendarX2,
  Plus,
  TrendingUp,
} from 'lucide-react';

interface RestockViewProps {
  productos: Producto[];
  onOpenNewProductModal?: () => void;
  onOpenQuickMermaForProduct?: (product: Producto) => void;
}

export const RestockView: React.FC<RestockViewProps> = ({
  productos = [],
  onOpenNewProductModal,
  onOpenQuickMermaForProduct,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'agotados' | 'bajos' | 'criticos_peps'>('todos');

  // Extractores seguros
  const getNombre = (p: Producto) => p.nombre ?? 'Sin nombre';
  const getCategoria = (p: Producto) => p.categoria ?? p.category ?? 'General';
  const getCodigo = (p: Producto) => p.codigoBarras ?? p.sku ?? String(p.id ?? '');
  const getStock = (p: Producto) => p.stockActual ?? p.stock ?? 0;
  const getMinStock = (p: Producto) => p.stockMinimo ?? p.minStock ?? 1;
  const getUnidad = (p: Producto) => p.unidadMedida ?? 'pza';

  // Productos que requieren atención (Agotados, Bajos o Próximos a Vencer)
  const productosEnAlerta = productos.filter((p) => {
    const stock = getStock(p);
    const minStock = getMinStock(p);
    const isAgotado = stock === 0;
    const isBajo = stock <= minStock;
    const fifo = p.fechaCaducidadProxima ? getFifoStatus(p.fechaCaducidadProxima) : null;
    const isCriticoPeps = fifo ? fifo.nivel === 'critico' || fifo.nivel === 'proximo' || fifo.nivel === 'vencido' : false;

    return isAgotado || isBajo || isCriticoPeps;
  });

  const itemsFiltrados = productosEnAlerta.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      getNombre(p).toLowerCase().includes(q) ||
      getCategoria(p).toLowerCase().includes(q) ||
      getCodigo(p).toLowerCase().includes(q);

    const stock = getStock(p);
    const minStock = getMinStock(p);
    const fifo = p.fechaCaducidadProxima ? getFifoStatus(p.fechaCaducidadProxima) : null;

    if (!matchSearch) return false;

    if (filterType === 'agotados') return stock === 0;
    if (filterType === 'bajos') return stock > 0 && stock <= minStock;
    if (filterType === 'criticos_peps') {
      return fifo ? fifo.nivel === 'critico' || fifo.nivel === 'vencido' : false;
    }

    return true;
  });

  const countAgotados = productos.filter((p) => getStock(p) === 0).length;
  const countBajos = productos.filter((p) => getStock(p) > 0 && getStock(p) <= getMinStock(p)).length;
  const countPeps = productos.filter((p) => {
    if (!p.fechaCaducidadProxima) return false;
    const f = getFifoStatus(p.fechaCaducidadProxima);
    return f.nivel === 'critico' || f.nivel === 'vencido';
  }).length;

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
              <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
              <span>Sugerencia de Compras & Resurtido</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Reabastecimiento de Stock
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mt-1 leading-relaxed">
              Monitorea los productos que han alcanzado su límite mínimo, artículos agotados y lotes próximos a vencer para priorizar compras a proveedores.
            </p>
          </div>

          {onOpenNewProductModal && (
            <button
              onClick={onOpenNewProductModal}
              className="self-start sm:self-auto px-4 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Alta de Producto</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setFilterType('agotados')}
          className={`p-4 rounded-xl border transition text-left cursor-pointer ${
            filterType === 'agotados'
              ? 'bg-rose-500 text-white border-rose-600 shadow-md'
              : 'bg-white text-stone-800 border-stone-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold ${filterType === 'agotados' ? 'text-rose-100' : 'text-rose-700'}`}>
              Sin Stock (Agotados)
            </span>
            <PackageX className={`w-4 h-4 ${filterType === 'agotados' ? 'text-white' : 'text-rose-500'}`} />
          </div>
          <p className="text-2xl font-black">{countAgotados}</p>
          <span className={`text-[11px] ${filterType === 'agotados' ? 'text-rose-100' : 'text-stone-500'}`}>
            Prioridad Máxima de Compra
          </span>
        </button>

        <button
          onClick={() => setFilterType('bajos')}
          className={`p-4 rounded-xl border transition text-left cursor-pointer ${
            filterType === 'bajos'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md'
              : 'bg-white text-stone-800 border-stone-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold ${filterType === 'bajos' ? 'text-amber-100' : 'text-amber-800'}`}>
              Stock Bajo el Mínimo
            </span>
            <AlertTriangle className={`w-4 h-4 ${filterType === 'bajos' ? 'text-white' : 'text-amber-600'}`} />
          </div>
          <p className="text-2xl font-black">{countBajos}</p>
          <span className={`text-[11px] ${filterType === 'bajos' ? 'text-amber-100' : 'text-stone-500'}`}>
            Reorden Sugerida
          </span>
        </button>

        <button
          onClick={() => setFilterType('criticos_peps')}
          className={`p-4 rounded-xl border transition text-left cursor-pointer ${
            filterType === 'criticos_peps'
              ? 'bg-orange-500 text-white border-orange-600 shadow-md'
              : 'bg-white text-stone-800 border-stone-200 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold ${filterType === 'criticos_peps' ? 'text-orange-100' : 'text-orange-800'}`}>
              Riesgo Caducidad PEPS
            </span>
            <CalendarX2 className={`w-4 h-4 ${filterType === 'criticos_peps' ? 'text-white' : 'text-orange-600'}`} />
          </div>
          <p className="text-2xl font-black">{countPeps}</p>
          <span className={`text-[11px] ${filterType === 'criticos_peps' ? 'text-orange-100' : 'text-stone-500'}`}>
            Vencen en &le; 3 Días
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por producto, categoría o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterType('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              filterType === 'todos'
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            Todos en Alerta ({productosEnAlerta.length})
          </button>
        </div>
      </div>

      {/* Grid de Productos que requieren resurtido */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {itemsFiltrados.map((prod) => {
          const stock = getStock(prod);
          const minStock = getMinStock(prod);
          const cat = getCategoria(prod);
          const isAgotado = stock === 0;
          const fifo = prod.fechaCaducidadProxima ? getFifoStatus(prod.fechaCaducidadProxima) : null;
          const cantSugeridaResurtido = Math.max(minStock * 2 - stock, minStock);

          return (
            <div
              key={String(prod.id ?? getCodigo(prod))}
              className={`bg-white rounded-2xl p-5 border transition flex flex-col justify-between shadow-2xs hover:shadow-sm ${
                isAgotado
                  ? 'border-rose-300 ring-1 ring-rose-100'
                  : 'border-amber-300 ring-1 ring-amber-100'
              }`}
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-11 h-11 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 text-amber-800">
                      📦
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        {cat}
                      </span>
                      <h3 className="font-bold text-stone-900 text-base leading-tight">
                        {getNombre(prod)}
                      </h3>
                    </div>
                  </div>

                  <div>
                    {isAgotado ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
                        Agotado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                        Stock Bajo
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Details */}
                <div className="py-2.5 border-y border-stone-100 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Stock Actual:</span>
                    <span className={`font-extrabold ${isAgotado ? 'text-rose-600' : 'text-amber-700'}`}>
                      {stock} {getUnidad(prod)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-stone-600">
                    <span>Mínimo Configurado:</span>
                    <span className="font-semibold text-stone-800">
                      {minStock} {getUnidad(prod)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-stone-100 text-emerald-800 font-medium">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      Sugerencia de Recompra:
                    </span>
                    <span className="font-bold text-emerald-700">
                      +{cantSugeridaResurtido} {getUnidad(prod)}
                    </span>
                  </div>
                </div>

                {/* PEPS Banner */}
                {fifo && (
                  <div className={`mt-3 p-2 rounded-xl border text-xs flex items-center justify-between ${fifo.badgeBg} ${fifo.badgeBorder} ${fifo.badgeText}`}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <CalendarX2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{fifo.etiquetaDetallada}</span>
                    </div>
                    <span className="font-bold shrink-0">{fifo.iconoEmoji}</span>
                  </div>
                )}
              </div>

              {/* Botón de Acción rápida */}
              {onOpenQuickMermaForProduct && (
                <div className="mt-4 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => onOpenQuickMermaForProduct(prod)}
                    className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition border border-rose-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PackageX className="w-3.5 h-3.5" />
                    <span>Reportar Merma de este producto</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {itemsFiltrados.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-stone-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-base font-bold text-stone-800">
              {productosEnAlerta.length === 0
                ? '¡Todo el inventario está en niveles óptimos!'
                : 'No hay productos bajo este filtro seleccionado.'}
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              {productosEnAlerta.length === 0
                ? 'Ningún artículo ha sobrepasado su límite mínimo ni se encuentra agotado.'
                : 'Prueba cambiar los filtros superiores para explorar más alertas.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};