'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product, Recommendation } from '@/types';
import Image from 'next/image';
import { API_URL } from '@/lib/config';


export default function ProductsPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    // Redirigir si no hay token
    if (!authLoading && !token) {
      console.log('No hay token, redirigiendo al login...');
      router.push('/');
    } else if (token) {
      console.log('Token encontrado, cargando productos...');
      fetchProducts();
    }
  }, [token, authLoading, router]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/productos/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Error cargando productos');
      
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Error al cargar productos');
      console.error('Error cargando productos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (productId: number) => {
    try {
      const clientId = Math.floor(Math.random() * 10) + 1;

      const requestBody = {
        cliente_id: clientId,
        producto_id: productId,
        limit: 5
      };
      
      console.log('Enviando request con body:', requestBody);

      const response = await fetch(`${API_URL}/recomendaciones/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Status de la respuesta:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error data:', errorData);
        throw new Error(errorData.detail || 'Error al cargar recomendaciones');
      }
      
      const data: Recommendation[] = await response.json();
      console.log('Recomendaciones recibidas:', data);
      setRecommendations(data);

    } catch (err) {
      console.error('Error completo al cargar recomendaciones:', err);
      setRecommendations([]);
      setError(err instanceof Error ? err.message : 'Error al cargar recomendaciones');
    }
  };

  if (authLoading || loading) return <div className="text-center p-8">Cargando...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className='text-center'>
        <div className="flex justify-center items-center space-x-4 mb-4">
          <Image 
            src="/sales-optimizer.png"
            alt="Sales Optimizer Logo"
            width={100}
            height={100}
            className="object-contain"
          />
        </div>
        <b>Sales Optimizer</b>
      </div>

      <h1 className="text-3xl font-bold mb-6">Productos</h1>
      
      {selectedProduct ? (
        <div className="space-y-6">
          <Button onClick={() => setSelectedProduct(null)} variant="outline">
            Volver a productos
          </Button>
          
          <Card className={`w-full ${selectedProduct.baja_rotacion ? 'border-2 border-orange-500' : ''}`}>
            <CardContent className={`p-6 ${selectedProduct.baja_rotacion ? 'bg-orange-50' : ''}`}>
              {selectedProduct.baja_rotacion && (
                <div className="inline-block mb-4 px-3 py-1 bg-orange-500 text-white rounded-full text-sm">
                  ¡Oportunidad de Venta!
                </div>
              )}
              <h2 className="text-2xl font-bold">{selectedProduct.nombre}</h2>
              <p className="text-gray-600 mt-2">{selectedProduct.descripcion}</p>
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div className={selectedProduct.baja_rotacion ? 'bg-orange-100/50 p-4 rounded-lg' : 'p-4'}>
                  <p className="font-semibold">Precio:</p>
                  <p className={`text-xl ${selectedProduct.baja_rotacion ? 'text-orange-600 font-bold' : ''}`}>
                    ${selectedProduct.precio}
                  </p>
                </div>
                <div className={selectedProduct.baja_rotacion ? 'bg-orange-100/50 p-4 rounded-lg' : 'p-4'}>
                  <p className="font-semibold">Stock:</p>
                  <p className="text-xl">{selectedProduct.stock} unidades</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Productos Recomendados</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <Card 
                    key={rec.producto_id} 
                    className={`hover:shadow-lg transition-shadow ${rec.baja_rotacion ? 'border-2 border-orange-500' : ''}`}
                  >
                    <CardContent className={`p-4 ${rec.baja_rotacion ? 'bg-orange-50' : ''}`}>
                      <div className="relative">
                        {rec.baja_rotacion && (
                          <span className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs">
                            ¡Oportunidad!
                          </span>
                        )}
                        <h4 className="font-bold">{rec.nombre}</h4>
                        <p className="text-sm text-gray-600">Score: {Math.round(rec.score * 100)}%</p>
                        <p className={`mt-2 ${rec.baja_rotacion ? 'text-orange-600 font-bold' : ''}`}>
                          ${rec.precio}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No se encontraron recomendaciones para este producto</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card 
              key={product.id}
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                product.baja_rotacion ? 'border-2 border-orange-500' : ''
              }`}
              onClick={() => {
                setSelectedProduct(product);
                fetchRecommendations(product.id);
              }}
            >
              <CardContent className={`p-4 relative ${product.baja_rotacion ? 'bg-orange-50' : ''}`}>
                {product.baja_rotacion && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs">
                    ¡Oportunidad!
                  </span>
                )}
                <h3 className="font-bold">{product.nombre}</h3>
                <p className="text-sm text-gray-600 mt-2">{product.categoria}</p>
                <div className="mt-4 flex justify-between items-center">
                  <p className={`font-semibold ${product.baja_rotacion ? 'text-orange-600' : ''}`}>
                    ${product.precio}
                  </p>
                  <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className='mt-4 text-center'>
        <div className="flex justify-center items-center space-x-4 mb-4">
          <Image 
            src="/ulibre.png"
            alt="Universidad Libre Logo"
            width={100}
            height={100}
            className="object-contain"
          />
        </div>
        <b>Universidad Libre</b>
      </div>
    </div>
  );
}