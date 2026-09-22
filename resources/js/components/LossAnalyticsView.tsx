import React, { useState } from 'react';
import { RegistroMerma, Producto } from '../types';
import { MOTIVOS_MERMA } from '../data/initialData';
import { Download, ShieldAlert } from 'lucide-react';

interface LossAnalyticsViewProps {
  mermas: RegistroMerma[];
  productos: Producto[];
  onDeleteMerma?: (id: string) => void;
}

export const LossAnalyticsView: React.FC<LossAnalyticsViewProps> = ({
  mermas = [],
  productos = [],
  onDeleteMerma,
}) => {
  const [filtroMotivo, setFiltroMotivo] = useState<string>('todos');

  // Helpers de extracción segura
  const getCostoTotal = (m: RegistroMerma) => Number(m.costoTotalPerdida ?? m.costoPerdida ?? 0);
  const getCantidad = (m: RegistroMerma) => Number(m.cantidad ?? 0);
  const getProductoId = (m: RegistroMerma) => String(m.productoId ?? '');
  const getProductoNombre = (m: RegistroMerma) => m.productoNombre ?? m.nombreProducto ?? 'Producto General';
  const getCategoria = (m: RegistroMerma) => m.categoria ?? 'General';
  const getMotivoId = (m: RegistroMerma) => String(m.motivoId ?? '');
  const getMotivoNombre = (m: RegistroMerma) => m.motivoNombre ?? m.motivo ?? 'Merma';
  const getUnidad = (m: RegistroMerma) => m.unidadMedida ?? 'pza';
  const getCostoUnitario = (m: RegistroMerma) => Number(m.costoUnitario ?? 0);

  // Compute total financial loss
  const totalPerdidaDinero = mermas.reduce((acc, m) => acc + getCostoTotal(m), 0);
  const totalUnidadesMermadas = mermas.reduce((acc, m) => acc + getCantidad(m), 0);

  // Losses by motive
  const perdidaPorMotivo = MOTIVOS_MERMA.map((motivo) => {
    const motivoIdStr = String(motivo.id);
    const registros = mermas.filter((m) => getMotivoId(m) === motivoIdStr);
    const totalMonto = registros.reduce((acc, m) => acc + getCostoTotal(m), 0);
    const porcentaje = totalPerdidaDinero > 0 ? (totalMonto / totalPerdidaDinero) * 100 : 0;
    return {
      ...motivo,
      nombre: motivo.nombre || motivo.label || 'Motivo',
      descripcion: motivo.description || motivo.descripcion || '',
      totalMonto,
      totalRegistros: registros.length,
      porcentaje,
    };
  });

  // Losses by product top list
  const mermasPorProductoMap = new Map<string, { nombre: string; total: number; unidades: number; categoria: string }>();
  mermas.forEach((m) => {
    const prodId = getProductoId(m);
    const current = mermasPorProductoMap.get(prodId) || {
      nombre: getProductoNombre(m),
      total: 0,
      unidades: 0,
      categoria: getCategoria(m),
    };
    current.total += getCostoTotal(m);
    current.unidades += getCantidad(m);
    mermasPorProductoMap.set(prodId, current);
  });

  const topProductosMermados = Array.from(mermasPorProductoMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const filteredMermas = filtroMotivo === 'todos'
    ? mermas
    : mermas.filter((m) => getMotivoId(m) === filtroMotivo);

  const handleExportCSV = () => {
    const headers = 'ID,Fecha,Hora,Producto,Categoría,Cantidad,Unidad,Motivo,Costo_Unitario,Perdida_Total,Responsable,Notas\n';
    const rows = mermas
      .map(
        (m) =>
          `"${m.id || ''}","${m.fecha || ''}","${m.hora || ''}","${getProductoNombre(m)}","${getCategoria(m)}",${getCantidad(m)},"${getUnidad(m)}","${getMotivoNombre(m)}",${getCostoUnitario(m)},${getCostoTotal(m)},"${m.responsable || ''}","${m.notas || m.observaciones || ''}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_mermas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const causaPrincipal = [...perdidaPorMotivo].sort((a, b) => b.totalMonto - a.totalMonto)[0];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Pérdida Monetaria Total</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
              $
            </div>
          </div>
          <div className="text-2xl font-black text-red-600">
            ${totalPerdidaDinero.toFixed(2)} <span className="text-xs font-normal text-stone-500">MXN</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Impacto acumulado en el período activo
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Total Artículos Mermados</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              📦
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">
            {totalUnidadesMermadas.toFixed(1)} <span className="text-xs font-normal text-stone-500">piezas/kg</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            En {mermas.length} registros individuales
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Causa Principal de Pérdida</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              ⚠️
            </div>
          </div>
          <div className="text-lg font-extrabold text-stone-900 truncate">
            {causaPrincipal?.nombre || 'Sin registros'}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Representa el {causaPrincipal ? causaPrincipal.porcentaje.toFixed(0) : 0}% del dinero perdido
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Efectividad de Mitigación</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              🛡️
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            Control Activo
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Reabastecimiento asistido por IA / Reglas
          </p>
        </div>
      </div>

      {/* Breakdown Charts & Top Waste */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Motivos de Merma Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900">
              Distribución de Pérdidas por Motivo
            </h3>
            <span className="text-xs text-stone-500">
              Identifica dónde se fuga el dinero
            </span>
          </div>

          <div className="space-y-3.5">
            {perdidaPorMotivo.map((motivo) => (
              <div key={motivo.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">
                    {motivo.nombre} ({motivo.totalRegistros} casos)
                  </span>
                  <div className="text-right font-medium">
                    <span className="text-stone-900 font-bold">${motivo.totalMonto.toFixed(2)} MXN</span>
                    <span className="text-stone-400 ml-1.5">({motivo.porcentaje.toFixed(1)}%)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      String(motivo.id) === 'caducidad'
                        ? 'bg-amber-500'
                        : String(motivo.id) === 'danado'
                        ? 'bg-red-500'
                        : String(motivo.id) === 'descomposicion'
                        ? 'bg-orange-500'
                        : 'bg-stone-500'
                    }`}
                    style={{ width: `${Math.max(motivo.porcentaje, 4)}%` }}
                  />
                </div>
                {motivo.descripcion && (
                  <p className="text-[11px] text-stone-500">
                    {motivo.descripcion}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Operational recommendations */}
          <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Recomendación Clave para el Comercio:</span>
            </h4>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              La mayor fuga proviene de <strong>Caducidad y Vencimiento</strong>. Se recomienda aplicar la regla <strong>PEPS (Primeras Entradas, Primeras Salidas / FIFO)</strong>: colocar siempre el producto recién llegado al fondo del refrigerador o anaquel, dejando al frente los productos con fecha más próxima a vencer.
            </p>
          </div>
        </div>

        {/* Top 5 Products with Most Losses */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900">
              Productos con Mayor Pérdida
            </h3>
            <span className="text-xs text-stone-500">Top 5</span>
          </div>

          <div className="space-y-3">
            {topProductosMermados.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200"
              >
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-bold text-stone-400 block">
                    #{idx + 1} • {item.categoria}
                  </span>
                  <h5 className="font-bold text-xs text-stone-800 truncate">
                    {item.nombre}
                  </h5>
                  <span className="text-[11px] text-stone-500">
                    {item.unidades} unidades perdidas
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-sm text-red-600">
                    -${item.total.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-stone-400 block">MXN</span>
                </div>
              </div>
            ))}

            {topProductosMermados.length === 0 && (
              <div className="py-8 text-center text-xs text-stone-400">
                No hay mermas registradas todavía.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical Waste Log Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Bitácora Detallada de Mermas Registradas
            </h3>
            <p className="text-xs text-stone-500">
              Historial trazable para auditorías y decisiones de compra
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filtroMotivo}
              onChange={(e) => setFiltroMotivo(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-700 focus:outline-none"
            >
              <option value="todos">Todos los motivos</option>
              <option value="caducidad">Solo Caducidad</option>
              <option value="danado">Solo Roto/Dañado</option>
              <option value="descomposicion">Solo Descomposición</option>
              <option value="descuadre">Solo Faltante</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition border border-stone-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Fecha y Hora</th>
                <th className="px-5 py-3">Producto</th>
                <th className="px-5 py-3">Cantidad</th>
                <th className="px-5 py-3">Motivo</th>
                <th className="px-5 py-3 text-right">Pérdida ($)</th>
                <th className="px-5 py-3">Responsable</th>
                <th className="px-5 py-3">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredMermas.map((merma, idx) => (
                <tr key={merma.id || idx} className="hover:bg-stone-50/70 transition">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="font-semibold text-stone-800 block">{merma.fecha || '—'}</span>
                    <span className="text-stone-400 text-[10px]">{merma.hora || ''}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-stone-900 block">{getProductoNombre(merma)}</span>
                    <span className="text-stone-400 text-[10px]">{getCategoria(merma)}</span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-stone-800 whitespace-nowrap">
                    {getCantidad(merma)} {getUnidad(merma)}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        getMotivoId(merma) === 'caducidad'
                          ? 'bg-amber-100 text-amber-900'
                          : getMotivoId(merma) === 'danado'
                          ? 'bg-red-100 text-red-900'
                          : getMotivoId(merma) === 'descomposicion'
                          ? 'bg-orange-100 text-orange-900'
                          : 'bg-stone-100 text-stone-800'
                      }`}
                    >
                      {getMotivoNombre(merma)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-red-600 whitespace-nowrap">
                    -${getCostoTotal(merma).toFixed(2)} MXN
                  </td>
                  <td className="px-5 py-3.5 text-stone-600 whitespace-nowrap">
                    {merma.responsable || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-stone-500 italic max-w-xs truncate">
                    {merma.notas || merma.observaciones || '—'}
                  </td>
                </tr>
              ))}
              {filteredMermas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-stone-400">
                    No hay registros de mermas que coincidan con el filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};