'use client';

import { useState } from 'react';
import type { CheckoutFormData } from '@/lib/types';
import type { CheckoutFormErrors } from '@/lib/validations';
import { validateCheckoutForm } from '@/lib/validations';
import { Icon, type IconName } from '@/components/ui/Icons';
import { fmtPrice } from '@/lib/utils';

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void;
  loading: boolean;
  total: number;
}

const INITIAL_DATA: CheckoutFormData = {
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  customerZipCode: '',
  customerEmail: '',
  notes: '',
};

export function CheckoutForm({ onSubmit, loading, total }: CheckoutFormProps) {
  const [data, setData] = useState<CheckoutFormData>(INITIAL_DATA);
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (field: keyof CheckoutFormData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (field !== 'notes' && touched[field]) {
      const newErrors = validateCheckoutForm({
        customerName: field === 'customerName' ? value : data.customerName,
        customerPhone: field === 'customerPhone' ? value : data.customerPhone,
        customerEmail: field === 'customerEmail' ? value : data.customerEmail,
      });
      setErrors((prev) => ({
        ...prev,
        [field]: newErrors[field as keyof typeof newErrors],
      }));
    }
  };

  const handleBlur = (field: keyof CheckoutFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'notes') return;
    const newErrors = validateCheckoutForm({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
    });
    setErrors((prev) => ({
      ...prev,
      [field]: newErrors[field as keyof typeof newErrors],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateCheckoutForm({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
    });
    setErrors(newErrors);
    setTouched({ customerName: true, customerPhone: true, customerEmail: true });

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors || !data.customerName.trim() || !data.customerPhone.trim()) {
      return;
    }

    onSubmit({
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone.trim(),
      customerAddress: data.customerAddress?.trim() || undefined,
      customerZipCode: data.customerZipCode?.trim() || undefined,
      customerEmail: data.customerEmail?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
    });
  };

  const hasErrors = Object.values(errors).some(Boolean);
  const missingRequired = !data.customerName.trim() || !data.customerPhone.trim();
  const isDisabled = hasErrors || missingRequired || loading;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
      {/* Datos de entrega */}
      <section>
        <h2 className="font-display mb-4 text-[22px] text-cream lg:text-[26px]">
          Datos de entrega
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DesignField
            label="Nombre completo *"
            icon="user"
            placeholder="Martina Gómez"
            value={data.customerName}
            onChange={(v) => handleChange('customerName', v)}
            onBlur={() => handleBlur('customerName')}
            error={errors.customerName}
            disabled={loading}
          />
          <DesignField
            label="Teléfono *"
            icon="phone"
            type="tel"
            placeholder="236 555-1234"
            value={data.customerPhone}
            onChange={(v) => handleChange('customerPhone', v)}
            onBlur={() => handleBlur('customerPhone')}
            error={errors.customerPhone}
            disabled={loading}
          />
          <div className="sm:col-span-2">
            <DesignField
              label="Dirección de entrega"
              icon="mapPin"
              placeholder="Belgrano 842"
              value={data.customerAddress || ''}
              onChange={(v) => handleChange('customerAddress', v)}
              disabled={loading}
            />
          </div>
          <DesignField
            label="Código postal"
            placeholder="6000"
            value={data.customerZipCode || ''}
            onChange={(v) => handleChange('customerZipCode', v)}
            disabled={loading}
          />
          <DesignField
            label="Email"
            icon="mail"
            type="email"
            placeholder="martina@email.com"
            value={data.customerEmail || ''}
            onChange={(v) => handleChange('customerEmail', v)}
            onBlur={() => handleBlur('customerEmail')}
            error={errors.customerEmail}
            disabled={loading}
          />
          <div className="sm:col-span-2">
            <div className="field">
              <span className="field-lbl">Notas (opcional)</span>
              <div className="field-input" style={{ height: 'auto', padding: '12px 15px' }}>
                <textarea
                  value={data.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value.slice(0, 500))}
                  placeholder="Ej: tocar timbre 2 veces"
                  rows={2}
                  maxLength={500}
                  disabled={loading}
                  className="resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Método de entrega */}
      <section>
        <h2 className="font-display mb-4 text-[22px] text-cream lg:text-[26px]">
          Método de entrega
        </h2>
        <div className="opt-card sel">
          <span className="dot" />
          <span className="oi">
            <Icon.truck />
          </span>
          <div>
            <div className="text-[14.5px] font-bold text-cream">
              Delivery a domicilio
            </div>
            <div className="text-[12.5px] text-tan-dim">
              Hoy · antes de las 22h
            </div>
          </div>
        </div>
      </section>

      {/* Pago */}
      <section>
        <h2 className="font-display mb-4 text-[22px] text-cream lg:text-[26px]">
          Pago
        </h2>
        <div className="opt-card sel">
          <span className="dot" />
          <span className="oi">
            <Icon.creditCard />
          </span>
          <div className="flex-1">
            <div className="text-[14.5px] font-bold text-cream">
              Mercado Pago
            </div>
            <div className="text-[12.5px] text-tan-dim">
              Tarjeta, débito, dinero en cuenta. Pago protegido.
            </div>
          </div>
          <Icon.lock style={{ width: 18, height: 18, color: 'var(--gold)' }} />
        </div>
      </section>

      <button
        type="submit"
        disabled={isDisabled}
        className="btn btn-gold h-[54px] w-full text-[14.5px]"
        style={isDisabled ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
      >
        {loading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#2a1c08] border-t-transparent" />
            Procesando…
          </>
        ) : (
          <>
            <Icon.lock style={{ width: 17, height: 17 }} /> Pagar {fmtPrice(total)}
          </>
        )}
      </button>
      <p className="-mt-3 text-center text-[11.5px] text-tan-dim">
        El precio final se ajusta según el peso real de cada corte.
      </p>
    </form>
  );
}

function DesignField({
  label,
  icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled,
}: {
  label: string;
  icon?: IconName;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
}) {
  const I = icon ? Icon[icon] : null;
  return (
    <div className="field">
      <span className="field-lbl">{label}</span>
      <div
        className="field-input"
        style={error ? { boxShadow: 'inset 0 0 0 1.5px #d4796b' } : undefined}
      >
        {I && <I />}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
      </div>
      {error && <span className="text-[12px]" style={{ color: '#d4796b' }}>{error}</span>}
    </div>
  );
}
