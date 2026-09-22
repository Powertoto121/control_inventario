import React, { useState, useEffect } from 'react';
import { Producto } from '../types';
import { getCategoryIcon } from '../utils/categoryUtils';
import { X, Check, Barcode } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (productData: Omit<Producto, 'id'>, existingId?: number) => void;
  productToEdit?: Producto | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSaveProduct,
  productToEdit,
}) => {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState<string>('Abarrotes');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [unidadMedida, setUnidadMedida] = useState<'pza' | 'kg' | 'litro' | 'paq' | string>('pza');
  const [costoCompra, setCostoCompra] = useState<number>(15);
  const [precioVenta, setPrecioVenta] = useState<number>(22);
  const [stockActual, setStockActual] = useState<number>(10);
  const [stockMinimo, setStockMinimo] = useState<number>(5);

  useEffect(() => {
    if (productToEdit) {
      setNombre(productToEdit.nombre || '');
      setCategoria(productToEdit.categoria || productToEdit.category || 'Abarrotes');
      setCodigoBarras(productToEdit.codigoBarras || productToEdit.sku || '');
      setUnidadMedida(productToEdit.unidadMedida || 'pza');
      setCostoCompra(productToEdit.costoCompra ?? productToEdit.costo ?? 15);
      setPrecioVenta(productToEdit.precioVenta ?? productToEdit.precio ?? 22);
      setStockActual(productToEdit.stockActual ?? productToEdit.stock ?? 10);
      setStockMinimo(productToEdit.stockMinimo ?? productToEdit.minStock ?? 5);
    } else {
      setNombre('');
      setCategoria('Abarrotes');
      setCodigoBarras(Math.floor(100000000000 + Math.random() * 900000000000).toString());
      setUnidadMedida('pza');
      setCostoCompra(15);
      setPrecioVenta(22);
      setStockActual(10);
      setStockMinimo(5);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const categoryIcon = getCategoryIcon(categoria);

  const renderIcon = (icon: any) => {
    if (typeof icon === 'function') {
      return React.createElement(icon, { className: 'w-5 h-5' });
    }
    if (React.isValidElement(icon)) {
      return icon;
    }
    return <span>{String(icon ?? '📦')}</span>;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    onSaveProduct(
      {
        nombre: nombre.trim(),
        categoria,
        category: categoria,
        codigoBarras: codigoBarras.trim() || Math.floor(100000000000 + Math.random() * 900000000000).toString(),
        sku: codigoBarras.trim() || Math.floor(100000000000 + Math.random() * 900000000000).toString(),
        unidadMedida,
        costoCompra: Number(costoCompra),
        costo: Number(costoCompra),
        precioVenta: Number(precioVenta),
        precio: Number(precioVenta),
        stockActual: Number(stockActual),
        stock: Number(stockActual),
        stockMinimo: Number(stockMinimo),
        minStock: Number(stockMinimo),
        tasaVentaDiaria: productToEdit?.tasaVentaDiaria ?? 3,
        imagenEmoji: typeof categoryIcon === 'string' ? categoryIcon : '📦',
        fechaCaducidadProxima: productToEdit?.fechaCaducidadProxima,
      },
      productToEdit?.id ? Number(productToEdit.id) : undefined
    );
    onClose();
  };

  const generateBarcode = () => {
    setCodigoBarras(Math.floor(100000000000 + Math.random() * 900000000000).toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-stone-50 border-b border-stone-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              {renderIcon(categoryIcon)}
            </span>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                {productToEdit ? 'Editar Producto' : 'Dar de Alta Nuevo Producto'}
              </h3>
              <p className="text-[11px] text-stone-500">
                Categoría seleccionada: {categoria}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 text-stone-500 flex items-center justify-center border border-stone-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Nombre */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Nombre del producto *
            </label>
            <input
              type="text"
              required
              id="product-input-name"
              placeholder="Ej. Frijoles Refritos 430g"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          {/* Código de Barras */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-700">
                Código de Barras
              </label>
              <button
                type="button"
                onClick={generateBarcode}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Barcode className="w-3.5 h-3.5" />
                <span>Generar automático</span>
              </button>
            </div>
            <input
              type="text"
              id="product-input-barcode"
              placeholder="750102051234"
              value={codigoBarras}
              onChange={(e) => setCodigoBarras(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Categoría y Unidad de Medida */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Categoría (Ícono automático)
              </label>
              <select
                id="product-input-category"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Lácteos">🥛 Lácteos</option>
                <option value="Panadería">🍞 Panadería</option>
                <option value="Frutas y Verduras">🍎 Frutas y Verduras</option>
                <option value="Embutidos y Carnes">🥩 Embutidos y Carnes</option>
                <option value="Abarrotes">🥫 Abarrotes</option>
                <option value="Bebidas">🥤 Bebidas</option>
                <option value="Snacks y Dulces">🍿 Snacks y Dulces</option>
                <option value="Limpieza">🧹 Limpieza</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Unidad de Medida
              </label>
              <select
                id="product-input-unit"
                value={unidadMedida}
                onChange={(e) => setUnidadMedida(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="pza">Pieza (pza)</option>
                <option value="kg">Kilogramo (kg)</option>
                <option value="litro">Litro</option>
                <option value="paq">Paquete (paq)</option>
              </select>
            </div>
          </div>

          {/* Precios (Costo y Venta) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Costo de Compra ($ MXN)
              </label>
              <input
                type="number"
                id="product-input-cost"
                step="0.5"
                min="0"
                value={costoCompra}
                onChange={(e) => setCostoCompra(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Precio de Venta ($ MXN)
              </label>
              <input
                type="number"
                id="product-input-price"
                step="0.5"
                min="0"
                value={precioVenta}
                onChange={(e) => setPrecioVenta(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Stocks (Actual y Mínimo) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Stock Actual
              </label>
              <input
                type="number"
                id="product-input-stock"
                min="0"
                value={stockActual}
                onChange={(e) => setStockActual(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Stock Mínimo (Alerta)
              </label>
              <input
                type="number"
                id="product-input-minstock"
                min="1"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              id="product-save-btn"
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>{productToEdit ? 'Guardar Cambios' : 'Registrar Producto en Inventario'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};