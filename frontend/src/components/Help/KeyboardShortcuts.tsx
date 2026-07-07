import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Z } from '../../constants/layers';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'General',
      items: [
        { keys: ['Esc'], description: 'Deselect current item' },
        { keys: ['G'], description: 'Toggle grid display' },
        { keys: ['?'], description: 'Show this help dialog' },
      ],
    },
    {
      category: 'Edit',
      items: [
        { keys: ['Ctrl/⌘', 'Z'], description: 'Undo last action' },
        { keys: ['Ctrl/⌘', 'Shift', 'Z'], description: 'Redo action' },
        { keys: ['Ctrl/⌘', 'Y'], description: 'Redo action (alternate)' },
        { keys: ['Ctrl/⌘', 'D'], description: 'Duplicate selected item' },
        { keys: ['Delete'], description: 'Delete selected item' },
        { keys: ['Backspace'], description: 'Delete selected item (alternate)' },
      ],
    },
    {
      category: 'Lighting',
      items: [
        { keys: ['Drag ring'], description: 'Aim a selected light on the canvas' },
        { keys: ['Shift', 'Drag'], description: 'Snap aim to 15° increments' },
      ],
    },
    {
      category: 'View',
      items: [
        { keys: ['+', '='], description: 'Zoom in' },
        { keys: ['-'], description: 'Zoom out' },
        { keys: ['0'], description: 'Reset zoom to 100%' },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="dialog-backdrop-enter fixed inset-0 bg-black/60 backdrop-blur-sm"
        style={{ zIndex: Z.MODAL }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="dialog-panel-enter fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-raised border border-line-medium rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        style={{ zIndex: Z.MODAL_PANEL }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-line-subtle flex items-center justify-between bg-gradient-to-r from-accent/10 to-accent/5">
          <div className="flex items-center gap-3">
            <LucideIcons.Keyboard className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold text-ink">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors text-ink-secondary"
          >
            <LucideIcons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(80vh-80px)] scrollbar-matte">
          <div className="space-y-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wider mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      <span className="text-sm text-ink-secondary">{item.description}</span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            {keyIndex > 0 && (
                              <span className="text-ink-faint text-xs mx-1">+</span>
                            )}
                            <kbd className="px-2 py-1 text-xs font-semibold text-ink bg-surface-overlay border border-line-medium rounded shadow-sm min-w-[2rem] text-center">
                              {key}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-accent/10 border border-accent/30 rounded-lg">
            <div className="flex items-start gap-3">
              <LucideIcons.Lightbulb className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-ink mb-1">Pro Tips</h4>
                <ul className="text-xs text-ink-secondary space-y-1">
                  <li>• Use Ctrl/⌘ + D to quickly duplicate lights and furniture</li>
                  <li>• Press G to toggle grid for precise positioning</li>
                  <li>• Drag section labels to move entire room sections</li>
                  <li>• Select a light and drag its ring to aim the beam</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default KeyboardShortcuts;
