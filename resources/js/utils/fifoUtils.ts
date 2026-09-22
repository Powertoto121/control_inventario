export interface FifoStatus {
  nivel: 'normal' | 'proximo' | 'critico' | 'vencido';
  diasRestantes: number;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  iconoEmoji: string;
  etiquetaCorta: string;
  etiquetaDetallada: string;
}

export function getFifoStatus(fechaCaducidadProxima?: string): FifoStatus {
  if (!fechaCaducidadProxima) {
    return {
      nivel: 'normal',
      diasRestantes: 999,
      badgeBg: 'bg-stone-100',
      badgeBorder: 'border-stone-200',
      badgeText: 'text-stone-600',
      iconoEmoji: '🟢',
      etiquetaCorta: 'OK',
      etiquetaDetallada: 'Sin fecha asignada',
    };
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const [year, month, day] = fechaCaducidadProxima.split('-').map(Number);
  const fechaCad = new Date(year, month - 1, day);
  fechaCad.setHours(0, 0, 0, 0);

  const diffMs = fechaCad.getTime() - hoy.getTime();
  const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diasRestantes < 0) {
    return {
      nivel: 'vencido',
      diasRestantes,
      badgeBg: 'bg-rose-200',
      badgeBorder: 'border-rose-400',
      badgeText: 'text-rose-900',
      iconoEmoji: '⛔',
      etiquetaCorta: 'VENCIDO',
      etiquetaDetallada: `Producto vencido hace ${Math.abs(diasRestantes)} días`,
    };
  }

  if (diasRestantes <= 3) {
    return {
      nivel: 'critico',
      diasRestantes,
      badgeBg: 'bg-rose-100',
      badgeBorder: 'border-rose-300',
      badgeText: 'text-rose-800',
      iconoEmoji: '🚨',
      etiquetaCorta: `${diasRestantes}d`,
      etiquetaDetallada: `Crítico: Vence en ${diasRestantes} día(s)`,
    };
  }

  if (diasRestantes <= 7) {
    return {
      nivel: 'proximo',
      diasRestantes,
      badgeBg: 'bg-amber-100',
      badgeBorder: 'border-amber-300',
      badgeText: 'text-amber-900',
      iconoEmoji: '⚠️',
      etiquetaCorta: `${diasRestantes}d`,
      etiquetaDetallada: `Próximo: Vence en ${diasRestantes} día(s)`,
    };
  }

  return {
    nivel: 'normal',
    diasRestantes,
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-800',
    iconoEmoji: '🟢',
    etiquetaCorta: `${diasRestantes}d`,
    etiquetaDetallada: `Vence en ${diasRestantes} días (${fechaCaducidadProxima})`,
  };
}