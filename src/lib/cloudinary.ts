function getUploadPreset(): string {
  const fromViteMeta =
    typeof import.meta !== 'undefined' &&
    'env' in import.meta &&
    (
      import.meta as ImportMeta & {
        env?: { NEXT_CLOUDINARY_UPLOAD_PRESET?: string };
      }
    ).env?.NEXT_CLOUDINARY_UPLOAD_PRESET;
  const fromProcess = process.env.NEXT_CLOUDINARY_UPLOAD_PRESET || '';
  return fromViteMeta || fromProcess;
}

export async function uploadToCloudinary(file: File): Promise<string> {
  const uploadPreset = getUploadPreset();
  if (!uploadPreset) {
    throw new Error(
      'Falta configurar NEXT_CLOUDINARY_UPLOAD_PRESET en el entorno'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(
    'https://api.cloudinary.com/v1_1/dmaciisvy/image/upload',
    { method: 'POST', body: formData }
  );

  const rawText = await response.text();

  if (!response.ok) {
    let message = `Error subiendo imagen a Cloudinary (${response.status})`;
    try {
      const errJson = JSON.parse(rawText) as {
        error?: { message?: string };
      };
      if (errJson?.error?.message) {
        message = `${message}: ${errJson.error.message}`;
      }
    } catch {
      if (rawText) message = `${message}: ${rawText.slice(0, 200)}`;
    }
    throw new Error(message);
  }

  let data: { secure_url?: string };
  try {
    data = JSON.parse(rawText) as { secure_url?: string };
  } catch {
    throw new Error('Respuesta inválida de Cloudinary (no JSON)');
  }

  if (!data.secure_url) {
    throw new Error('Respuesta inválida de Cloudinary (sin secure_url)');
  }

  return data.secure_url;
}
