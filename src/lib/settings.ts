import { API_URL } from './constants';

/** Configuración del negocio editable desde el admin. */
export interface Settings {
  businessName: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  whatsappMessage: string;
  email: string;
  instagram: string;
  deliveryZone: string;
  hours: string;
  announcementText: string;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
}

/** Defaults de fallback: si el backend no responde, el sitio igual muestra algo válido. */
export const DEFAULT_SETTINGS: Settings = {
  businessName: 'MIINUTA. CARNES',
  address: 'Av. San Martín 1234, Junín (B)',
  phone: '+549 2364 26-1926',
  whatsappNumber: '+5492364261926',
  whatsappMessage: 'Hola! Quiero hacer un pedido 🔥',
  email: 'hola@miinuta.com.ar',
  instagram: '@miinuta.carnes',
  deliveryZone: 'Junín (B) y alrededores',
  hours: 'Lun a Sáb · 08–22 h · Dom cerrado',
  announcementText: 'Delivery en Junín (B) y alrededores · Lun a Sáb 08–22h',
  deliveryEnabled: true,
  pickupEnabled: true,
};

export async function fetchSettings(): Promise<Settings> {
  const res = await fetch(`${API_URL}/settings`);
  if (!res.ok) throw new Error('No se pudo cargar la configuración');
  const data = await res.json();
  // Merge con defaults por si falta algún campo.
  return { ...DEFAULT_SETTINGS, ...data };
}
