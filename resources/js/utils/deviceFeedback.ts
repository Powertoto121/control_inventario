// Servicio centralizado de hardware y feedback (Web + Ionic Capacitor Android)

export type VibrationType = 'scan' | 'success' | 'alert' | 'error';

export interface AmbientLightStatus {
  lux: number;
  brightnessPercent: number;
  mode: 'baja' | 'normal' | 'alta';
}

const isCapacitorNative = (): boolean => {
  return typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.());
};

/**
 * 1. Vibración háptica (Web navigator.vibrate + Capacitor Haptics)
 */
export const triggerVibration = async (type: VibrationType = 'success'): Promise<void> => {
  try {
    const cap = (window as any).Capacitor;
    if (isCapacitorNative() && cap?.Plugins?.Haptics) {
      if (type === 'scan' || type === 'success') {
        await cap.Plugins.Haptics.impact({ style: 'MEDIUM' });
      } else {
        await cap.Plugins.Haptics.notification({
          type: type === 'error' ? 'ERROR' : 'WARNING',
        });
      }
      return;
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const patterns: Record<VibrationType, number | number[]> = {
        scan: 80,
        success: [60, 40, 80],
        alert: [150, 80, 150],
        error: [250, 100, 250],
      };
      navigator.vibrate(patterns[type]);
    }
  } catch {
    // Silencioso en dispositivos sin motor de vibración (ej. PC)
  }
};

/**
 * 2. Notificaciones locales del sistema (Web Notification API + Capacitor LocalNotifications)
 */
export const requestLocalNotificationPermission = async (): Promise<boolean> => {
  try {
    const cap = (window as any).Capacitor;
    if (isCapacitorNative() && cap?.Plugins?.LocalNotifications) {
      const status = await cap.Plugins.LocalNotifications.requestPermissions();
      return status?.display === 'granted';
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') return true;
      if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      }
    }
  } catch {
    // Ignorar si el navegador bloquea notificaciones sin HTTPS
  }
  return false;
};

export const sendLocalSystemNotification = async (
  title: string,
  body: string,
  id: number = Math.floor(Date.now() % 100000)
): Promise<void> => {
  try {
    const cap = (window as any).Capacitor;
    if (isCapacitorNative() && cap?.Plugins?.LocalNotifications) {
      await cap.Plugins.LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            schedule: { at: new Date(Date.now() + 200) },
          },
        ],
      });
      return;
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: `mi-tiendita-alert-${id}`,
      });
    }
  } catch {
    // El toast visual en pantalla actúa como respaldo automático
  }
};

/**
 * 3. Mantener pantalla encendida en mostrador (Capacitor KeepAwake + Web WakeLock API)
 */
export const enableScreenKeepAwake = async (): Promise<() => void> => {
  let wakeLockSentinel: any = null;

  try {
    const cap = (window as any).Capacitor;
    if (isCapacitorNative() && cap?.Plugins?.KeepAwake) {
      await cap.Plugins.KeepAwake.keepAwake();
      return () => {
        cap.Plugins.KeepAwake.allowSleep().catch(() => {});
      };
    }

    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
    }
  } catch {
    // Ignorar si no es soportado
  }

  return () => {
    if (wakeLockSentinel) {
      wakeLockSentinel.release().catch(() => {});
    }
  };
};

/**
 * 4. Sensor 1: Luz Ambiental (Android Sensor.TYPE_LIGHT via Capacitor / Web AmbientLightSensor)
 * Calcula el brillo recomendado según los luxes ambientales.
 */
export const calculateAmbientLightStatus = (lux: number): AmbientLightStatus => {
  if (lux < 50) {
    return { lux: Math.round(lux), brightnessPercent: 35, mode: 'baja' };
  }
  if (lux > 400) {
    return { lux: Math.round(lux), brightnessPercent: 100, mode: 'alta' };
  }
  return { lux: Math.round(lux), brightnessPercent: 70, mode: 'normal' };
};

export const subscribeToAmbientLightSensor = (
  onLightChange: (status: AmbientLightStatus) => void
): (() => void) => {
  const handleNativeLightEvent = (event: Event) => {
    const lux = Number((event as CustomEvent)?.detail?.lux ?? 0);
    if (!Number.isNaN(lux)) {
      onLightChange(calculateAmbientLightStatus(lux));
    }
  };

  window.addEventListener('ambientLightChange', handleNativeLightEvent);

  let webSensor: any = null;
  try {
    if ('AmbientLightSensor' in window) {
      const SensorClass = (window as any).AmbientLightSensor;
      webSensor = new SensorClass();
      webSensor.addEventListener('reading', () => {
        onLightChange(calculateAmbientLightStatus(webSensor.illuminance));
      });
      webSensor.start();
    }
  } catch {
    // No disponible en navegadores estándar sin flag
  }

  return () => {
    window.removeEventListener('ambientLightChange', handleNativeLightEvent);
    if (webSensor) {
      try {
        webSensor.stop();
      } catch {
        // Ignorar
      }
    }
  };
};

/**
 * 5. Sensor 2: Acelerómetro (Gesto de agitar / Shake para abrir escáner de códigos)
 * Usa @capacitor/motion en APK Android y DeviceMotionEvent en navegadores móviles.
 */
export const subscribeToShakeAccelerometer = (
  onShakeDetected: () => void,
  threshold: number = 18
): (() => void) => {
  let lastShakeTime = 0;
  let capacitorHandle: any = null;

  const processAcceleration = (x: number, y: number, z: number) => {
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    if (magnitude > threshold && now - lastShakeTime > 2000) {
      lastShakeTime = now;
      onShakeDetected();
    }
  };

  // 1) Plugin nativo @capacitor/motion (cuando corre en APK Android)
  const cap = (window as any).Capacitor;
  if (isCapacitorNative() && cap?.Plugins?.Motion) {
    cap.Plugins.Motion.addListener('accel', (event: any) => {
      const acc = event?.acceleration || event?.accelerationIncludingGravity;
      if (acc) {
        const net = event?.acceleration
          ? acc
          : { x: acc.x || 0, y: acc.y || 0, z: (acc.z || 0) - 9.81 };
        processAcceleration(net.x || 0, net.y || 0, net.z || 0);
      }
    })
      .then((handle: any) => {
        capacitorHandle = handle;
      })
      .catch(() => {});
  }

  // 2) Respaldo Web API DeviceMotionEvent (navegadores móviles)
  const handleWebMotion = (event: DeviceMotionEvent) => {
    const acc = event.acceleration || event.accelerationIncludingGravity;
    if (!acc) return;

    const x = acc.x ?? 0;
    const y = acc.y ?? 0;
    const z = event.acceleration ? (acc.z ?? 0) : (acc.z ?? 0) - 9.81;
    processAcceleration(x, y, z);
  };

  if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
    window.addEventListener('devicemotion', handleWebMotion);
  }

  return () => {
    if (capacitorHandle && typeof capacitorHandle.remove === 'function') {
      capacitorHandle.remove();
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', handleWebMotion);
    }
  };
};