import React, { useCallback, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Loader2, ZoomIn } from 'lucide-react';

interface Props {
  src: string;                 // local object URL of the picked file
  shape?: 'round' | 'rect';
  onCancel: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
}

const OUTPUT_SIZE = 512; // normalize every upload to a small square

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (e) => reject(e));
    img.src = url;
  });
}

// Draw the selected region onto a fixed-size square canvas and export a JPEG blob.
async function getCroppedBlob(src: string, area: Area): Promise<Blob> {
  const image = await createImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to render crop'))), 'image/jpeg', 0.9);
  });
}

const ImageCropModal: React.FC<Props> = ({ src, shape = 'round', onCancel, onConfirm }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => setAreaPixels(pixels), []);

  const confirm = async () => {
    if (!areaPixels) return;
    setIsSaving(true);
    try {
      const blob = await getCroppedBlob(src, areaPixels);
      await onConfirm(blob);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-cad-panel border border-cad-border rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-cad-border">
          <h3 className="font-bold text-cad-text text-lg">Adjust your image</h3>
          <p className="text-slate-400 text-xs">Drag to reposition, use the slider to zoom.</p>
        </div>

        <div className="relative h-72 bg-cad-dark">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape={shape}
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-cad-accent"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl border border-cad-border text-slate-400 hover:border-white/30 font-bold transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={isSaving || !areaPixels}
              className="flex-1 bg-cad-accent hover:bg-sky-400 text-cad-dark font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
