'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/providers/auth-provider';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from 'next/image';
import { API_URL } from '@/lib/config';

// Add role type
type UserRole = 'client' | 'supervisor';

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // Add role state
  const [role, setRole] = useState<UserRole>('client');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formUrlEncoded = new URLSearchParams();
      formUrlEncoded.append('username', formData.username);
      formUrlEncoded.append('password', formData.password);
      
      console.log('Enviando request con:', formUrlEncoded.toString());

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formUrlEncoded
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al iniciar sesión');
      }

      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      
      setToken(data.access_token);
      localStorage.setItem('token', data.access_token);
      // Redirect based on role
      router.push(role === 'client' ? '/products' : '/dashboard');
    } catch (err) {
      console.error('Error completo:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center items-center space-x-4 mb-4">
            <Image 
              src="/sales-optimizer.png"
              alt="Sales Optimizer Logo"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl text-center">Sales Optimizer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario o Email</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            <div className="mb-6">
              <RadioGroup
                defaultValue="client"
                onValueChange={(value: string) => setRole(value as UserRole)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client">Cliente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="supervisor" id="supervisor" />
                  <Label htmlFor="supervisor">Supervisor</Label>
                </div>
              </RadioGroup>
            </div>
            {error && <p className="text-sm text-red-500">Error al crear usuario, por favor revisa los datos e intenta nuevamente</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">¿No tienes una cuenta? </span>
            <a href="/register" className="text-primary hover:underline">
              Regístrate aquí
            </a>
          </div>
          <div className="flex justify-center">
              <Image 
                src="/ulibre.png"
                alt="Universidad Libre Logo"
                width={100}
                height={100}
                className="object-contain"
              />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}