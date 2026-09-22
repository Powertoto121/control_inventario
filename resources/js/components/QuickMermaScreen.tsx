import React, { useState, useEffect } from 'react';
import { Producto, MotivoMermaId, Usuario } from '../types';
import { getFifoStatus } from '../utils/fifoUtils';
import { CalendarX2, PackageX, AlertTriangle, HelpCircle, Check, Search } from 'lucide-react';

interface QuickMermaScreenProps {
  productos: Producto[];
  currentUser?: Usuario | null;
  onSaveMerma: (mermaData: {
    productoId: any;
    cantidad: number;
    motivoId: MotivoMermaId;
    notas: string;
    responsable: string;
  }) => void;
  onClose?: () => void;
}

export const QuickMermaScreen: React.FC<QuickMermaScreenProps> = ({
  productos = [],
  currentUser,
  onSaveMerma,
  onClose,
}) => {
  const isCajero = (currentUser?.rol || currentUser?.role) === 'cajero';
  const [selectedProductoId, setSelectedProductoId] = useState<string | number>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [cantidad, setCantidad] = useState<number>(1);
  const [selectedMotivo, setSelectedMotivo] = useState<MotivoMermaId>('caducidad');
  const [notas, setNotas] = useState('');
  const [responsable, setResponsable] = useState(
    currentUser?.nombre || currentUser?.name || 'Turno Mostrador'
  );

  const getNombre = (p: Producto) => p.nombre ?? 'Sin nombre';
  const getCategoria = (p: Producto) => p.categoria ?? p.category ?? 'General';
  const getCodigo = (p: Producto) => p.codigoBarras ?? p.sku ?? String(p.id ?? '');
  const getStock = (p: Producto) => p.stockActual ?? p.stock ?? 0;
  const getCosto = (p: Producto) => p.costoCompra ?? p.costo ?? 0;
  const getUnidad = (p: Producto) => p.unidadMedida ?? 'pza';

  useEffect(() => {
    if (currentUser) {
      setResponsable(currentUser.nombre || currentUser.name || 'Turno Mostrador');
    }
  }, [currentUser]);

  const selectedProduct = productos.find(
    (p) => String(p.id) === String(selectedProductoId)
  );

  const categoriasDisponibles = ['Todas', ...Array.from(new Set(productos.map((p) => getCategoria(p))))];

  const filteredProductos = productos.filter((p) => {
    const matchesSearch =
      getNombre(p).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoria(p).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCodigo(p).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'Todas' || getCategoria(p) === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const costoTotalEstimado = selectedProduct
    ? (getCosto(selectedProduct) * cantidad).toFixed(2)
    : '0.00';

  const handleConfirm = () => {
    if (!selectedProduct || cantidad <= 0) return;

    onSaveMerma({
      productoId: selectedProduct.id,
      cantidad,
      motivoId: selectedMotivo,
      notas,
      responsable,
    });

    setSelectedProductoId('');
    setCantidad(1);
    setNotas('');
  };

  const motivosDisponibles: Array<{ id: MotivoMermaId; label: string; desc: string; icon: React.ReactNode }> = [
    { id: 'caducidad', label: 'Fecha Vencida / Caducidad', desc: 'Llegó a su fecha límite de consumo', icon: <CalendarX2 className="w-5 h-5 text-rose-600" /> },
    { id: 'empaque_danado', label: 'Empaque Dañado / Roto', desc: 'Bolsa rota, lata abollada o empaque abierto', icon: <PackageX className="w-5 h-5 text-amber-600" /> },
    { id: 'mal_estado', label: 'Descomposición / Mal Estado', desc: 'Fruta/verdura madura o producto alterado', icon: <AlertTriangle className="w-5 h-5 text-orange-600" /> },
    { id: 'otro', label: 'Robo / Ajuste / Otro', desc: 'Diferencia de inventario o causa diversa', icon: <HelpCircle className="w-5 h-5 text-stone-600" /> },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-500/10 p-4 sm:p-5 rounded-2xl border border-amber-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            ⚠️
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Registro Rápido de Merma</h1>
            <p className="text-xs text-stone-600">Reporta artículos dañados o caducados para ajustar el inventario real.</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="self-start sm:self-auto px-4 py-2 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl border border-stone-200 transition cursor-pointer"
          >
            Cerrar Vista
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
              1. Selecciona el Producto
            </h2>

            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, código o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categoriasDisponibles.map((cat: string) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredProductos.map((prod) => {
                const isSelected = String(prod.id) === String(selectedProductoId);
                const stock = getStock(prod);
                const fifo = prod.fechaCaducidadProxima ? getFifoStatus(prod.fechaCaducidadProxima) : null;

                return (
                  <button
                    key={String(prod.id ?? getCodigo(prod))}
                    onClick={() => setSelectedProductoId(prod.id ?? '')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500 shadow-xs'
                        : 'bg-white border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-xl w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 border border-stone-200 text-amber-800">
                      📦
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-stone-900 text-sm truncate">
                        {getNombre(prod)}
                      </p>
                      <p className="text-xs text-stone-500">
                        Stock: <strong className="text-stone-800">{stock} {getUnidad(prod)}</strong>
                      </p>
                      {fifo && (
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded mt-1.5 ${
                            fifo.nivel === 'critico'
                              ? 'bg-rose-100 text-rose-800'
                              : fifo.nivel === 'proximo'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          <span>{fifo.iconoEmoji}</span>
                          <span>{fifo.diasRestantes <= 0 ? 'Caducado' : `${fifo.diasRestantes}d restantes`}</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredProductos.length === 0 && (
                <div className="col-span-2 py-12 text-center text-stone-400 text-sm">
                  No se encontraron productos coincidentes.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-5 sticky top-6">
            <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
              2. Detalles de la Merma
            </h2>

            {selectedProduct ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-xl w-10 h-10 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0 text-amber-800">
                    📦
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-stone-900 text-sm truncate">
                      {getNombre(selectedProduct)}
                    </h3>
                    <p className="text-xs text-stone-500">
                      Stock actual: <strong className="text-stone-800">{getStock(selectedProduct)} {getUnidad(selectedProduct)}</strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Cantidad a Descontar:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                      className="w-11 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xl border border-stone-300 transition cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0.1}
                      max={getStock(selectedProduct)}
                      value={cantidad}
                      onChange={(e) => setCantidad(Math.max(0.1, parseFloat(e.target.value) || 1))}
                      className="flex-1 h-11 text-center font-bold text-lg bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setCantidad((prev) => Math.min(getStock(selectedProduct), prev + 1))}
                      className="w-11 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xl border border-stone-300 transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Motivo del Retiro:
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {motivosDisponibles.map((m) => {
                      const isSelected = selectedMotivo === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMotivo(m.id)}
                          className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500'
                              : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {m.icon}
                            <div>
                              <p className="font-bold text-xs text-stone-900">{m.label}</p>
                              <p className="text-[10px] text-stone-500">{m.desc}</p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-amber-600 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {!isCajero && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-medium text-red-800">Costo Estimado de Pérdida:</span>
                    <span className="text-sm font-extrabold text-red-700">-${costoTotalEstimado} MXN</span>
                  </div>
                )}

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Notas:</label>
                    <input
                      type="text"
                      placeholder="Ej. Paquete roto en transporte..."
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Responsable:</label>
                    <input
                      type="text"
                      disabled={isCajero}
                      value={responsable}
                      onChange={(e) => setResponsable(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-700"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!selectedProduct || cantidad <= 0}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Confirmar y Descontar Merma</span>
                </button>
              </>
            ) : (
              <div className="py-12 text-center text-stone-400 space-y-2">
                <p className="text-3xl">👈</p>
                <p className="text-xs font-medium">Selecciona un producto de la lista izquierda para ingresar los detalles de la merma.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};