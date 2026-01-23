import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import type { RoomSection } from '../../types';

interface SectionManagerProps {
  sections?: RoomSection[];
  onUpdateSection: (sectionId: string, updates: Partial<RoomSection>) => void;
  onAddSection: () => void;
  onDeleteSection: (sectionId: string) => void;
}

const SectionManager: React.FC<SectionManagerProps> = ({
  sections,
  onUpdateSection,
  onAddSection,
  onDeleteSection,
}) => {
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<RoomSection>>({});

  if (!sections || sections.length === 0) {
    return null;
  }

  const startEditing = (section: RoomSection) => {
    setEditingSectionId(section.id);
    setEditValues({
      name: section.name,
      x: section.x,
      y: section.y,
      width: section.width,
      height: section.height,
    });
  };

  const saveEditing = () => {
    if (editingSectionId && editValues) {
      onUpdateSection(editingSectionId, editValues);
    }
    setEditingSectionId(null);
    setEditValues({});
  };

  const cancelEditing = () => {
    setEditingSectionId(null);
    setEditValues({});
  };

  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Room Sections</h3>
        <button
          onClick={onAddSection}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Add Section"
        >
          <Plus className="w-4 h-4 text-primary" />
        </button>
      </div>

      <div className="space-y-2">
        {sections.map((section, index) => {
          const isEditing = editingSectionId === section.id;

          return (
            <div
              key={section.id}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
            >
              {isEditing ? (
                // Edit mode
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editValues.name || ''}
                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Section name"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600">Width (ft)</label>
                      <input
                        type="number"
                        min="4"
                        max="100"
                        step="0.5"
                        value={editValues.width || 0}
                        onChange={(e) =>
                          setEditValues({ ...editValues, width: parseFloat(e.target.value) })
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Height (ft)</label>
                      <input
                        type="number"
                        min="4"
                        max="100"
                        step="0.5"
                        value={editValues.height || 0}
                        onChange={(e) =>
                          setEditValues({ ...editValues, height: parseFloat(e.target.value) })
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600">X Position</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editValues.x || 0}
                        onChange={(e) =>
                          setEditValues({ ...editValues, x: parseFloat(e.target.value) })
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Y Position</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editValues.y || 0}
                        onChange={(e) =>
                          setEditValues({ ...editValues, y: parseFloat(e.target.value) })
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={saveEditing}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-primary text-white text-xs rounded hover:bg-primary/90 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {section.name || `Section ${index + 1}`}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {section.width}' × {section.height}'
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Position: ({section.x}, {section.y})
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditing(section)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Edit Section"
                      >
                        <Edit2 className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${section.name || 'this section'}?`)) {
                            onDeleteSection(section.id);
                          }
                        }}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-gray-500 px-1">
        {sections.length} section{sections.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default SectionManager;
