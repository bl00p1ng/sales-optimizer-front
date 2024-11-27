export interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    categoria: string;
    baja_rotacion: boolean;
}
  
export interface Client {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    fecha_registro: string;
    activo: boolean;
}
  
export interface Recommendation {
    producto_id: number;
    nombre: string;
    categoria: string;
    precio: number;
    score: number;
    baja_rotacion: boolean;
}