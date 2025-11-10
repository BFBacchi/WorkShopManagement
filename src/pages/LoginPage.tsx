import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Wrench, Mail, KeyRound } from 'lucide-react';
import { ThemeSelector } from '@/components/ThemeSelector';

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const { sendOTP, verifyOTP, isLoading } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu correo electrónico",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendOTP(email);
      setStep('otp');
      toast({
        title: "Código enviado",
        description: "Revisa tu correo electrónico",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el código. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa el código",
        variant: "destructive",
      });
      return;
    }

    try {
      await verifyOTP(email, otp);
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Código incorrecto. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setStep('email');
    setOtp('');
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
          {step === 'email' ? (
            <div key="email-form">
              <form onSubmit={handleSendOTP} className="space-y-4">
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
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar código'}
                </Button>
              </form>
            </div>
          ) : (
            <div key="otp-form">
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    Código de verificación
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ingresa el código de 6 dígitos enviado a <strong>{email}</strong>
                  </p>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="h-11 text-center text-lg tracking-widest"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-11"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verificando...' : 'Verificar'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
