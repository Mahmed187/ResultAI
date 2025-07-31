# MediBuddy - Modern Healthcare Dashboard

A comprehensive healthcare management platform built with Next.js 15, featuring a modern medical interface for managing patients, consultations, appointments, and lab results.

## 🚀 Features

### 🏥 Healthcare Management
- **Patient Management** - Comprehensive patient records and information
- **Consultation System** - Medical session tracking and notes
- **Appointment Scheduling** - Calendar management for patient visits
- **Lab Results** - Test results display and management
- **Messages/Chat** - Internal communication system

### 🎨 Modern UI/UX
- **Responsive Design** - Works seamlessly on all devices
- **Dark/Light Theme** - Customizable appearance
- **Professional Interface** - Clean, medical-focused design
- **Sidebar Navigation** - Collapsible, intuitive navigation
- **Interactive Components** - Smooth animations and transitions

### ⚡ Performance & Technology
- **Next.js 15** - Latest React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Query** - Efficient data management
- **Radix UI** - Accessible component library

## 🛠 Tech Stack

- **Framework:** Next.js 15.3.3
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Tabler Icons + Lucide React
- **State Management:** React Query (TanStack Query)
- **Component Library:** Radix UI
- **Theme:** Custom design system with CSS variables

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mahmed187/medibuddy.git
   cd medibuddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📱 Pages & Features

### 🏠 Dashboard Home
- Medical overview with interactive statistics
- Automated slider with healthcare information
- Test results summary cards

### 👥 Patient Management
- Patient list with search and filtering
- Individual patient profiles
- Medical history tracking
- Treatment progress monitoring

### 🩺 Consultation System
- New consultation creation
- Medical notes management
- Session history tracking
- Voice-to-text capabilities (planned)

### 📅 Appointment Calendar
- Daily, weekly, monthly views
- Appointment scheduling
- Status tracking (confirmed, pending, urgent)
- Patient appointment history

### 🧪 Lab Results
- Test result display
- Medical report viewing
- Historical lab data
- Integration with medical devices (planned)

### 💬 Messages/Chat
- Internal communication
- Patient messaging
- Notification system
- Real-time updates (planned)

### ⚙️ Settings
- Profile management
- Appearance customization
- Notification preferences
- System configuration

## 🎨 Design System

### Color Palette
- **Primary:** Medical blue theme
- **Secondary:** Professional grays
- **Accent:** Status indicators (green, yellow, red)
- **Theme Support:** Light and dark mode variants

### Typography
- **Font:** Inter (Google Fonts)
- **Hierarchy:** Consistent heading scales
- **Readability:** Optimized for medical interfaces

### Components
- **Buttons:** Multiple variants with proper states
- **Cards:** Consistent elevation and spacing
- **Forms:** Accessible input components
- **Navigation:** Intuitive sidebar and breadcrumbs

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_APP_NAME=MediBuddy
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Tailwind Configuration
The project uses a custom Tailwind configuration with:
- Medical-focused color palette
- Responsive breakpoints
- Custom animations
- Component variants

## 📱 Responsive Design

- **Desktop:** Full sidebar with expanded navigation
- **Tablet:** Collapsible sidebar with icons
- **Mobile:** Drawer navigation with touch gestures

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Run E2E tests (when implemented)
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Deploy automatically on push to main branch

### Other Platforms
```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Mahmed187**
- GitHub: [@Mahmed187](https://github.com/Mahmed187)
- Repository: [medibuddy](https://github.com/Mahmed187/medibuddy)

## 🔮 Roadmap

- [ ] Real-time chat functionality
- [ ] Voice-to-text for consultations
- [ ] Medical device integrations
- [ ] Advanced analytics dashboard
- [ ] Mobile app companion
- [ ] AI-powered diagnostics support
- [ ] Electronic health records (EHR) integration
- [ ] Telemedicine capabilities

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**MediBuddy** - Revolutionizing healthcare management with modern technology 🏥

## 🚀 Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **Routing**: React Router v6
- **State Management**: Zustand + TanStack Query
- **Styling**: Tailwind CSS 3
- **UI Components**: Radix UI + Custom Components
- **Icons**: Tabler Icons + Lucide React

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (shadcn/ui)
│   │   └── layout/         # Layout components
│   ├── features/           # Feature-based modules
│   │   ├── auth/           # Authentication
│   │   ├── patients/       # Patient management
│   │   ├── settings/       # Settings pages
│   │   └── errors/         # Error pages
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── stores/             # Zustand stores
│   ├── utils/              # Utility functions
│   ├── lib/                # Library configurations
│   ├── context/            # React contexts
│   ├── assets/             # Static assets
│   └── main.tsx            # Application entry point with routing
├── public/                 # Public assets
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── package.json            # Dependencies and scripts
```

## 🔧 Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Available Scripts

- `npm run dev` - Start development server (localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - TypeScript type checking

## 🗺️ Routing

The application uses React Router v6 with centralized route configuration in `main.tsx`:

- `/auth/*` - Authentication routes (sign-in, sign-up, etc.)
- `/dashboard` - Main dashboard
- `/patients` - Patient management
- `/consultation` - Medical consultation
- `/calendar` - Appointments calendar
- `/results` - Lab results
- `/settings/*` - Settings with sub-routes
- `/apps` - Applications
- `/about` - About page

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **CSS Custom Properties** for theming
- **Radix UI** for accessible component primitives
- **Shadcn/ui** component system

## 🔌 API Integration

The frontend connects to a Python FastAPI backend running on `localhost:8000`. API calls are handled through:

- **Axios** for HTTP requests
- **TanStack Query** for data fetching and caching
- **Zustand** for global state management

## 🏗️ Build & Deployment

The project builds to a static site that can be deployed to any web server:

```bash
npm run build
# Output will be in the 'dist' folder
```

## 🧩 Key Features

- ✅ **Modern React Setup** - React 18 + TypeScript + Vite
- ✅ **Clean Architecture** - Feature-based organization
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Modern Routing** - React Router v6 with centralized config
- ✅ **State Management** - Zustand + TanStack Query
- ✅ **UI Components** - Radix UI + Tailwind CSS
- ✅ **Development Tools** - ESLint, Prettier, TypeScript
- ✅ **Production Ready** - Optimized builds with code splitting

## 🚫 What's NOT Included

- ❌ Next.js (removed in favor of Vite)
- ❌ TanStack Router (replaced with React Router)
- ❌ Server-side rendering
- ❌ API routes (handled by separate backend)

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Follow the established naming conventions
4. Run linting and type checking before commits

## 📝 License

This project is part of the MediBuddy medical practice management system.

## Author

Crafted with 🤍 by [@satnaing](https://github.com/satnaing)

## License

Licensed under the [MIT License](https://choosealicense.com/licenses/mit/)