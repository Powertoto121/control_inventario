import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Producto, Usuario, RegistroMerma, MotivoMermaId } from './types';
import { PRODUCTOS_INICIALES, REGISTROS_MERMA_INICIALES, MOTIVOS_MERMA } from './data/initialData';
import { USUARIOS_INICIALES } from './data/initialUsers';

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

export default function App() {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [currentTab, setCurrentTab] = useState<'inventory' | 'quick-merma' | 'restock' | 'analytics' | 'users'>('inventory');

  const [productos, setProductos] = useState<Producto[]>(PRODUCTOS_INICIALES);
  const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS_INICIALES);
  const [mermas, setMermas] = useState<RegistroMerma[]>(REGISTROS_MERMA_INICIALES);

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

  if (!currentUser) {
    return (
      <LoginScreen
        usuarios={usuarios}
        onLogin={(user) => {
          setCurrentUser(user);
          showToast(`¡Bienvenido de nuevo, ${user.nombre || user.name}!`);
        }}
      />
    );
  }

  // Manejadores de Productos
  const handleSaveProduct = (productData: Omit<Producto, 'id'>, existingId?: number) => {
    if (existingId) {
      setProductos((prev) =>
        prev.map((p) => (p.id === existingId ? { ...p, ...productData, id: existingId } : p))
      );
      showToast('¡Producto actualizado exitosamente!');
    } else {
      const newProd: Producto = {
        ...productData,
        id: Date.now(),
      };
      setProductos((prev) => [newProd, ...prev]);
      showToast('¡Nuevo producto registrado en inventario!');
    }
  };

  const handleDeleteProduct = (productId: number | string) => {
    setProductos((prev) => prev.filter((p) => p.id !== productId));
    showToast('Producto eliminado del inventario.');
  };

  // Manejadores de Mermas
  const handleSaveMerma = (mermaData: {
    productoId: any;
    cantidad: number;
    motivoId: MotivoMermaId;
    notas: string;
    responsable: string;
  }) => {
    const prod = productos.find((p) => String(p.id) === String(mermaData.productoId));
    if (!prod) return;

    const cantidadRetirada = Number(mermaData.cantidad);
    const stockActual = prod.stockActual ?? prod.stock ?? 0;
    const nuevoStock = Math.max(0, stockActual - cantidadRetirada);

    setProductos((prev) =>
      prev.map((p) =>
        String(p.id) === String(prod.id)
          ? { ...p, stockActual: nuevoStock, stock: nuevoStock }
          : p
      )
    );

    const motivoObj = MOTIVOS_MERMA.find((m) => m.id === mermaData.motivoId);
    const costoUnit = prod.costoCompra ?? prod.costo ?? 0;

    const nuevaMerma: RegistroMerma = {
      id: Date.now(),
      productoId: prod.id,
      productoNombre: prod.nombre ?? 'Sin nombre',
      cantidad: cantidadRetirada,
      motivoId: mermaData.motivoId,
      motivo: motivoObj ? (motivoObj.nombre || motivoObj.label) : 'Merma general',
      costoUnitario: costoUnit,
      costoTotalPerdida: costoUnit * cantidadRetirada,
      responsable: mermaData.responsable,
      fecha: new Date().toISOString().split('T')[0],
      notas: mermaData.notas,
    };

    setMermas((prev) => [nuevaMerma, ...prev]);
    showToast(`Merma registrada: -${cantidadRetirada} ${prod.unidadMedida || 'pza'} de ${prod.nombre}`);
  };

  // Manejadores de Usuarios
  const handleSaveUser = (userData: Omit<Usuario, 'id'>, existingId?: number) => {
    if (existingId) {
      setUsuarios((prev) =>
        prev.map((u) => (u.id === existingId ? { ...u, ...userData, id: existingId } : u))
      );
      showToast('¡Datos del empleado actualizados!');
    } else {
      const newUser: Usuario = {
        ...userData,
        id: Date.now(),
        fechaAlta: new Date().toISOString().split('T')[0],
        activo: true,
      };
      setUsuarios((prev) => [newUser, ...prev]);
      showToast('¡Nuevo empleado registrado con éxito!');
    }
  };

  const handleToggleUserStatus = (userId: number | string) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, activo: !(u.activo ?? true) } : u))
    );
    showToast('Estado del usuario actualizado.');
  };

  const handleDeleteUser = (userId: number | string) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== userId));
    showToast('Empleado eliminado del sistema.');
  };

  const countAlertas = productos.filter((p) => (p.stockActual ?? p.stock ?? 0) <= (p.stockMinimo ?? p.minStock ?? 1)).length;

  const userRoleStr = currentUser.rol || currentUser.role || '';
  const isAdminRole = userRoleStr === 'admin' || userRoleStr === 'Administrador';

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 pb-12">
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onLogout={() => {
          setCurrentUser(null);
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

        {currentTab === 'analytics' && (
          <LossAnalyticsView mermas={mermas} productos={productos} />
        )}

        {currentTab === 'users' && (
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

// Montaje automático de React en el DOM de Laravel
const rootElement = document.getElementById('app');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}