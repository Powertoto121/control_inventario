import React, { useState, useEffect } from 'react';
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

const MOTIVO_LABELS: Record<string, string> = {
  caducidad: 'Fecha Vencida / Caducidad',
  empaque_danado: 'Empaque Dañado / Roto',
  otro: 'Robo / Ajuste / Otro',
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => {
    const savedUser = localStorage.getItem('mi_tiendita_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentTab, setCurrentTab] = useState<'inventory' | 'quick-merma' | 'restock' | 'analytics' | 'users'>('inventory');

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchProductos = async () => {
    try {
      const res = await fetch('/api/productos', {
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
      const res = await fetch('/api/mermas', {
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
      const res = await fetch('/api/users', {
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

  useEffect(() => {
    if (currentUser) {
      fetchProductos();
      fetchMermas();
      fetchUsuarios();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={(user) => {
          setCurrentUser(user);
          setCurrentTab('inventory');
          localStorage.setItem('mi_tiendita_user', JSON.stringify(user));
          showToast(`¡Bienvenido de nuevo, ${user.nombre || user.name}!`);
        }}
      />
    );
  }

  const isAdmin = currentUser.rol === 'admin' || currentUser.rol === 'administrador' || currentUser.role === 'admin' || currentUser.role === 'administrador';

  const handleSaveProduct = async (productData: any, existingId?: number) => {
    try {
      if (existingId) {
        const res = await fetch(`/api/productos/${existingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(productData),
        });
        if (!res.ok) throw new Error('Error al actualizar en servidor');
        await fetchProductos();
        showToast('¡Producto actualizado exitosamente en la BD!');
      } else {
        const res = await fetch('/api/productos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(productData),
        });
        if (!res.ok) throw new Error('Error al crear en servidor');
        await fetchProductos();
        showToast('¡Nuevo producto guardado en la base de datos!');
      }
    } catch (error) {
      console.error(error);
      showToast('Error al guardar el producto en la base de datos.');
    }
  };

  const handleDeleteProduct = async (productId: number | string) => {
    try {
      const res = await fetch(`/api/productos/${productId}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok && res.status !== 404) throw new Error('Error al eliminar');
      setProductos((prev) => prev.filter((p) => p.id !== productId));
      showToast('Producto eliminado de la base de datos.');
    } catch (error) {
      console.error(error);
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

      const res = await fetch('/api/mermas', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Error al registrar la merma.');
        return;
      }

      await fetchProductos();
      await fetchMermas();
      showToast(`Merma guardada en BD: -${cantidadRetirada} de ${prod.nombre}`);
    } catch (error) {
      console.error(error);
      showToast('Error de conexión al registrar merma.');
    }
  };

  const handleSaveUser = async (userData: any, existingId?: number | string) => {
    const idToUpdate = existingId ?? userData.id;

    try {
      if (idToUpdate) {
        const res = await fetch(`/api/users/${idToUpdate}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        if (!res.ok) throw new Error('Error al actualizar usuario');
        await fetchUsuarios();
        showToast('¡Datos del empleado actualizados en la BD!');
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.message || 'Error al registrar empleado');
          return;
        }
        await fetchUsuarios();
        showToast('¡Nuevo empleado registrado en PostgreSQL!');
      }
    } catch (error) {
      console.error(error);
      showToast('Error al guardar el usuario en la base de datos.');
    }
  };

  const handleToggleUserStatus = (userId: number | string) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, activo: !(u.activo ?? true) } : u))
    );
    showToast('Estado del usuario actualizado.');
  };

  const handleDeleteUser = async (userId: number | string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error('Error al eliminar usuario');
      setUsuarios((prev) => prev.filter((u) => u.id !== userId));
      showToast('Empleado eliminado de la base de datos.');
    } catch (error) {
      console.error(error);
      showToast('No se pudo eliminar el empleado.');
    }
  };

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

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 pb-12">
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onLogout={() => {
          setCurrentUser(null);
          setCurrentTab('inventory');
          localStorage.removeItem('mi_tiendita_user');
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
            onClose={() => setCurrentTab('inventory')}
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

      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6 text-center text-xs text-stone-400">
        <p>Mi Abarrotes • Sistema Oficial de Control de Inventario & Mermas</p>
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