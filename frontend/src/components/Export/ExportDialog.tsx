import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Z } from '../../constants/layers';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'png' | 'jpeg', quality: number) => void;
  designName: string;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose, onExport, designName }) => {
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [quality, setQuality] = useState(0.95);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(format, quality);
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  return (
    <>
      <div
        className="dialog-backdrop-enter fixed inset-0 bg-black/60 backdrop-blur-sm"
        style={{ zIndex: Z.MODAL }}
        onClick={onClose}
      />
      <div
        className="dialog-panel-enter fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-raised border border-line-medium rounded-xl shadow-2xl w-full max-w-md"
        style={{ zIndex: Z.MODAL_PANEL }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-line-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LucideIcons.Download className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold text-ink">Export Design</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-lg transition-colors text-ink-secondary">
            <LucideIcons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* File Name Preview */}
          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-2">File Name</label>
            <div className="px-4 py-3 bg-surface-overlay border border-line-medium rounded-lg">
              <div className="flex items-center gap-2">
                <LucideIcons.File className="w-4 h-4 text-ink-muted" />
                <span className="text-sm font-medium text-ink">
                  {designName || 'room-design'}.{format}
                </span>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-3">Format</label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormat('png')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  format === 'png'
                    ? 'border-accent bg-accent/15 shadow-sm'
                    : 'border-line-medium hover:border-line-strong'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <LucideIcons.Image className={`w-6 h-6 ${format === 'png' ? 'text-accent' : 'text-ink-muted'}`} />
                  <span className={`text-sm font-semibold ${format === 'png' ? 'text-accent' : 'text-ink-secondary'}`}>
                    PNG
                  </span>
                  <span className="text-xs text-ink-muted">Lossless quality</span>
                </div>
              </button>
              <button
                onClick={() => setFormat('jpeg')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  format === 'jpeg'
                    ? 'border-accent bg-accent/15 shadow-sm'
                    : 'border-line-medium hover:border-line-strong'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <LucideIcons.FileImage className={`w-6 h-6 ${format === 'jpeg' ? 'text-accent' : 'text-ink-muted'}`} />
                  <span className={`text-sm font-semibold ${format === 'jpeg' ? 'text-accent' : 'text-ink-secondary'}`}>
                    JPEG
                  </span>
                  <span className="text-xs text-ink-muted">Smaller file size</span>
                </div>
              </button>
            </div>
          </div>

          {/* Quality Slider (for JPEG) */}
          {format === 'jpeg' && (
            <div>
              <label className="block text-sm font-medium text-ink-secondary mb-2">
                Quality: {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="slider-matte"
              />
              <div className="flex justify-between text-xs text-ink-muted mt-1">
                <span>Lower quality (smaller file)</span>
                <span>Higher quality (larger file)</span>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
            <div className="flex items-start gap-3">
              <LucideIcons.Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="text-sm text-ink-secondary">
                <p className="font-medium text-ink mb-1">Export Tips</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>PNG format preserves transparency and all colors</li>
                  <li>JPEG format creates smaller files but no transparency</li>
                  <li>Higher quality means larger file size</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-line-subtle bg-surface-overlay rounded-b-xl flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-ink-secondary hover:bg-surface-hover rounded-lg transition-colors"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="btn-glossy btn-glossy-primary px-6 py-2 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <LucideIcons.Loader2 className="w-4 h-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <LucideIcons.Download className="w-4 h-4" />
                <span>Export</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default ExportDialog;
