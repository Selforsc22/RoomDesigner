import React from 'react';
import * as LucideIcons from 'lucide-react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isOpen, onClose }) => {
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
      <style>{styles}</style>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Dialog */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <LucideIcons.Keyboard className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-gray-900">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <LucideIcons.X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="space-y-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span className="text-sm text-gray-700">{item.description}</span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            {keyIndex > 0 && (
                              <span className="text-gray-400 text-xs mx-1">+</span>
                            )}
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded shadow-sm min-w-[2rem] text-center">
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
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <LucideIcons.Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Pro Tips</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Use Ctrl/⌘ + D to quickly duplicate lights and furniture</li>
                  <li>• Press G to toggle grid for precise positioning</li>
                  <li>• Drag section labels to move entire room sections</li>
                  <li>• Hover over lights to see their coverage area</li>
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
