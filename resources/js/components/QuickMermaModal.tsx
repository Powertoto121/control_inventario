import React, { useState, useEffect } from 'react';
import { Producto, MotivoMermaId, Usuario } from '../types';
import { getFifoStatus } from '../utils/fifoUtils';
import { getCategoryIcon } from '../utils/categoryUtils';
import { X, CalendarX2, PackageX, AlertTriangle, HelpCircle, Check, ArrowRight } from 'lucide-react';

interface QuickMermaModalProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
  initialProducto?: Producto | null;
  currentUser?: Usuario | null;
  onSaveMerma: (mermaData: {
    productoId: any;
    cantidad: number;
    motivoId: MotivoMermaId;
    notas: string;
    responsable: string;
  }) => void;
}

export const QuickMermaModal: React.FC<QuickMermaModalProps> = ({
  isOpen,
  onClose,
  productos = [],
  initialProducto,
  currentUser,
  onSaveMerma,
}) => {
  const isCajero = (currentUser?.rol || currentUser?.role) === 'cajero';
  const [selectedProductoId, setSelectedProductoId] = useState<string | number>(
    initialProducto?.id ?? ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [selectedMotivo, setSelectedMotivo] = useState<MotivoMermaId>('caducidad');
  const [notas, setNotas] = useState('');
  const [responsable, setResponsable] = useState(
    currentUser?.nombre || currentUser?.name || 'Turno Mostrador'
  );
  const [paso, setPaso] = useState<1 | 2>(initialProducto ? 2 : 1);

  const getNombre = (p: Producto) => p.nombre ?? 'Sin nombre';
  const getCategoria = (p: Producto) => p.categoria ?? p.category ?? 'General';
  const getCodigo = (p: Producto) => p.codigoBarras ?? p.sku ?? String(p.id ?? '');
  const getStock = (p: Producto) => p.stockActual ?? p.stock ?? 0;
  const getCosto = (p: Producto) => p.costoCompra ?? p.costo ?? 0;
  const getUnidad = (p: Producto) => p.unidadMedida ?? 'pza';

  const renderIcon = (icon: any) => {
    if (typeof icon === 'function') {
      return React.createElement(icon, { className: 'w-5 h-5' });
    }
    if (React.isValidElement(icon)) {
      return icon;
    }
    return <span>{String(icon ?? '📦')}</span>;
  };

  useEffect(() => {
    if (currentUser) {
      setResponsable(currentUser.nombre || currentUser.name || 'Turno Mostrador');
    }
  }, [currentUser]);

  useEffect(() => {
    if (initialProducto && initialProducto.id !== undefined) {
      setSelectedProductoId(initialProducto.id);
      setPaso(2);
    } else {
      setSelectedProductoId('');
      setPaso(1);
    }
    setCantidad(1);
    setSelectedMotivo('caducidad');
    setNotas('');
  }, [initialProducto, isOpen]);

  if (!isOpen) return null;

  const currentProducto = productos.find(
    (p) => String(p.id) === String(selectedProductoId)
  );

  const filteredProductos = productos.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      getNombre(p).toLowerCase().includes(q) ||
      getCategoria(p).toLowerCase().includes(q) ||
      getCodigo(p).toLowerCase().includes(q)
    );
  });

  const costoTotalEstimado = currentProducto
    ? (getCosto(currentProducto) * cantidad).toFixed(2)
    : '0.00';

  const handleSelectProduct = (prod: Producto) => {
    if (prod.id !== undefined) {
      setSelectedProductoId(prod.id);
    }
    setPaso(2);
  };

  const handleConfirm = () => {
    if (!currentProducto || cantidad <= 0) return;

    onSaveMerma({
      productoId: currentProducto.id,
      cantidad,
      motivoId: selectedMotivo,
      notas,
      responsable,
    });
    onClose();
  };

  const motivosDisponibles: Array<{ id: MotivoMermaId; label: string; desc: string; icon: React.ReactNode }> = [
    { id: 'caducidad', label: 'Fecha Vencida / Caducidad', desc: 'Llegó a su fecha límite de consumo', icon: <CalendarX2 className="w-5 h-5 text-rose-600" /> },
    { id: 'empaque_danado', label: 'Empaque Dañado / Roto', desc: 'Bolsa rota, lata abollada o empaque abierto', icon: <PackageX className="w-5 h-5 text-amber-600" /> },
    { id: 'mal_estado', label: 'Descomposición / Mal Estado', desc: 'Fruta/verdura madura o producto alterado', icon: <AlertTriangle className="w-5 h-5 text-orange-600" /> },
    { id: 'otro', label: 'Robo / Ajuste / Otro', desc: 'Diferencia de inventario o causa diversa', icon: <HelpCircle className="w-5 h-5 text-stone-600" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              ⚠️
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 leading-tight">
                Registrar Merma / Pérdida
              </h2>
              <p className="text-xs text-stone-600">
                Paso {paso} de 2: {paso === 1 ? 'Selecciona el producto' : 'Indica cantidad y motivo'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-stone-500 hover:text-stone-800 flex items-center justify-center transition border border-stone-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {paso === 1 ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">
                  Buscar producto a reportar:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Escribe el nombre o categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-base"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 text-xs bg-stone-200 px-2 py-0.5 rounded-md cursor-pointer"
                    >
                      Borrar
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Productos disponibles ({filteredProductos.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                  {filteredProductos.map((prod) => {
                    const fifo = prod.fechaCaducidadProxima ? getFifoStatus(prod.fechaCaducidadProxima) : null;
                    const stock = getStock(prod);
                    const categoria = getCategoria(prod);
                    const icon = getCategoryIcon(categoria);

                    return (
                      <button
                        key={String(prod.id ?? getCodigo(prod))}
                        onClick={() => handleSelectProduct(prod)}
                        className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-white hover:border-amber-400 hover:bg-amber-50/50 text-left transition cursor-pointer"
                      >
                        <span className="text-xl w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 border border-stone-200 text-amber-800">
                          {renderIcon(icon)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-stone-900 text-sm truncate">
                            {getNombre(prod)}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap text-xs text-stone-500 mt-0.5">
                            <span>
                              Stock: <strong className="text-stone-700">{stock} {getUnidad(prod)}</strong>
                            </span>
                          </div>
                          {fifo && (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 ${
                                fifo.nivel === 'critico'
                                  ? 'bg-rose-100 text-rose-800'
                                  : fifo.nivel === 'proximo'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              <span>{fifo.iconoEmoji}</span>
                              <span>
                                {fifo.nivel === 'critico' || fifo.nivel === 'proximo'
                                  ? `PEPS: Vence en ${fifo.diasRestantes}d`
                                  : `Caduca: ${prod.fechaCaducidadProxima}`}
                              </span>
                            </span>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-300 shrink-0" />
                      </button>
                    );
                  })}
                  {filteredProductos.length === 0 && (
                    <div className="col-span-2 py-8 text-center text-stone-400 text-sm">
                      No encontramos ningún producto con ese nombre.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {currentProducto && (
                <div className="flex items-center justify-between p-3.5 bg-stone-100/80 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl w-11 h-11 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0 text-amber-800">
                      {renderIcon(getCategoryIcon(getCategoria(currentProducto)))}
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                        {getCategoria(currentProducto)}
                      </span>
                      <h3 className="font-bold text-stone-900 text-base truncate">
                        {getNombre(currentProducto)}
                      </h3>
                      <p className="text-xs text-stone-600">
                        Stock actual: <strong className="text-stone-800">{getStock(currentProducto)} {getUnidad(currentProducto)}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPaso(1)}
                    className="text-xs font-medium text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg shrink-0 ml-2 cursor-pointer"
                  >
                    Cambiar
                  </button>
                </div>
              )}

              {/* Cantidad */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-800 flex items-center justify-between">
                  <span>¿Cuántas piezas / unidades se dañaron o perdieron?</span>
                  <span className="text-xs text-stone-500">
                    Máx: {currentProducto ? getStock(currentProducto) : 0}
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                    className="w-12 h-12 rounded-xl bg-stone-100 text-stone-800 text-2xl font-bold flex items-center justify-center border border-stone-300 cursor-pointer"
                  >
                    -
                  </button>

                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={0.1}
                      step={getUnidad(currentProducto!) === 'kg' ? '0.5' : '1'}
                      max={currentProducto ? getStock(currentProducto) : 999}
                      value={cantidad}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setCantidad(isNaN(val) ? 1 : Math.max(0.1, val));
                      }}
                      className="w-full h-12 text-center text-xl font-bold bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-3.5 text-xs font-semibold text-stone-500 uppercase">
                      {currentProducto ? getUnidad(currentProducto) : 'pza'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setCantidad((prev) =>
                        currentProducto
                          ? Math.min(getStock(currentProducto), prev + 1)
                          : prev + 1
                      )
                    }
                    className="w-12 h-12 rounded-xl bg-stone-100 text-stone-800 text-2xl font-bold flex items-center justify-center border border-stone-300 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-xs text-stone-500 mr-1">Rápido:</span>
                  {[1, 2, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() =>
                        setCantidad(
                          currentProducto
                            ? Math.min(getStock(currentProducto), num)
                            : num
                        )
                      }
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer ${
                        cantidad === num
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      {num} {currentProducto ? getUnidad(currentProducto) : 'pza'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Motivos Estático */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-800">
                  ¿Por qué motivo se retira del inventario?
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  {motivosDisponibles.map((m) => {
                    const isSelected = selectedMotivo === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMotivo(m.id)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500'
                            : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>{m.icon}</div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-stone-900">{m.label}</p>
                          <p className="text-[11px] text-stone-500 leading-tight">{m.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {!isCajero ? (
                <div className="bg-red-50/70 border border-red-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                      💰
                    </div>
                    <div>
                      <p className="text-xs text-red-800 font-medium">Pérdida Monetaria Estimada:</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-red-700">
                      -${costoTotalEstimado} MXN
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      📦
                    </div>
                    <div>
                      <p className="text-xs text-amber-900 font-semibold">Descuento de Inventario:</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-800">
                      {cantidad} {currentProducto ? getUnidad(currentProducto) : 'pzas'}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Registrado por:
                  </label>
                  <input
                    type="text"
                    disabled={isCajero}
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Nota adicional (opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Estaba roto al abrir caja"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-5 py-3.5 flex items-center justify-between">
          {paso === 2 && !initialProducto ? (
            <button
              type="button"
              onClick={() => setPaso(1)}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-stone-100 transition cursor-pointer"
            >
              Volver atrás
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-stone-100 transition cursor-pointer"
            >
              Cancelar
            </button>
          )}

          {paso === 1 ? (
            <span className="text-xs text-stone-500 italic">
              Toca un producto para continuar
            </span>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!currentProducto || cantidad <= 0}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <span>Descontar y Registrar Merma</span>
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};