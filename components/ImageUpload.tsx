import React, { useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { uploadImage, imageSrc } from '../services/api';
import ImageCropModal from './ImageCropModal';

interface Props {
  value?: string;
  onChange: (url: string | undefined) => void;
  label?: string;
  fallback?: string; // single letter shown when no image is set
  shape?: 'square' | 'circle';
}

// Cap on the RAW picked file just to avoid loading an absurd file into the
// cropper. The uploaded result is always a downscaled 512px JPEG, well under
// the backend's 2 MB limit — so users can pick large photos and still succeed.
const RAW_MAX_MB = 15;
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

const ImageUpload: React.FC<Props> = ({ value, onChange, label = 'Upload image', fallback, shape = 'square' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const pick = () => inputRef.current?.click();

  // Step 1: validate the picked file and open the crop modal.
  const handleFile = (file?: File) => {
    setError(null);
    if (inputRef.current) inputRef.current.value = ''; // allow re-selecting the same file
    if (!file) return;
    if (!ALLOWED.includes(file.type)) { setError('Use PNG, JPEG, WEBP or GIF'); return; }
    if (file.size > RAW_MAX_MB * 1024 * 1024) { setError(`Image must be under ${RAW_MAX_MB} MB`); return; }
    setCropSrc(URL.createObjectURL(file));
  };

  const closeCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  // Step 2: upload the cropped blob returned by the modal.
  const handleCropConfirm = async (blob: Blob) => {
    setIsUploading(true);
    try {
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      const { url } = await uploadImage(file);
      onChange(url);
      closeCrop();
    } catch (e: any) {
      setError(e.message ?? 'Upload failed');
      closeCrop();
    } finally {
      setIsUploading(false);
    }
  };

  const preview = imageSrc(value);
  const rounding = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={pick}
        disabled={isUploading}
        className={`relative w-20 h-20 ${rounding} overflow-hidden border border-cad-border bg-cad-surface/50 flex items-center justify-center group shrink-0`}
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-cad-accent">{fallback ?? '?'}</span>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {isUploading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Upload className="w-5 h-5 text-white" />
          )}
        </div>
      </button>

      <div className="space-y-1">
        <button
          type="button"
          onClick={pick}
          disabled={isUploading}
          className="text-sm font-bold text-cad-accent hover:underline disabled:opacity-50"
        >
          {isUploading ? 'Uploading…' : value ? 'Change' : label}
        </button>
        {value && !isUploading && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="block text-xs text-slate-500 hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        )}
        {error ? (
          <p className="text-xs text-red-400 font-medium">{error}</p>
        ) : (
          <p className="text-[10px] text-slate-500">PNG, JPG or WEBP · you can crop after picking</p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {cropSrc && (
        <ImageCropModal
          src={cropSrc}
          shape={shape === 'circle' ? 'round' : 'rect'}
          onCancel={closeCrop}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
};

export default ImageUpload;
