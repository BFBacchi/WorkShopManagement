import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import RepairsPage from "@/pages/RepairsPage";
import POSPage from "@/pages/POSPage";
import InventoryPage from "@/pages/InventoryPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import CustomersPage from "@/pages/CustomerPage";
import CustomerProfilePage from "@/pages/CustomerProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import BackofficePage from "@/pages/BackofficePage";
import NotFoundPage from "@/pages/NotFoundPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ChatBot } from "@/features/ai/components/ChatBot";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/auth-store";
import { useSettingsStore } from "@/features/settings/stores/settings-store";

function App() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const { fetchBusinessSettings, fetchReceiptTemplates } = useSettingsStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchBusinessSettings();
      fetchReceiptTemplates();
    }
  }, [isAuthenticated, isLoading, fetchBusinessSettings, fetchReceiptTemplates]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              isLoading ? (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Cargando...</p>
                  </div>
                </div>
              ) : isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/login" 
            element={
              isLoading ? (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Cargando...</p>
                  </div>
                </div>
              ) : isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage />
              )
            } 
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repairs"
            element={
              <ProtectedRoute>
                <RepairsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos"
            element={
              <ProtectedRoute>
                <POSPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute>
                <CustomerProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/backoffice"
            element={
              <ProtectedRoute>
                <BackofficePage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        {isAuthenticated && <ChatBot />}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
