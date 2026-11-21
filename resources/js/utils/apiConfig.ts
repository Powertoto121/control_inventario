// Auto-descubrimiento y configuración dinámica de servidor local para Web y APK

const STORAGE_KEY = 'mi_tiendita_server_url';
const DEFAULT_PORT = '8081';

const isNativeApp = (): boolean => {
  return typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.());
};

/**
 * Devuelve la URL base del servidor.
 * - En navegador web: '' (usa rutas relativas /api/...).
 * - En APK Android: http://IP_DEL_SERVIDOR:8081 guardada en localStorage.
 */
export const getServerBaseUrl = (): string => {
  if (!isNativeApp()) return '';
  const saved = localStorage.getItem(STORAGE_KEY) || '';
  return saved.replace(/\/+$/, '');
};

export const setServerBaseUrl = (url: string): string => {
  let clean = url.trim().replace(/\/+$/, '');
  if (clean && !/^https?:\/\//i.test(clean)) {
    clean = `http://${clean}`;
  }
  if (clean && !/:\d+$/.test(clean)) {
    clean = `${clean}:${DEFAULT_PORT}`;
  }
  if (clean) {
    localStorage.setItem(STORAGE_KEY, clean);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  return clean;
};

/**
 * Wrapper de fetch que apunta automáticamente al servidor local configurado
 */
export const apiFetch = (endpoint: string, options?: RequestInit): Promise<Response> => {
  const base = getServerBaseUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return fetch(`${base}${path}`, options);
};

/**
 * Prueba rápida (timeout 900ms) para verificar si una IP responde como servidor Laravel
 */
const probeServer = async (candidateUrl: string, timeoutMs = 900): Promise<string | null> => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${candidateUrl}/api/productos`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    window.clearTimeout(timer);
    if (res.ok || res.status === 401) {
      return candidateUrl;
    }
  } catch {
    window.clearTimeout(timer);
  }
  return null;
};

/**
 * Busca automáticamente el servidor en la red Wi-Fi / Hotspot sin intervención manual
 */
export const autoDiscoverServer = async (): Promise<string | null> => {
  if (!isNativeApp()) return '';

  // 1. Probar la última IP guardada
  const saved = getServerBaseUrl();
  if (saved) {
    const ok = await probeServer(saved, 1200);
    if (ok) return ok;
  }

  // 2. Probar emulador Android y subredes comunes de Hotspot / Wi-Fi doméstico
  const candidates: string[] = [
    `http://10.0.2.2:${DEFAULT_PORT}`, // Emulador Android Studio
  ];

  // Subredes más comunes en hotspots Android (192.168.43.x / 192.168.137.x) y routers (192.168.1.x / 192.168.0.x)
  const subnets = ['192.168.43', '192.168.137', '192.168.1', '192.168.0'];
  for (const subnet of subnets) {
    for (let host = 2; host <= 254; host++) {
      candidates.push(`http://${subnet}.${host}:${DEFAULT_PORT}`);
    }
  }

  // Escanear en lotes de 40 IPs en paralelo para tardar ~1.5 segundos en total
  const batchSize = 40;
  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);
    const results = await Promise.all(batch.map((url) => probeServer(url, 850)));
    const found = results.find((r) => r !== null);
    if (found) {
      setServerBaseUrl(found);
      return found;
    }
  }

  return null;
};