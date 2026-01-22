# Room & Wall Planner

A professional web application for designing room layouts in 2D top-down view and planning wall art arrangements in 2D elevation view. Built with React, TypeScript, Node.js, Express, and MongoDB.

## Features

- **Room Planning (Top-Down View)**
  - Customizable room dimensions
  - 20 pixels per foot scale with grid overlay
  - 16 furniture types (beds, seating, tables, storage, decor)
  - Drag-and-drop furniture placement
  - Rotate furniture in 90-degree increments
  - Customizable furniture dimensions and colors
  - Doors and windows on any wall

- **Wall Planning (Elevation View)**
  - Switch between four walls (North, South, East, West)
  - Wall objects (picture frames, mirrors, shelves, clocks, TV)
  - Image upload for wall objects
  - Drag-and-drop wall object placement

- **User Management**
  - User registration and authentication
  - Persistent storage with MongoDB
  - Multiple designs per user
  - Auto-save functionality (2-second debounce)

- **Design Management**
  - Create, read, update, delete designs
  - Design list with quick switching
  - Real-time save status indicator

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Axios for API calls
- HTML Canvas API for rendering

**Backend:**
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT authentication (httpOnly cookies)
- bcrypt for password hashing
- Rate limiting

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd RoomDesigner
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file (or copy from .env.example)
cp .env.example .env

# Edit .env with your configuration
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/room-planner
# JWT_SECRET=your-secret-key-change-in-production
# NODE_ENV=development
# FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (update MONGODB_URI in backend/.env)
```

## Running the Application

### Development Mode

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Usage

1. **Register an Account**
   - Open `http://localhost:5173` in your browser
   - Click "Register" and create an account
   - You'll be automatically logged in

2. **Create a Room Design**
   - A new design is automatically created when you first log in
   - Set room dimensions using the inputs in the top bar
   - Click furniture items in the left sidebar to add them to your room
   - Drag furniture to reposition
   - Click furniture to select and edit properties in the right sidebar
   - Add doors and windows from the "Add Elements" section

3. **Design Walls**
   - Click the "Wall" button in the left sidebar
   - Select which wall to design (North, South, East, West)
   - Add wall objects (frames, mirrors, shelves, etc.)
   - Upload images to picture frames
   - Drag objects to position them on the wall

4. **Manage Designs**
   - Create multiple designs using the "+ New" button
   - Switch between designs in the "My Designs" section
   - Changes are auto-saved after 2 seconds
   - Watch the save status in the top bar

## Project Structure

```
RoomDesigner/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/           # Login and Register
│   │   │   ├── Canvas/         # RoomCanvas and WallCanvas
│   │   │   ├── Sidebar/        # LeftSidebar and PropertiesPanel
│   │   │   └── Layout/         # MainLayout
│   │   ├── context/            # AuthContext
│   │   ├── services/           # API service
│   │   ├── types/              # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── models/             # User and Design models
│   │   ├── routes/             # Auth and Design routes
│   │   ├── middleware/         # Authentication middleware
│   │   ├── config/             # Database configuration
│   │   └── server.ts
│   ├── .env
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login (returns JWT in httpOnly cookie)
- `POST /api/auth/logout` - Logout (clears cookie)
- `GET /api/auth/me` - Get current user info

### Designs
- `GET /api/designs` - Get all designs for current user
- `GET /api/designs/:id` - Get specific design
- `POST /api/designs` - Create new design
- `PUT /api/designs/:id` - Update design (auto-save)
- `DELETE /api/designs/:id` - Delete design

## Keyboard Shortcuts

- Click item to select
- Drag to move
- Click canvas background to deselect

## Troubleshooting

**MongoDB Connection Error:**
- Make sure MongoDB is running
- Check MONGODB_URI in backend/.env
- Verify MongoDB is accessible on the specified port

**CORS Errors:**
- Verify FRONTEND_URL in backend/.env matches your frontend URL
- Make sure both frontend and backend are running

**Authentication Issues:**
- Clear browser cookies
- Make sure JWT_SECRET is set in backend/.env
- Check that cookies are enabled in your browser

## Future Enhancements (Not in MVP)

- Undo/Redo functionality
- Design sharing with other users
- Export to PNG/PDF
- Design templates
- 3D view preview
- Collaborative editing
- Dark mode
- Mobile responsive design

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
