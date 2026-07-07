import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import type { RoomSection } from '../../types';

interface SectionManagerProps {
  sections?: RoomSection[];
  onUpdateSection: (sectionId: string, updates: Partial<RoomSection>) => void;
  onAddSection: () => void;
  onDeleteSection: (sectionId: string) => void;
}

const fieldClass =
  'w-full px-2 py-1 text-sm bg-surface-hover border border-line-medium rounded text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent transition-colors';

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
    <div className="border-t border-line-subtle pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-ink-secondary">Room Sections</h3>
        <button
          onClick={onAddSection}
          className="p-1 hover:bg-surface-hover rounded transition-colors"
          title="Add Section"
        >
          <Plus className="w-4 h-4 text-accent" />
        </button>
      </div>

      <div className="space-y-2">
        {sections.map((section, index) => {
          const isEditing = editingSectionId === section.id;

          return (
            <div
              key={section.id}
              className="bg-surface-overlay rounded-lg p-3 border border-line-subtle"
            >
              {isEditing ? (
                // Edit mode
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editValues.name || ''}
                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                    className={fieldClass}
                    placeholder="Section name"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-ink-muted">Width (ft)</label>
                      <input
                        type="number"
                        min="4"
                        max="100"
                        step="0.5"
                        value={editValues.width || 0}
                        onChange={(e) =>
                          setEditValues({ ...editValues, width: parseFloat(e.target.value) })
                        }
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-ink-muted">Height (ft)</label>
                      <input
                        type="number"
                        min="4"
                        max="100"
                        step="0.5"
                        value={editValues.height || 0}
                        onChange={(e) =>
                          setEditValues({ ...editValues, height: parseFloat(e.target.value) })
                        }
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-ink-muted">X Position</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editValues.x || 0}
                        onChange={(e) =>
                          setEditValues({ ...editValues, x: parseFloat(e.target.value) })
                        }
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-ink-muted">Y Position</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editValues.y || 0}
                        onChange={(e) =>
                          setEditValues({ ...editValues, y: parseFloat(e.target.value) })
                        }
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={saveEditing}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-accent text-ink text-xs rounded hover:bg-accent-hover transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-surface-hover text-ink-secondary text-xs rounded hover:bg-surface-elevated transition-colors"
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
                      <div className="font-medium text-sm text-ink">
                        {section.name || `Section ${index + 1}`}
                      </div>
                      <div className="text-xs text-ink-muted mt-0.5">
                        {section.width}' × {section.height}'
                      </div>
                      <div className="text-xs text-ink-faint mt-0.5">
                        Position: ({section.x}, {section.y})
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditing(section)}
                        className="p-1 hover:bg-surface-hover rounded transition-colors"
                        title="Edit Section"
                      >
                        <Edit2 className="w-3 h-3 text-ink-secondary" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${section.name || 'this section'}?`)) {
                            onDeleteSection(section.id);
                          }
                        }}
                        className="p-1 hover:bg-danger/15 rounded transition-colors"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3 h-3 text-danger" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-ink-muted px-1">
        {sections.length} section{sections.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default SectionManager;
