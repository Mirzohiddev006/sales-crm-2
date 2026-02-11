# 365 Magazine Sales Dashboard

Modern React dashboard for 365 Magazine sales management system with glassmorphism dark theme.

## 🎨 Features

- **Dashboard** - Monthly plan progress with circular indicators
- **Clients Management** - Full client database with orders & reservations
- **Reservations** - Book reservation tracking
- **Conversations** - Chat history viewer
- **PDF Channels** - Telegram PDF channel link management

## 🚀 Tech Stack

- **React 18** + TypeScript
- **Vite** - Fast build tool
- **React Router DOM** - Client-side routing
- **Axios** - API requests
- **React Hook Form** + Zod - Form validation
- **Tailwind CSS** - Utility-first styling
- **ShadCN UI** - UI components
- **Sonner** - Toast notifications
- **Lucide React** - Icons

## 📦 Installation

```bash
npm install
```

## 🔧 Development

```bash
npm run dev
```

Server runs at `http://localhost:5173`

## 🏗️ Build

```bash
npm run build
```

## 🌐 API Configuration

Update API base URL in `src/lib/api.ts`:

```typescript
const VITE_API_BASE_URL = "https://your-api-url.com"
```

Or use environment variable:

```bash
VITE_API_BASE_URL=https://your-api-url.com npm run dev
```

## 🔐 Default Credentials

```
Username: admin
Password: admin
```

## 📂 Project Structure

```
src/
├── components/
│   ├── auth/           # Protected routes
│   ├── common/         # Reusable components
│   ├── layout/         # Layout components
│   └── ui/             # ShadCN UI components
├── lib/                # Utilities & API config
├── pages/              # Page components
│   ├── clients/        # Client management
│   ├── pdfchannels/    # PDF channels
│   ├── DashboardPage.tsx
│   ├── ReservationsPage.tsx
│   ├── ConversationsPage.tsx
│   └── LoginPage.tsx
├── services/           # API services
├── types/              # TypeScript types
├── App.tsx
└── main.tsx
```

## 🎯 Key Features

### Dashboard
- Real-time today's statistics
- Monthly plan tracking with progress circles
- PDF vs Book sales breakdown
- Visual progress indicators

### Clients
- Full client list with pagination
- Detailed client view with orders history
- Reservations & follow-ups tracking
- Feedback management

### PDF Channels
- Telegram channel link management
- Active/Inactive status toggle
- Monthly channel organization

### Conversations
- Chat history viewer
- Client conversation files
- Interactive chat interface

## 🎨 Design System

- **Dark Theme**: #020817 base
- **Glassmorphism**: backdrop-blur effects
- **Smooth Animations**: 300ms transitions
- **Responsive**: Mobile-first approach
- **Color Palette**:
  - Primary: `hsl(217 91% 60%)`
  - Background: `hsl(217 91% 6%)`
  - Card: `hsl(217 91% 8%)` with 95% opacity

## 📱 Responsive Design

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔒 Authentication

- JWT token-based auth
- Auto token refresh
- Protected routes
- Role-based access (admin)

## 📝 License

Private - 365 Magazine Internal Use Only

---

**Powered by [Cognilabs](https://www.cognilabs.org/uz)**

© 2026 365 Magazine System
