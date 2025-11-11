import { useState } from "react";
import { Mail } from "lucide-react";
import { ContactFormDialog } from "./ContactFormDialog";

export function Footer() {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="border-t bg-background mt-auto">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Información de Contacto */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Contáctanos</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                ¿Tienes alguna pregunta o sugerencia? Estamos aquí para ayudarte.
              </p>
              <button
                onClick={() => setIsContactDialogOpen(true)}
                className="text-primary hover:underline font-medium inline-flex items-center gap-2 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Enviar mensaje
              </button>
            </div>

            {/* Información y Copyright */}
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-4">WorkShop Management</h3>
                <p className="text-muted-foreground mb-6">
                  Sistema integral de gestión para talleres mecánicos. 
                  Administra reparaciones, inventario, ventas y clientes desde un solo lugar.
                </p>
              </div>
              
              <div className="space-y-4">
                {/* Título central - Desarrollado por Bruno Bacchi */}
                <div className="text-center py-4 border-t border-dashed">
                  <p className="text-sm font-medium text-foreground">
                    Desarrollado por Bruno Bacchi
                  </p>
                </div>
                
                {/* Copyright */}
                <div className="text-center text-sm text-muted-foreground">
                  <p>© {currentYear} WorkShop Management. Todos los derechos reservados.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <ContactFormDialog
        open={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
      />
    </>
  );
}

