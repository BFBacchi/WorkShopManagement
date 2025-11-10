// Settings Store - Business configuration and preferences

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { BusinessSettings, ReceiptTemplate, UISettings } from '../types';

interface SettingsState {
  // Business settings
  businessSettings: BusinessSettings | null;
  loadingBusinessSettings: boolean;

  // Receipt templates
  receiptTemplates: ReceiptTemplate[];
  activeReceiptTemplate: ReceiptTemplate | null;
  loadingTemplates: boolean;

  // UI settings
  uiSettings: UISettings;

  // Actions
  fetchBusinessSettings: () => Promise<void>;
  updateBusinessSettings: (settings: Partial<BusinessSettings>) => Promise<void>;
  fetchReceiptTemplates: () => Promise<void>;
  createReceiptTemplate: (template: Partial<ReceiptTemplate>) => Promise<void>;
  updateReceiptTemplate: (id: string, template: Partial<ReceiptTemplate>) => Promise<void>;
  deleteReceiptTemplate: (id: string) => Promise<void>;
  setActiveReceiptTemplate: (id: string) => void;
  updateUISettings: (settings: Partial<UISettings>) => void;
}

const defaultBusinessSettings: BusinessSettings = {
  business_name: 'Taller Pro',
  business_address: '',
  business_phone: '',
  business_email: '',
  business_tax_id: '',
  currency: 'USD',
  tax_rate: 0,
  loyalty_points_rate: 1,
  low_stock_threshold: 5,
  default_payment_method: 'cash',
};

const defaultReceiptTemplate: ReceiptTemplate = {
  id: 'default',
  name: 'Plantilla Predeterminada',
  header_text: 'Taller Pro',
  footer_text: 'Gracias por su compra',
  show_logo: false,
  show_qr_code: true,
  show_tax_id: false,
  show_business_info: true,
  font_size: 'medium',
  paper_width: 80,
};

const defaultUISettings: UISettings = {
  theme: 'system',
  primary_color: 'hsl(var(--primary))',
  sidebar_collapsed: false,
  animations_enabled: true,
  compact_mode: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      businessSettings: null,
      loadingBusinessSettings: false,
      receiptTemplates: [],
      activeReceiptTemplate: defaultReceiptTemplate,
      loadingTemplates: false,
      uiSettings: defaultUISettings,

  fetchBusinessSettings: async () => {
    set({ loadingBusinessSettings: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) {
        set({ businessSettings: defaultBusinessSettings });
        return;
      }

      // Try to fetch from database
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', user.uid)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is OK for first time
        console.warn('Business settings table may not exist yet:', error);
        set({ businessSettings: defaultBusinessSettings });
        return;
      }

      if (data) {
        set({ businessSettings: data as BusinessSettings });
      } else {
        // Use defaults if no settings exist
        set({ businessSettings: defaultBusinessSettings });
      }
    } catch (error) {
      console.error('Error fetching business settings:', error);
      // Fallback to defaults
      set({ businessSettings: defaultBusinessSettings });
    } finally {
      set({ loadingBusinessSettings: false });
    }
  },

      updateBusinessSettings: async (settings: Partial<BusinessSettings>) => {
        try {
          const user = useAuthStore.getState().user;
          if (!user?.uid) {
            // Update local state only
            const currentSettings = get().businessSettings || defaultBusinessSettings;
            set({ businessSettings: { ...currentSettings, ...settings } });
            return;
          }

          const currentSettings = get().businessSettings || defaultBusinessSettings;
          const updatedSettings = { ...currentSettings, ...settings };

          const { error } = await supabase
            .from('business_settings')
            .upsert({
              user_id: user.uid,
              ...updatedSettings,
              updated_at: new Date().toISOString(),
            });

          if (error) {
            console.warn('Business settings table may not exist yet:', error);
            // Update local state anyway
            set({ businessSettings: updatedSettings });
            return;
          }

          set({ businessSettings: updatedSettings });
        } catch (error) {
          console.error('Error updating business settings:', error);
          // Update local state anyway
          const currentSettings = get().businessSettings || defaultBusinessSettings;
          set({ businessSettings: { ...currentSettings, ...settings } });
        }
      },

  fetchReceiptTemplates: async () => {
    set({ loadingTemplates: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) {
        set({ receiptTemplates: [defaultReceiptTemplate] });
        set({ activeReceiptTemplate: defaultReceiptTemplate });
        return;
      }

      // Try to fetch from database
      const { data, error } = await supabase
        .from('receipt_templates')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        console.warn('Receipt templates table may not exist yet:', error);
        set({ receiptTemplates: [defaultReceiptTemplate] });
        set({ activeReceiptTemplate: defaultReceiptTemplate });
        return;
      }

      if (data && data.length > 0) {
        const templates = data.map((t: any) => ({
          id: t.id,
          name: t.name,
          header_text: t.header_text,
          footer_text: t.footer_text,
          show_logo: t.show_logo,
          logo_url: t.logo_url,
          show_qr_code: t.show_qr_code,
          show_tax_id: t.show_tax_id,
          show_business_info: t.show_business_info,
          font_size: t.font_size,
          paper_width: t.paper_width,
        }));
        set({ receiptTemplates: templates });
        if (!get().activeReceiptTemplate) {
          set({ activeReceiptTemplate: templates[0] });
        }
      } else {
        // Use default template
        set({ receiptTemplates: [defaultReceiptTemplate] });
        set({ activeReceiptTemplate: defaultReceiptTemplate });
      }
    } catch (error) {
      console.error('Error fetching receipt templates:', error);
      // Fallback to default
      set({ receiptTemplates: [defaultReceiptTemplate] });
      set({ activeReceiptTemplate: defaultReceiptTemplate });
    } finally {
      set({ loadingTemplates: false });
    }
  },

      createReceiptTemplate: async (template: Partial<ReceiptTemplate>) => {
        const newTemplate: ReceiptTemplate = {
          ...defaultReceiptTemplate,
          ...template,
          id: `template-${Date.now()}`,
          name: template.name || 'Nueva Plantilla',
        };

        try {
          const user = useAuthStore.getState().user;
          if (!user?.uid) {
            // Fallback to local state
            set((state) => ({
              receiptTemplates: [...state.receiptTemplates, newTemplate],
            }));
            return;
          }

          const { data, error } = await supabase
            .from('receipt_templates')
            .insert({
              user_id: user.uid,
              ...newTemplate,
            })
            .select()
            .single();

          if (error) {
            console.warn('Receipt templates table may not exist yet:', error);
            // Fallback to local state
            set((state) => ({
              receiptTemplates: [...state.receiptTemplates, newTemplate],
            }));
            return;
          }

          set((state) => ({
            receiptTemplates: [...state.receiptTemplates, newTemplate],
          }));
        } catch (error) {
          console.error('Error creating receipt template:', error);
          // Fallback to local state
          set((state) => ({
            receiptTemplates: [...state.receiptTemplates, newTemplate],
          }));
        }
      },

      updateReceiptTemplate: async (id: string, template: Partial<ReceiptTemplate>) => {
        // Update local state first
        set((state) => ({
          receiptTemplates: state.receiptTemplates.map((t) =>
            t.id === id ? { ...t, ...template } : t
          ),
          activeReceiptTemplate:
            state.activeReceiptTemplate?.id === id
              ? { ...state.activeReceiptTemplate, ...template }
              : state.activeReceiptTemplate,
        }));

        try {
          const user = useAuthStore.getState().user;
          if (!user?.uid) return;

          const { error } = await supabase
            .from('receipt_templates')
            .update(template)
            .eq('user_id', user.uid)
            .eq('id', id);

          if (error) {
            console.warn('Receipt templates table may not exist yet:', error);
          }
        } catch (error) {
          console.error('Error updating receipt template:', error);
        }
      },

      deleteReceiptTemplate: async (id: string) => {
        // Update local state first
        set((state) => ({
          receiptTemplates: state.receiptTemplates.filter((t) => t.id !== id),
          activeReceiptTemplate:
            state.activeReceiptTemplate?.id === id
              ? defaultReceiptTemplate
              : state.activeReceiptTemplate,
        }));

        try {
          const user = useAuthStore.getState().user;
          if (!user?.uid) return;

          const { error } = await supabase
            .from('receipt_templates')
            .delete()
            .eq('user_id', user.uid)
            .eq('id', id);

          if (error) {
            console.warn('Receipt templates table may not exist yet:', error);
          }
        } catch (error) {
          console.error('Error deleting receipt template:', error);
        }
      },

      setActiveReceiptTemplate: (id: string) => {
        const template = get().receiptTemplates.find((t) => t.id === id);
        if (template) {
          set({ activeReceiptTemplate: template });
        }
      },

      updateUISettings: (settings: Partial<UISettings>) => {
        set((state) => ({
          uiSettings: { ...state.uiSettings, ...settings },
        }));
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        uiSettings: state.uiSettings,
        activeReceiptTemplate: state.activeReceiptTemplate,
      }),
    }
  )
);

