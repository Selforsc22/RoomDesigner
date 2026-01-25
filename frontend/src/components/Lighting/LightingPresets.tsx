import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { LIGHTING_PRESETS } from '../../config/lightingPresets';
import type { LightingPreset } from '../../config/lightingPresets';

interface LightingPresetsProps {
  onApplyPreset: (preset: LightingPreset) => void;
}

const LightingPresets: React.FC<LightingPresetsProps> = ({ onApplyPreset }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('portrait');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Group presets by category
  const presetsByCategory = LIGHTING_PRESETS.reduce((acc, preset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
  }, {} as Record<string, LightingPreset[]>);

  const categoryInfo = {
    portrait: {
      label: 'Portrait',
      icon: 'User',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    product: {
      label: 'Product',
      icon: 'Package',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    video: {
      label: 'Video',
      icon: 'Video',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    general: {
      label: 'General',
      icon: 'Lightbulb',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  };

  const handleApplyPreset = (preset: LightingPreset) => {
    setSelectedPreset(preset.id);
    onApplyPreset(preset);
  };

  const getCategoryIcon = (iconName: string) => {
    const Icon = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>;
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  return (
    <div className="p-4 border-b border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Lighting Presets</h2>
        <LucideIcons.Sparkles className="w-4 h-4 text-yellow-500" />
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Apply professional lighting setups instantly
      </p>

      <div className="space-y-2">
        {Object.entries(presetsByCategory).map(([category, presets]) => {
          const info = categoryInfo[category as keyof typeof categoryInfo];
          const isExpanded = expandedCategory === category;

          return (
            <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className={`w-full flex items-center justify-between px-3 py-2.5 ${info.bgColor} hover:opacity-80 transition-all`}
              >
                <div className="flex items-center gap-2">
                  <span className={info.color}>
                    {getCategoryIcon(info.icon)}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">{info.label}</span>
                  <span className="text-xs text-gray-500">({presets.length})</span>
                </div>
                {isExpanded ? (
                  <LucideIcons.ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <LucideIcons.ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>

              {/* Presets List */}
              {isExpanded && (
                <div className="bg-white p-2 space-y-1">
                  {presets.map((preset) => {
                    const isSelected = selectedPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          isSelected
                            ? 'border-primary bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        title={`${preset.lights.length} lights - ${preset.description}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {preset.name}
                              </h3>
                              {isSelected && (
                                <LucideIcons.Check className="w-4 h-4 text-primary flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                              {preset.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <LucideIcons.Lightbulb className="w-3 h-3" />
                                <span>{preset.lights.length} lights</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <LucideIcons.Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <p className="font-medium mb-1">Pro Tip</p>
            <p>Presets will replace all existing lights in your design. Save your work first!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightingPresets;
