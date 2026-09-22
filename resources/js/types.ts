export type Role = 'admin' | 'vendedor' | 'almacen' | 'cajero' | string;

export type MotivoMermaId = string | number;

// Aliases y tipos de usuario
export interface Usuario {
  id?: string | number;
  nombre?: string;
  username?: string;
  rol?: Role;
  role?: Role;
  [key: string]: any;
}

export interface UsuarioCuenta extends Usuario {
  email?: string;
  status?: string;
  activo?: boolean;
  avatar?: string;
  lastLogin?: string;
  password?: string;
  fechaAlta?: string;
}

export interface MotivoMerma {
  id?: MotivoMermaId;
  nombre?: string;
  label?: string;
  description?: string;
  [key: string]: any;
}

export interface Producto {
  id?: string | number;
  nombre?: string;
  sku?: string;
  categoria?: string;
  category?: string;
  stockActual?: number;
  stockMinimo?: number;
  unidadMedida?: string;
  precio?: number;
  costoCompra?: number;
  costo?: number;
  [key: string]: any;
}

export interface RegistroMerma {
  id?: string | number;
  productoId?: string | number;
  productoNombre?: string;
  categoria?: string;
  cantidad?: number;
  unidadMedida?: string;
  motivoId?: MotivoMermaId;
  motivoNombre?: string;
  costoUnitario?: number;
  costoTotalPerdida?: number;
  fecha?: string;
  hora?: string;
  responsable?: string;
  notas?: string;
  [key: string]: any;
}