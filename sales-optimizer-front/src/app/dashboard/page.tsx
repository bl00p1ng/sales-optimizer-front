'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Client, Recommendation } from '@/types';
import Image from 'next/image';
import { API_URL } from '@/lib/config';

interface ClientProductMapping {
  [clientId: number]: number;
}

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const getOrCreateClientProductMappings = (): ClientProductMapping => {
    const stored = localStorage.getItem('clientProductMappings');
    if (stored) {
      return JSON.parse(stored);
    }
    return {};
  };

  const assignProductToClient = (clientId: number): number => {
    const mappings = getOrCreateClientProductMappings();
    if (!mappings[clientId]) {
      mappings[clientId] = Math.floor(Math.random() * 30) + 1;
      localStorage.setItem('clientProductMappings', JSON.stringify(mappings));
    }
    return mappings[clientId];
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/clientes/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Error cargando clientes');
      
      const data: Client[] = await response.json();
      data.forEach(client => {
        assignProductToClient(client.id);
      });
      setClients(data);
    } catch (err) {
      setError('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClientRecommendations = async (clientId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/recomendaciones/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cliente_id: clientId,
          producto_id: assignProductToClient(clientId),
          limit: 5
        })
      });
      
      if (!response.ok) throw new Error('Error cargando recomendaciones');
      
      const data: Recommendation[] = await response.json();
      setRecommendations(data);
    } catch (err) {
      console.error('Error al cargar recomendaciones:', err);
    }
  };

  if (loading) return <div className="text-center p-8">Cargando...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  const selectedClient = clients.find((client) => client.id === selectedClientId);

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

      <h1 className="text-3xl font-bold mb-6">Dashboard de Ventas</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clients.map((client) => (
                <div 
                  key={client.id}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    selectedClientId === client.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedClientId(client.id);
                    fetchClientRecommendations(client.id);
                  }}
                >
                  <h3 className="font-semibold">{client.nombre}</h3>
                  <p className="text-sm text-gray-600">{client.email}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedClient ? `Recomendaciones para ${selectedClient.nombre}` : 'Seleccione un cliente'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedClient ? (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.producto_id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{rec.nombre}</h4>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Score: {Math.round(rec.score * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">${rec.precio}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                Seleccione un cliente para ver sus recomendaciones
              </p>
            )}
          </CardContent>
        </Card>
      </div>

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