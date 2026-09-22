import React, { useState } from 'react';
import { Producto, Usuario } from '../types';
import { getFifoStatus } from '../utils/fifoUtils';
import { getCategoryIcon } from '../utils/categoryUtils';
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  PackageX,
  AlertTriangle,
  CheckCircle2,
  CalendarX2,
  Barcode,
} from 'lucide-react';

interface InventoryViewProps {
  productos: Producto[];
  currentUser?: Usuario | null;
  onOpenNewProductModal: () => void;
  onEditProduct: (product: Producto) => void;
  onDeleteProduct: (productId: number | string) => void;
  onOpenQuickMermaForProduct: (product: Producto) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  productos = [],
  currentUser,
  onOpenNewProductModal,
  onEditProduct,
  onDeleteProduct,
  onOpenQuickMermaForProduct,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const isCajero = (currentUser?.rol || currentUser?.role) === 'cajero';

  // Extractores seguros
  const getNombre = (p: Producto) => p.nombre ?? 'Sin nombre';
  const getCategoria = (p: Producto) => p.categoria ?? p.category ?? 'General';
  const getCodigo = (p: Producto) => p.codigoBarras ?? p.sku ?? String(p.id ?? '');
  const getStock = (p: Producto) => p.stockActual ?? p.stock ?? 0;
  const getMinStock = (p: Producto) => p.stockMinimo ?? p.minStock ?? 1;
  const getCosto = (p: Producto) => p.costoCompra ?? p.costo ?? 0;
  const getPrecio = (p: Producto) => p.precioVenta ?? p.precio ?? 0;
  const getUnidad = (p: Producto) => p.unidadMedida ?? 'pza';

  const categorias = ['Todas', ...Array.from(new Set(productos.map((p) => getCategoria(p))))];

  const filtered = productos.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      getNombre(p).toLowerCase().includes(q) ||
      getCodigo(p).toLowerCase().includes(q);
    const matchCat = selectedCategory === 'Todas' || getCategoria(p) === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o código de barras..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {!isCajero && (
          <button
            id="add-product-btn"
            onClick={onOpenNewProductModal}
            className="w-full md:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Producto</span>
          </button>
        )}
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((prod) => {
          const stock = getStock(prod);
          const minStock = getMinStock(prod);
          const categoria = getCategoria(prod);
          const isAgotado = stock === 0;
          const isBajo = stock <= minStock && !isAgotado;
          const fifo = prod.fechaCaducidadProxima ? getFifoStatus(prod.fechaCaducidadProxima) : null;
          const categoryIcon = getCategoryIcon(categoria);

          return (
            <div
              key={prod.id ?? getCodigo(prod)}
              id={`inventory-item-${prod.id}`}
              className={`bg-white rounded-2xl p-4 border transition flex flex-col justify-between shadow-2xs hover:shadow-sm ${
                isAgotado
                  ? 'border-rose-300 ring-1 ring-rose-100'
                  : isBajo
                  ? 'border-amber-300 ring-1 ring-amber-100'
                  : 'border-stone-200'
              }`}
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
  📦
</span>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        {categoria}
                      </span>
                      <h3 className="font-bold text-stone-900 text-sm leading-tight line-clamp-1">
                        {getNombre(prod)}
                      </h3>
                    </div>
                  </div>

                  {/* Stock Status Badge */}
                  <div>
                    {isAgotado ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                        <PackageX className="w-3 h-3" />
                        Agotado
                      </span>
                    ) : isBajo ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200 inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Bajo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Óptimo
                      </span>
                    )}
                  </div>
                </div>

                {/* Detalle Stock y Código */}
                <div className="py-2 border-y border-stone-100 my-2 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Stock Actual:</span>
                    <span className="font-bold text-stone-900">
                      {stock} {getUnidad(prod)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-stone-600">
                    <span>Stock Mínimo:</span>
                    <span className="font-semibold text-stone-700">
                      {minStock} {getUnidad(prod)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-stone-400 font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Barcode className="w-3 h-3" />
                      Código:
                    </span>
                    <span>{getCodigo(prod)}</span>
                  </div>

                  {!isCajero && (
                    <div className="flex justify-between items-center pt-1 border-t border-stone-100 text-stone-600">
                      <span>Costo / Precio:</span>
                      <span className="font-semibold">
                        ${getCosto(prod).toFixed(2)} / <strong className="text-emerald-700">${getPrecio(prod).toFixed(2)}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* PEPS Badge */}
                {fifo && (
                  <div
                    className={`mt-2.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center justify-between ${fifo.badgeBg} ${fifo.badgeBorder} ${fifo.badgeText}`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <CalendarX2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{fifo.etiquetaDetallada}</span>
                    </div>
                    <span className="font-bold shrink-0">{fifo.iconoEmoji}</span>
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="mt-4 pt-2 flex items-center justify-between gap-2">
                <button
                  id={`report-merma-btn-${prod.id}`}
                  onClick={() => onOpenQuickMermaForProduct(prod)}
                  className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition border border-rose-200 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <PackageX className="w-3.5 h-3.5" />
                  <span>Reportar Merma</span>
                </button>

                {!isCajero && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditProduct(prod)}
                      className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-lg border border-stone-200 transition cursor-pointer"
                      title="Editar producto"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(prod.id ?? '')}
                      className="p-1.5 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg border border-stone-200 transition cursor-pointer"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-stone-200">
            <Package className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <h4 className="text-base font-bold text-stone-800">No se encontraron productos</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              No hay artículos que coincidan con la búsqueda o filtro seleccionado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};