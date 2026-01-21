import express, { Response } from 'express';
import Design from '../models/Design';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all designs for current user
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const designs = await Design.find({ userId: req.userId }).sort({ lastModified: -1 });
    res.json(designs);
  } catch (error) {
    console.error('Get designs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific design
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const design = await Design.findOne({ _id: req.params.id, userId: req.userId });

    if (!design) {
      res.status(404).json({ message: 'Design not found' });
      return;
    }

    res.json(design);
  } catch (error) {
    console.error('Get design error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new design
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const design = await Design.create({
      userId: req.userId,
      name: req.body.name || 'Untitled Design',
      roomDimensions: req.body.roomDimensions || { width: 15, height: 12 },
      furniture: req.body.furniture || [],
      wallObjects: req.body.wallObjects || [],
      doors: req.body.doors || [],
      windows: req.body.windows || [],
    });

    res.status(201).json(design);
  } catch (error) {
    console.error('Create design error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update design
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const design = await Design.findOne({ _id: req.params.id, userId: req.userId });

    if (!design) {
      res.status(404).json({ message: 'Design not found' });
      return;
    }

    // Update fields
    if (req.body.name !== undefined) design.name = req.body.name;
    if (req.body.roomDimensions !== undefined) design.roomDimensions = req.body.roomDimensions;
    if (req.body.furniture !== undefined) design.furniture = req.body.furniture;
    if (req.body.wallObjects !== undefined) design.wallObjects = req.body.wallObjects;
    if (req.body.doors !== undefined) design.doors = req.body.doors;
    if (req.body.windows !== undefined) design.windows = req.body.windows;
    if (req.body.thumbnail !== undefined) design.thumbnail = req.body.thumbnail;

    design.lastModified = new Date();
    await design.save();

    res.json(design);
  } catch (error) {
    console.error('Update design error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete design
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const design = await Design.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!design) {
      res.status(404).json({ message: 'Design not found' });
      return;
    }

    res.json({ message: 'Design deleted successfully' });
  } catch (error) {
    console.error('Delete design error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
