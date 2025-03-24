# Task Manager

A modern, responsive task management application built with React, Redux, and Vite. Features include offline support, drag-and-drop functionality, and multiple view options.

## 🌟 Features

- **Multiple View Options**
  - Kanban board view with drag-and-drop
  - List view for simple task listing
  - Table view for structured data display
  - Grid view for visual task organization

- **Task Management**
  - Create, read, update, and delete tasks
  - Inline editing for task details
  - Due date tracking
  - Priority levels
  - Status management (To Do, In Progress, Done)

- **Offline Capabilities**
  - Progressive Web App (PWA) support
  - Offline task creation and editing
  - Automatic sync when back online
  - Local storage for offline data

- **User Experience**
  - Responsive design for all devices
  - Dark/Light mode support
  - Drag-and-drop interface
  - Real-time updates
  - Search and filter functionality
  - Sort tasks by various criteria

## 🚀 Tech Stack

- **Frontend Framework**: React 19
- **State Management**: Redux Toolkit
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Form Handling**: React Hook Form
- **Drag and Drop**: React DnD
- **Icons**: React Icons
- **Data Persistence**: IndexedDB
- **HTTP Client**: Axios
- **Utility Library**: Lodash

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/task-manager.git
   cd task-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Preview production build:
   ```bash
   npm run preview
   ```

## 🔧 Development

The project uses the following development tools:

- ESLint for code linting
- Prettier for code formatting
- Vite for fast development and building
- PostCSS for CSS processing
- TailwindCSS for utility-first CSS

### Development Commands

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## 📱 PWA Features

The application is built as a Progressive Web App with the following features:

- Offline support
- Installable on devices
- Push notifications (coming soon)
- Background sync
- Responsive design

## 🎨 UI Components

- **TaskCard**: Displays individual task information
- **TaskList**: Manages task display and organization
- **TaskForm**: Handles task creation and editing
- **ViewSwitcher**: Toggles between different view modes
- **SearchBar**: Filters tasks based on search criteria
- **StatusIndicator**: Shows task status with color coding

## 🔄 State Management

The application uses Redux Toolkit for state management:

- Tasks slice for task-related state
- UI slice for interface state
- Async thunks for API operations
- Local storage persistence

## 📦 Project Structure

```
task-manager/
├── public/
│   ├── manifest.json
│   ├── service-worker.js
│   └── icons/
├── src/
│   ├── components/
│   ├── pages/
│   ├── store/
│   ├── hooks/
│   ├── utils/
│   └── App.jsx
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## 🌐 API Integration

The application integrates with a RESTful API for task management:

- GET /api/tasks: Fetch all tasks
- POST /api/tasks: Create new task
- PUT /api/tasks/:id: Update task
- DELETE /api/tasks/:id: Delete task

## 🔒 Security

- Environment variables for sensitive data
- Input validation
- XSS protection
- CORS configuration

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the fast build tool
- TailwindCSS team for the utility-first CSS framework
- All contributors and maintainers of the used libraries

## 📞 Support

For support, email support@example.com or open an issue in the repository.

## 🔄 Updates

- Check the CHANGELOG.md for version history
- Follow the repository for updates
- Star the repository if you find it useful

---

Made with ❤️ by [Your Name]
