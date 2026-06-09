'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Plus } from 'lucide-react';
import type { Product } from '@/lib/types';
import { adminApi } from '@/lib/adminApi';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/ImageUploader';

export interface CategoryOption {
  _id: string;
  name: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
  categories?: CategoryOption[];
}

interface FormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
  videoUrl: string;
  category: string;
  active: boolean;
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  stock?: string;
  category?: string;
}

interface NewCategoryErrors {
  name?: string;
  description?: string;
}

function mergeCategoryOptions(
  fromProps: CategoryOption[],
  local: CategoryOption[]
): CategoryOption[] {
  const ids = new Set(fromProps.map((c) => c._id));
  return [
    ...fromProps,
    ...local.filter((c) => !ids.has(c._id)),
  ];
}

function validateNewCategoryFields(
  name: string,
  description: string
): NewCategoryErrors {
  const errors: NewCategoryErrors = {};
  const trimmed = name.trim();
  if (!trimmed) errors.name = 'Nombre requerido';
  else if (trimmed.length < 3) errors.name = 'Mínimo 3 caracteres';
  else if (trimmed.length > 100) errors.name = 'Máximo 100 caracteres';
  if (description.length > 500)
    errors.description = 'Máximo 500 caracteres';
  return errors;
}

const initialFormData: FormData = {
  name: '',
  description: '',
  price: '',
  stock: '0',
  imageUrl: '',
  videoUrl: '',
  category: '',
  active: true,
};

function validateForm(data: FormData, isEdit: boolean): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = 'Nombre requerido';
  else if (data.name.trim().length < 3)
    errors.name = 'Mínimo 3 caracteres';
  if (!data.price || Number(data.price) <= 0) errors.price = 'Precio requerido (mayor a 0)';
  if (data.stock === '' || Number(data.stock) < 0)
    errors.stock = 'Stock debe ser 0 o más';
  if (!data.category) errors.category = 'Categoría requerida';
  if (data.description.length > 1000) errors.description = 'Máximo 1000 caracteres';
  return errors;
}

export function ProductFormModal({
  isOpen,
  onClose,
  product,
  onSuccess,
  categories = [],
}: ProductFormModalProps) {
  const toast = useToast();
  const [data, setData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [localCategories, setLocalCategories] = useState<CategoryOption[]>(
    []
  );
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryErrors, setNewCategoryErrors] = useState<NewCategoryErrors>(
    {}
  );
  const [creatingCategory, setCreatingCategory] = useState(false);
  const prevIsOpenRef = useRef(false);

  const isEdit = !!product;

  useEffect(() => {
    if (isOpen) {
      setImageUploading(false);
      const justOpened = !prevIsOpenRef.current;
      prevIsOpenRef.current = true;
      if (justOpened) {
        setLocalCategories([...categories]);
        setShowCategoryForm(false);
        setNewCategoryName('');
        setNewCategoryDescription('');
        setNewCategoryErrors({});
        setCreatingCategory(false);
      } else {
        setLocalCategories((prev) => mergeCategoryOptions(categories, prev));
      }
      if (product) {
        setData({
          name: product.name,
          description: product.description || '',
          price: String(product.price),
          stock: String(product.stock),
          imageUrl: product.imageUrl || '',
          videoUrl: product.videoUrl || '',
          category:
            typeof product.category === 'object'
              ? product.category._id
              : product.category,
          active: product.active,
        });
      } else {
        setData(initialFormData);
      }
      setErrors({});
    } else {
      prevIsOpenRef.current = false;
    }
  }, [isOpen, product, categories]);

  const handleCancelNewCategory = () => {
    setShowCategoryForm(false);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryErrors({});
  };

  const handleCreateCategory = async () => {
    const fieldErrors = validateNewCategoryFields(
      newCategoryName,
      newCategoryDescription
    );
    setNewCategoryErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;

    setCreatingCategory(true);
    try {
      const created = await adminApi.createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
      });
      toast.success('Categoría creada');
      setLocalCategories((prev) => {
        if (prev.some((c) => c._id === created._id)) return prev;
        return [...prev, { _id: created._id, name: created.name }];
      });
      setData((prev) => ({ ...prev, category: created._id }));
      setErrors((prev) => ({ ...prev, category: undefined }));
      setShowCategoryForm(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setNewCategoryErrors({});
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error al crear categoría'
      );
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUploading || creatingCategory) return;
    const formErrors = validateForm(data, isEdit);
    setErrors(formErrors);
    if (Object.values(formErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const payload = {
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        price: Number(data.price),
        stock: Number(data.stock),
        imageUrl: data.imageUrl.trim() || undefined,
        videoUrl: data.videoUrl.trim() || undefined,
        category: data.category,
        ...(isEdit && { active: data.active }),
      };

      if (isEdit && product) {
        await adminApi.updateProduct(product._id, payload);
        toast.success('Producto actualizado');
      } else {
        await adminApi.createProduct({
          name: payload.name,
          description: payload.description,
          price: payload.price,
          stock: payload.stock,
          imageUrl: payload.imageUrl,
          category: payload.category,
        });
        toast.success('Producto creado');
      }
      onClose();
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error al guardar producto'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    'w-full rounded-lg border bg-dark-700 px-4 py-3 text-white placeholder:text-white/40 focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-300/50 transition-colors';
  const inputError =
    'border-red-400 focus:border-red-400 focus:ring-red-400/20';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-[60] max-h-[90vh] w-[calc(100%-2rem)] max-w-[600px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-gold-300/30 bg-dark-800 p-6 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-gold-200">
              {isEdit ? 'Editar producto' : 'Nuevo producto'}
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block font-semibold text-gold-200">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      name: e.target.value.slice(0, 100),
                    }))
                  }
                  placeholder="Ej: Milanesa napolitana"
                  maxLength={100}
                  disabled={loading}
                  className={`${inputBase} ${errors.name ? inputError : 'border-gold-300/20'}`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block font-semibold text-gold-200">
                  Descripción
                </label>
                <textarea
                  value={data.description}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      description: e.target.value.slice(0, 1000),
                    }))
                  }
                  placeholder="Descripción del producto"
                  rows={3}
                  maxLength={1000}
                  disabled={loading}
                  className={`${inputBase} resize-none border-gold-300/20`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-400">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block font-semibold text-gold-200">
                    Precio *
                  </label>
                  <input
                    type="number"
                    value={data.price}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, price: e.target.value }))
                    }
                    placeholder="0.00"
                    min={0.01}
                    step={0.01}
                    disabled={loading}
                    className={`${inputBase} ${errors.price ? inputError : 'border-gold-300/20'}`}
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-400">{errors.price}</p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block font-semibold text-gold-200">
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={data.stock}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, stock: e.target.value }))
                    }
                    placeholder="0"
                    min={0}
                    disabled={loading}
                    className={`${inputBase} ${errors.stock ? inputError : 'border-gold-300/20'}`}
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-400">{errors.stock}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block font-semibold text-gold-200">
                  Imagen del producto
                </label>
                <ImageUploader
                  value={data.imageUrl}
                  onUploadSuccess={(secureUrl) =>
                    setData((prev) => ({ ...prev, imageUrl: secureUrl }))
                  }
                  onClear={() =>
                    setData((prev) => ({ ...prev, imageUrl: '' }))
                  }
                  onUploadingChange={setImageUploading}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold text-gold-200">
                  URL de video
                </label>
                <input
                  type="url"
                  value={data.videoUrl}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, videoUrl: e.target.value }))
                  }
                  placeholder="https://..."
                  disabled={loading}
                  className={`${inputBase} border-gold-300/20`}
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold text-gold-200">
                  Categoría *
                </label>
                <select
                  value={data.category}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, category: e.target.value }))
                  }
                  disabled={loading || creatingCategory}
                  className={`${inputBase} ${errors.category ? inputError : 'border-gold-300/20'}`}
                >
                  <option value="">Seleccionar categoría</option>
                  {localCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-400">{errors.category}</p>
                )}
                {!showCategoryForm && (
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(true)}
                    disabled={loading || creatingCategory}
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-gold-300 transition-colors hover:text-gold-200 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Plus className="size-4 shrink-0" aria-hidden />
                    Crear nueva categoría
                  </button>
                )}
                <AnimatePresence initial={false}>
                  {showCategoryForm && (
                    <motion.div
                      key="inline-new-category"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-3 rounded-lg border border-gold-300/20 bg-dark-700/40 p-4">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-gold-200">
                            Nombre de la categoría *
                          </label>
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => {
                              setNewCategoryName(e.target.value.slice(0, 100));
                              if (newCategoryErrors.name) {
                                setNewCategoryErrors((prev) => ({
                                  ...prev,
                                  name: undefined,
                                }));
                              }
                            }}
                            placeholder="Ej: Platos principales"
                            maxLength={100}
                            disabled={creatingCategory}
                            className={`${inputBase} ${newCategoryErrors.name ? inputError : 'border-gold-300/20'}`}
                          />
                          {newCategoryErrors.name && (
                            <p className="mt-1 text-sm text-red-400">
                              {newCategoryErrors.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-gold-200">
                            Descripción
                          </label>
                          <textarea
                            value={newCategoryDescription}
                            onChange={(e) => {
                              setNewCategoryDescription(
                                e.target.value.slice(0, 500)
                              );
                              if (newCategoryErrors.description) {
                                setNewCategoryErrors((prev) => ({
                                  ...prev,
                                  description: undefined,
                                }));
                              }
                            }}
                            placeholder="Opcional"
                            rows={2}
                            maxLength={500}
                            disabled={creatingCategory}
                            className={`${inputBase} resize-none ${newCategoryErrors.description ? inputError : 'border-gold-300/20'}`}
                          />
                          {newCategoryErrors.description && (
                            <p className="mt-1 text-sm text-red-400">
                              {newCategoryErrors.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={handleCancelNewCategory}
                            disabled={creatingCategory}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            className="flex-1"
                            onClick={handleCreateCategory}
                            disabled={creatingCategory}
                          >
                            {creatingCategory ? (
                              <>
                                <Loader2 className="size-5 animate-spin" />
                                Creando…
                              </>
                            ) : (
                              'Crear'
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isEdit && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={data.active}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        active: e.target.checked,
                      }))
                    }
                    disabled={loading}
                    className="size-5 rounded border-gold-300/30 bg-dark-700 text-gold-300 focus:ring-gold-300/50"
                  />
                  <label htmlFor="active" className="font-medium text-gold-200">
                    Producto activo (visible en el menú)
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                  disabled={loading || creatingCategory}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={loading || imageUploading || creatingCategory}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Guardando...
                    </>
                  ) : imageUploading ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Subiendo imagen…
                    </>
                  ) : (
                    'Guardar'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
