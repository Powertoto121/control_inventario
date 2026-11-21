import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Producto, Usuario, RegistroMerma, MotivoMermaId } from './types';

import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { InventoryView } from './components/InventoryView';
import { RestockView } from './components/RestockView';
import { LossAnalyticsView } from './components/LossAnalyticsView';
import { UsersManagementView } from './components/UsersManagementView';
import { QuickMermaScreen } from './components/QuickMermaScreen';

import { ProductFormModal } from './components/ProductFormModal';
import { UserFormModal } from './components/UserFormModal';
import { QuickMermaModal } from './components/QuickMermaModal';
import { NotificationToast } from './components/NotificationToast';

import {
  triggerVibration,
  requestLocalNotificationPermission,
  sendLocalSystemNotification,
  enableScreenKeepAwake,
  subscribeToAmbientLightSensor,
  subscribeToShakeAccelerometer,
  AmbientLightStatus,
} from './utils/deviceFeedback';

import { apiFetch, autoDiscoverServer } from './utils/apiConfig';

const MOTIVO_LABELS: Record<string, string> = {
  caducidad: 'Fecha Vencida / Caducidad',
  empaque_danado: 'Empaque Dañado / Roto',
  otro: 'Robo / Ajuste / Otro',
};

type AppTab = 'inventory' | 'quick-merma' | 'restock' | 'analytics' | 'users';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => {
    const savedUser = localStorage.getItem('mi_tiendita_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentTab, setCurrentTab] = useState<AppTab>(() => {
    const savedTab = localStorage.getItem('mi_tiendita_tab') as AppTab | null;
    const validTabs: AppTab[] = ['inventory', 'quick-merma', 'restock', 'analytics', 'users'];
    return savedTab && validTabs.includes(savedTab) ? savedTab : 'inventory';
  });

  const changeTab = (tab: AppTab) => {
    setCurrentTab(tab);
    localStorage.setItem('mi_tiendita_tab', tab);
  };

  const [productos, setProductos] = useState<Producto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mermas, setMermas] = useState<RegistroMerma[]>([]);

  // Modales
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Producto | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<Usuario | null>(null);

  const [isMermaModalOpen, setIsMermaModalOpen] = useState(false);
  const [mermaTargetProduct, setMermaTargetProduct] = useState<Producto | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [ambientLight, setAmbientLight] = useState<AmbientLightStatus | null>(null);
  const [scannerTrigger, setScannerTrigger] = useState<number>(0);
  const lastNotifiedAlertsRef = useRef<number>(0);

  const isAdmin = Boolean(
    currentUser &&
      (currentUser.rol === 'admin' ||
        currentUser.rol === 'administrador' ||
        currentUser.role === 'admin' ||
        currentUser.role === 'administrador')
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchProductos = async () => {
    try {
      const res = await apiFetch('/api/productos', {
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setProductos(data);
      }
    } catch (err) {
      console.error('Error al cargar los productos de la base de datos:', err);
    }
  };

  const fetchMermas = async () => {
    try {
      const res = await apiFetch('/api/mermas', {
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMermas(data);
      }
    } catch (err) {
      console.error('Error al cargar las mermas de la base de datos:', err);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await apiFetch('/api/users', {
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsuarios(data);
      }
    } catch (err) {
      console.error('Error al cargar los usuarios de la base de datos:', err);
    }
  };

  // Carga inicial, sincronización simultánea cada 15s y sensores de dispositivo
  useEffect(() => {
    if (!currentUser) return;

    const syncAllData = async () => {
      await autoDiscoverServer();
      void fetchProductos();
      void fetchMermas();
      void fetchUsuarios();
    };

    void syncAllData();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void fetchProductos();
        void fetchMermas();
        void fetchUsuarios();
      }
    }, 15000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        void syncAllData();
      }
    };
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    if (isAdmin) {
      void requestLocalNotificationPermission();
    }

    let releaseWakeLock: (() => void) | undefined;
    enableScreenKeepAwake().then((release) => {
      releaseWakeLock = release;
    });

    // Sensor 1: Luz ambiental
    const unsubscribeLight = subscribeToAmbientLightSensor((status) => {
      setAmbientLight(status);
    });

    // Sensor 2: Acelerómetro (agitar dispositivo para abrir escáner directo)
    const unsubscribeShake = subscribeToShakeAccelerometer(() => {
      void triggerVibration('scan');
      changeTab('inventory');
      setScannerTrigger((prev) => prev + 1);
      showToast('Acelerómetro detectado: abriendo escáner...');
    });

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      if (releaseWakeLock) releaseWakeLock();
      unsubscribeLight();
      unsubscribeShake();
    };
  }, [currentUser, isAdmin]);

  const countAlertas = productos.filter((p) => {
    const stock = p.inventarios?.[0]?.stock ?? p.stockActual ?? p.stock ?? 0;
    const min = p.min_stock ?? p.stockMinimo ?? p.minStock ?? 1;
    const fechaCad = p.inventarios?.[0]?.fecha_caducidad ?? p.fechaCaducidadProxima;
    let isPeps = false;
    if (fechaCad) {
      const diffDias = Math.ceil((new Date(fechaCad).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
      isPeps = diffDias <= 3;
    }
    return stock <= min || isPeps;
  }).length;

  // Disparar notificación del sistema + vibración ÚNICAMENTE al Administrador
  useEffect(() => {
    if (!currentUser || !isAdmin) return;

    if (countAlertas > 0 && countAlertas !== lastNotifiedAlertsRef.current) {
      lastNotifiedAlertsRef.current = countAlertas;
      const body =
        countAlertas === 1
          ? 'Tienes 1 producto en stock crítico o próximo a caducar.'
          : `Tienes ${countAlertas} productos en stock crítico o próximos a caducar.`;

      void triggerVibration('alert');
      void sendLocalSystemNotification('⚠️ Alerta de Reabastecimiento', body, 1001);
    } else if (countAlertas === 0) {
      lastNotifiedAlertsRef.current = 0;
    }
  }, [countAlertas, currentUser, isAdmin]);

  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={(user) => {
          setCurrentUser(user);
          changeTab('inventory');
          localStorage.setItem('mi_tiendita_user', JSON.stringify(user));
          void triggerVibration('success');
          showToast(`¡Bienvenido de nuevo, ${user.nombre || user.name}!`);
        }}
      />
    );
  }

  const handleSaveProduct = async (productData: any, existingId?: number) => {
    try {
      if (existingId) {
        const res = await apiFetch(`/api/productos/${existingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(productData),
        });
        if (!res.ok) throw new Error('Error al actualizar en servidor');
        await fetchProductos();
        void triggerVibration('success');
        showToast('¡Producto actualizado exitosamente en la BD!');
      } else {
        const res = await apiFetch('/api/productos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(productData),
        });
        const data = await res.json();
        if (!res.ok) {
          void triggerVibration('error');
          showToast(data.message || 'Error al crear en servidor');
          return;
        }
        await fetchProductos();
        void triggerVibration('success');
        showToast('¡Nuevo producto guardado en la base de datos!');
      }
    } catch (error) {
      console.error(error);
      void triggerVibration('error');
      showToast('Error al guardar el producto en la base de datos.');
    }
  };

  const handleDeleteProduct = async (productId: number | string) => {
    try {
      const res = await apiFetch(`/api/productos/${productId}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok && res.status !== 404) throw new Error('Error al eliminar');
      setProductos((prev) => prev.filter((p) => p.id !== productId));
      void triggerVibration('success');
      showToast('Producto eliminado de la base de datos.');
    } catch (error) {
      console.error(error);
      void triggerVibration('error');
      showToast('No se pudo eliminar el producto.');
    }
  };

  const handleSaveMerma = async (mermaData: {
    productoId: any;
    cantidad: number;
    motivoId: MotivoMermaId;
    notas: string;
    responsable: string;
    imagenFile?: File | null;
  }) => {
    const prod = productos.find((p) => String(p.id) === String(mermaData.productoId));
    if (!prod) return;

    const cantidadRetirada = Number(mermaData.cantidad);
    const motivoNombre = MOTIVO_LABELS[mermaData.motivoId] || 'Fecha Vencida / Caducidad';

    try {
      const formData = new FormData();
      formData.append('productoId', String(prod.id));
      formData.append('user_id', String(currentUser.id ?? 1));
      formData.append('cantidad', String(cantidadRetirada));
      formData.append('motivo_nombre', motivoNombre);
      formData.append('notas', mermaData.notas || '');

      if (mermaData.imagenFile) {
        formData.append('imagen_evidencia', mermaData.imagenFile);
      }

      const res = await apiFetch('/api/mermas', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        void triggerVibration('error');
        showToast(data.message || 'Error al registrar la merma.');
        return;
      }

      await fetchProductos();
      await fetchMermas();
      void triggerVibration('success');
      showToast(`Merma guardada en BD: -${cantidadRetirada} de ${prod.nombre}`);
    } catch (error) {
      console.error(error);
      void triggerVibration('error');
      showToast('Error de conexión al registrar merma.');
    }
  };

  const handleSaveUser = async (userData: any, existingId?: number | string) => {
    const idToUpdate = existingId ?? userData.id;

    try {
      if (idToUpdate) {
        const res = await apiFetch(`/api/users/${idToUpdate}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        if (!res.ok) throw new Error('Error al actualizar usuario');
        await fetchUsuarios();
        void triggerVibration('success');
        showToast('¡Datos del empleado actualizados en la BD!');
      } else {
        const res = await apiFetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        const data = await res.json();
        if (!res.ok) {
          void triggerVibration('error');
          showToast(data.message || 'Error al registrar empleado');
          return;
        }
        await fetchUsuarios();
        void triggerVibration('success');
        showToast('¡Nuevo empleado registrado en PostgreSQL!');
      }
    } catch (error) {
      console.error(error);
      void triggerVibration('error');
      showToast('Error al guardar el usuario en la base de datos.');
    }
  };

  const handleToggleUserStatus = async (userId: number | string) => {
    const targetUser = usuarios.find((u) => String(u.id) === String(userId));
    if (!targetUser) return;

    const nuevoEstado = !(targetUser.activo ?? true);

    try {
      const res = await apiFetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ activo: nuevoEstado }),
      });

      if (!res.ok) throw new Error('Error al cambiar estado en BD');

      await fetchUsuarios();
      void triggerVibration('success');
      showToast(
        nuevoEstado
          ? `Acceso habilitado para ${targetUser.nombre || targetUser.name}.`
          : `Cuenta deshabilitada para ${targetUser.nombre || targetUser.name}.`
      );
    } catch (error) {
      console.error(error);
      void triggerVibration('error');
      showToast('No se pudo actualizar el estado del empleado en la base de datos.');
    }
  };

  const handleDeleteUser = async (userId: number | string) => {
    try {
      const res = await apiFetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error('Error al eliminar usuario');
      setUsuarios((prev) => prev.filter((u) => u.id !== userId));
      void triggerVibration('success');
      showToast('Empleado eliminado de la base de datos.');
    } catch (error) {
      console.error(error);
      void triggerVibration('error');
      showToast('No se pudo eliminar el empleado.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 pb-12">
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        onSelectTab={changeTab}
        onLogout={() => {
          setCurrentUser(null);
          setCurrentTab('inventory');
          localStorage.removeItem('mi_tiendita_user');
          localStorage.removeItem('mi_tiendita_tab');
          showToast('Sesión cerrada correctamente.');
        }}
        onOpenQuickMerma={() => {
          setMermaTargetProduct(null);
          setIsMermaModalOpen(true);
        }}
        totalAlertsCount={countAlertas}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentTab === 'inventory' && (
          <InventoryView
            productos={productos}
            currentUser={currentUser}
            onOpenNewProductModal={() => {
              setProductToEdit(null);
              setIsProductModalOpen(true);
            }}
            onEditProduct={(prod) => {
              setProductToEdit(prod);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
            onOpenQuickMermaForProduct={(prod) => {
              setMermaTargetProduct(prod);
              setIsMermaModalOpen(true);
            }}
            externalScannerTrigger={scannerTrigger}
          />
        )}

        {currentTab === 'restock' && (
          <RestockView
            productos={productos}
            currentUser={currentUser}
            onOpenNewProductModal={() => {
              setProductToEdit(null);
              setIsProductModalOpen(true);
            }}
            onOpenQuickMermaForProduct={(prod) => {
              setMermaTargetProduct(prod);
              setIsMermaModalOpen(true);
            }}
          />
        )}

        {currentTab === 'analytics' && isAdmin && (
          <LossAnalyticsView mermas={mermas} productos={productos} />
        )}

        {currentTab === 'users' && isAdmin && (
          <UsersManagementView
            usuarios={usuarios}
            currentUser={currentUser}
            onOpenNewUserModal={() => {
              setUserToEdit(null);
              setIsUserModalOpen(true);
            }}
            onEditUser={(user) => {
              setUserToEdit(user);
              setIsUserModalOpen(true);
            }}
            onToggleUserStatus={handleToggleUserStatus}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {currentTab === 'quick-merma' && (
          <QuickMermaScreen
            productos={productos}
            currentUser={currentUser}
            onSaveMerma={handleSaveMerma}
            onClose={() => changeTab('inventory')}
          />
        )}
      </main>

      {/* Modales Globales */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSaveProduct={handleSaveProduct}
        productToEdit={productToEdit}
      />

      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSaveUser={handleSaveUser}
        userToEdit={userToEdit}
        existingUsers={usuarios}
      />

      <QuickMermaModal
        isOpen={isMermaModalOpen}
        onClose={() => {
          setIsMermaModalOpen(false);
          setMermaTargetProduct(null);
        }}
        productos={productos}
        initialProducto={mermaTargetProduct}
        currentUser={currentUser}
        onSaveMerma={handleSaveMerma}
      />

      {toastMessage && <NotificationToast message={toastMessage} />}

      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6 text-center text-xs text-stone-400 space-y-1">
        <p>Mi Abarrotes • Sistema Oficial de Control de Inventario & Mermas</p>
        {ambientLight && (
          <p className="text-[11px] text-stone-500">
            Sensor de luz activo: {ambientLight.lux} lx • Brillo automático al {ambientLight.brightnessPercent}%
          </p>
        )}
      </footer>
    </div>
  );
}

const rootElement = document.getElementById('app');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}