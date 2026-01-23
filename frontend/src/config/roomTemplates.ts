import type { RoomSection } from '../types';

export interface RoomTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: Omit<RoomSection, 'id'>[]; // Templates don't have IDs yet
}

export const ROOM_TEMPLATES: RoomTemplate[] = [
  // ===== SIMPLE ROOM =====
  {
    id: 'simple',
    name: 'Simple Room',
    description: 'Single rectangular room',
    icon: 'Square',
    sections: [
      {
        name: 'Main Room',
        x: 0,
        y: 0,
        width: 20,
        height: 15,
      },
    ],
  },

  // ===== L-SHAPED ROOMS =====
  {
    id: 'l-small',
    name: 'Small L-Shape',
    description: 'Compact L-shaped layout (10×10 + 8×6)',
    icon: 'LSquare',
    sections: [
      {
        name: 'Main Area',
        x: 0,
        y: 0,
        width: 10,
        height: 10,
      },
      {
        name: 'Extension',
        x: 10,
        y: 0,
        width: 8,
        height: 6,
      },
    ],
  },
  {
    id: 'l-medium',
    name: 'Medium L-Shape',
    description: 'Standard L-shaped layout (15×12 + 10×8)',
    icon: 'LSquare',
    sections: [
      {
        name: 'Living Area',
        x: 0,
        y: 0,
        width: 15,
        height: 12,
      },
      {
        name: 'Dining Area',
        x: 15,
        y: 0,
        width: 10,
        height: 8,
      },
    ],
  },
  {
    id: 'l-large',
    name: 'Large L-Shape',
    description: 'Spacious L-shaped layout (20×15 + 12×10)',
    icon: 'LSquare',
    sections: [
      {
        name: 'Main Living Space',
        x: 0,
        y: 0,
        width: 20,
        height: 15,
      },
      {
        name: 'Kitchen Nook',
        x: 20,
        y: 0,
        width: 12,
        height: 10,
      },
    ],
  },

  // ===== T-SHAPED ROOMS =====
  {
    id: 't-small',
    name: 'Small T-Shape',
    description: 'Compact T-shaped layout',
    icon: 'TSquare',
    sections: [
      {
        name: 'Main Room',
        x: 0,
        y: 8,
        width: 18,
        height: 12,
      },
      {
        name: 'Top Wing',
        x: 6,
        y: 0,
        width: 6,
        height: 8,
      },
    ],
  },
  {
    id: 't-medium',
    name: 'Medium T-Shape',
    description: 'Standard T-shaped layout',
    icon: 'TSquare',
    sections: [
      {
        name: 'Main Area',
        x: 0,
        y: 10,
        width: 24,
        height: 15,
      },
      {
        name: 'Entry Hall',
        x: 8,
        y: 0,
        width: 8,
        height: 10,
      },
    ],
  },
  {
    id: 't-large',
    name: 'Large T-Shape',
    description: 'Spacious T-shaped layout with bedroom wing',
    icon: 'TSquare',
    sections: [
      {
        name: 'Living Space',
        x: 0,
        y: 12,
        width: 30,
        height: 18,
      },
      {
        name: 'Bedroom Wing',
        x: 10,
        y: 0,
        width: 10,
        height: 12,
      },
    ],
  },

  // ===== U-SHAPED ROOMS =====
  {
    id: 'u-small',
    name: 'Small U-Shape',
    description: 'Compact U-shaped layout',
    icon: 'USquare',
    sections: [
      {
        name: 'Central Area',
        x: 8,
        y: 0,
        width: 12,
        height: 15,
      },
      {
        name: 'Left Wing',
        x: 0,
        y: 0,
        width: 8,
        height: 10,
      },
      {
        name: 'Right Wing',
        x: 20,
        y: 0,
        width: 8,
        height: 10,
      },
    ],
  },
  {
    id: 'u-medium',
    name: 'Medium U-Shape',
    description: 'Standard U-shaped layout',
    icon: 'USquare',
    sections: [
      {
        name: 'Main Room',
        x: 10,
        y: 0,
        width: 15,
        height: 18,
      },
      {
        name: 'Left Bedroom',
        x: 0,
        y: 0,
        width: 10,
        height: 12,
      },
      {
        name: 'Right Bedroom',
        x: 25,
        y: 0,
        width: 10,
        height: 12,
      },
    ],
  },
  {
    id: 'u-large',
    name: 'Large U-Shape',
    description: 'Spacious U-shaped layout with office wings',
    icon: 'USquare',
    sections: [
      {
        name: 'Central Living',
        x: 12,
        y: 0,
        width: 20,
        height: 22,
      },
      {
        name: 'Left Office',
        x: 0,
        y: 0,
        width: 12,
        height: 15,
      },
      {
        name: 'Right Office',
        x: 32,
        y: 0,
        width: 12,
        height: 15,
      },
    ],
  },

  // ===== CUSTOM =====
  {
    id: 'custom',
    name: 'Custom Layout',
    description: 'Start from scratch and add sections manually',
    icon: 'PenTool',
    sections: [
      {
        name: 'Section 1',
        x: 0,
        y: 0,
        width: 15,
        height: 15,
      },
    ],
  },
];

// Helper function to generate unique IDs for sections
export function instantiateTemplate(template: RoomTemplate): RoomSection[] {
  return template.sections.map((section, index) => ({
    ...section,
    id: `section-${Date.now()}-${index}`,
  }));
}

// Helper to get template by ID
export function getTemplateById(id: string): RoomTemplate | undefined {
  return ROOM_TEMPLATES.find(t => t.id === id);
}

// Calculate bounding box for a set of sections
export function calculateBounds(sections: RoomSection[]): { width: number; height: number } {
  if (sections.length === 0) {
    return { width: 20, height: 15 }; // Default
  }

  const maxX = Math.max(...sections.map(s => s.x + s.width));
  const maxY = Math.max(...sections.map(s => s.y + s.height));

  return { width: maxX, height: maxY };
}
