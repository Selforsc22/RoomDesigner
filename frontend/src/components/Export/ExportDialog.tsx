import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

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

  // Define animations inline
  const styles = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translate(-50%, -45%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }
  `;

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
      <style>{styles}</style>
      <div
        className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LucideIcons.Download className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Export Design</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg">
            <LucideIcons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* File Name Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">File Name</label>
            <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <LucideIcons.File className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">
                  {designName || 'room-design'}.{format}
                </span>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Format</label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormat('png')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  format === 'png'
                    ? 'border-primary bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <LucideIcons.Image className={`w-6 h-6 ${format === 'png' ? 'text-primary' : 'text-gray-500'}`} />
                  <span className={`text-sm font-semibold ${format === 'png' ? 'text-primary' : 'text-gray-700'}`}>
                    PNG
                  </span>
                  <span className="text-xs text-gray-500">Lossless quality</span>
                </div>
              </button>
              <button
                onClick={() => setFormat('jpeg')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  format === 'jpeg'
                    ? 'border-primary bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <LucideIcons.FileImage className={`w-6 h-6 ${format === 'jpeg' ? 'text-primary' : 'text-gray-500'}`} />
                  <span className={`text-sm font-semibold ${format === 'jpeg' ? 'text-primary' : 'text-gray-700'}`}>
                    JPEG
                  </span>
                  <span className="text-xs text-gray-500">Smaller file size</span>
                </div>
              </button>
            </div>
          </div>

          {/* Quality Slider (for JPEG) */}
          {format === 'jpeg' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality: {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Lower quality (smaller file)</span>
                <span>Higher quality (larger file)</span>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <LucideIcons.Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Export Tips</p>
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
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-6 py-2 text-sm font-semibold text-white bg-primary hover:bg-blue-600 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
