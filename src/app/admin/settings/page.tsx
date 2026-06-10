'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { DEFAULT_SETTINGS, type Settings } from '@/lib/settings';
import { useToast } from '@/hooks/useToast';
import { AdminPageHeader, Panel } from '@/components/admin/AdminUI';
import { Button } from '@/components/ui/Button';

const inputBase =
  'w-full rounded-lg border border-gold-300/20 bg-dark-700 px-4 py-3 text-white placeholder:text-white/40 focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-300/50 transition-colors';

export default function AdminSettingsPage() {
  const toast = useToast();
  const [data, setData] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    adminApi
      .getSettings()
      .then((s) => active && setData({ ...DEFAULT_SETTINGS, ...s }))
      .catch(() => toast.error('No se pudo cargar la configuración'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [toast]);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await adminApi.updateSettings(data);
      setData({ ...DEFAULT_SETTINGS, ...saved });
      toast.success('Configuración guardada');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  // Función (no componente) → no remonta el input al tipear.
  const field = (
    label: string,
    k: keyof Settings,
    opts?: { placeholder?: string; textarea?: boolean }
  ) => (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gold-200">{label}</label>
      {opts?.textarea ? (
        <textarea
          value={String(data[k] ?? '')}
          onChange={(e) => set(k, e.target.value as Settings[typeof k])}
          placeholder={opts?.placeholder}
          rows={2}
          className={`${inputBase} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={String(data[k] ?? '')}
          onChange={(e) => set(k, e.target.value as Settings[typeof k])}
          placeholder={opts?.placeholder}
          className={inputBase}
        />
      )}
    </div>
  );

  if (loading) {
    return (
      <div>
        <AdminPageHeader title="Configuración" subtitle="Datos del negocio" />
        <div className="h-64 animate-pulse rounded-[16px]" style={{ background: 'var(--panel)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Configuración"
        subtitle="Datos del negocio que se muestran en el sitio"
        actions={
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Guardando…
              </>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        }
      />

      <Panel style={{ padding: 24 }}>
        <h3 className="mb-4 font-display text-[20px] text-cream">Negocio</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field('Nombre del negocio', 'businessName')}
          {field('Dirección del local', 'address')}
          {field('Teléfono', 'phone')}
          {field('Email', 'email')}
          {field('WhatsApp (número)', 'whatsappNumber', { placeholder: '+5492364...' })}
          {field('Instagram', 'instagram')}
          <div className="sm:col-span-2">
            {field('Mensaje de WhatsApp prearmado', 'whatsappMessage', { textarea: true })}
          </div>
        </div>
      </Panel>

      <Panel style={{ padding: 24 }}>
        <h3 className="mb-4 font-display text-[20px] text-cream">Entrega</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field('Zona de delivery', 'deliveryZone')}
          <div className="flex items-end gap-6">
            <label className="flex items-center gap-2 text-sm text-white/90">
              <input
                type="checkbox"
                checked={data.deliveryEnabled}
                onChange={(e) => set('deliveryEnabled', e.target.checked)}
                className="size-5 rounded border-gold-300/30 bg-dark-700 text-gold-300"
              />
              Delivery activo
            </label>
            <label className="flex items-center gap-2 text-sm text-white/90">
              <input
                type="checkbox"
                checked={data.pickupEnabled}
                onChange={(e) => set('pickupEnabled', e.target.checked)}
                className="size-5 rounded border-gold-300/30 bg-dark-700 text-gold-300"
              />
              Retiro en local activo
            </label>
          </div>
        </div>
      </Panel>

      <Panel style={{ padding: 24 }}>
        <h3 className="mb-4 font-display text-[20px] text-cream">Horarios y aviso</h3>
        <div className="grid grid-cols-1 gap-4">
          {field('Horario (texto libre)', 'hours', {
            placeholder: 'Lun a Sáb · 08–22 h · Dom cerrado',
          })}
          {field('Texto de la barra de aviso (arriba del sitio)', 'announcementText', {
            textarea: true,
          })}
        </div>
      </Panel>
    </div>
  );
}
