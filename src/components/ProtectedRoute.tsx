import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { Footer } from '@/components/Footer';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
