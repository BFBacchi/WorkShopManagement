import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Wrench, Mail, Lock } from 'lucide-react';
import { ThemeSelector } from '@/components/ThemeSelector';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu correo electrónico y contraseña",
        variant: "destructive",
      });
      return;
    }

    try {
      await signIn(email, password);
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Credenciales incorrectas. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-background p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeSelector />
      </div>
      <Card className="w-full max-w-md shadow-2xl border-border">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
            <Wrench className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">Taller Pro</CardTitle>
          <CardDescription className="text-base">
            Sistema de gestión para talleres de reparación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                autoFocus
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
