# Mental Health Logbook

A comprehensive web application for mental health journaling and therapeutic self-reflection, based on structured exercises for managing loneliness and emotional well-being.

## 🌟 Features

### ✅ Fully Implemented
- **Authentication System**: Secure registration/login with NextAuth.js
- **Daily Check-In**: Track mood (1-10), feelings, needs, and emotional states
- **FFN Communication Log**: Document conversations using Fact-Feeling-Need framework
- **Weekly Connection Tracker**: 3-action goal system for social connections
- **Boundary Check-In**: Decision framework with smart recommendations

### 🚧 Coming Soon
- Meaning & Belonging Journal
- Joy Activity Tracker
- Safety Net (crisis support & contacts)
- Statistics & Analytics Dashboard
- Therapist View with Privacy Controls

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone or navigate to the project
cd mental-logbook

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Visit `http://localhost:3000` to get started!

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Backend**: Next.js API Routes
- **Database**: SQLite (dev), PostgreSQL-ready (production)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5
- **Forms**: React Hook Form + Zod validation
- **Date Handling**: date-fns

## 📁 Project Structure

```
mental-logbook/
├── prisma/
│   ├── schema.prisma          # Database models (13 tables)
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── (auth)/           # Auth pages (login, register)
│   │   ├── (dashboard)/      # Protected app pages
│   │   │   ├── dashboard/    # Main dashboard
│   │   │   ├── journal/      # Journal modules
│   │   │   ├── stats/        # Analytics
│   │   │   ├── safety/       # Safety net
│   │   │   └── settings/     # User settings
│   │   └── api/              # API endpoints
│   ├── components/
│   │   └── ui/               # Reusable UI components
│   ├── lib/
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── prisma.ts         # Database client
│   │   └── validations/      # Zod schemas
│   └── types/                # TypeScript types
└── package.json
```

## 🎯 Core Journal Features

### 1. Daily Check-In
- Mood slider (1-10 scale)
- Emotional needs tracking (6 types + custom)
- Feelings and needs description
- Auto-loads today's entry for updates
- Streak tracking (coming soon)

### 2. FFN Communication Log
- **Fact**: What happened
- **Feeling**: How it made you feel
- **Need**: What you need
- Contact autocomplete from history
- Success rating (successful/difficult/neutral)
- After-mood tracking
- Searchable history with filters

### 3. Weekly Connection Tracker
- 3-action goal system:
  - Safe Contact (trusted friend/family)
  - New Context (group, class, event)
  - Vulnerability Step (share something personal)
- Before/after mood tracking
- "Would repeat?" selector
- Progress visualization
- Weekly completion celebration

### 4. Boundary Check-In
- Three-question framework:
  - Do I want this?
  - Does it feel mutual?
  - Will this nourish or drain me?
- Smart recommendations based on answers
- Decision tracking (Yes/No/Postpone)
- Pattern recognition (drain vs nourish insights)
- Reflection field for follow-up

## 📊 Database Schema

13 models covering all mental health tracking needs:
- User & Therapist (authentication)
- DailyCheckIn & EmotionalNeed
- FFNLog (communications)
- WeeklyTracker & ConnectionAction
- BoundaryCheckIn
- MeaningGoal & MeaningReflection
- JoyActivity
- SafeContact, CrisisAction, CrisisLog
- TherapistAccessLog

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based sessions
- Protected API routes
- User-owned data (strict user ID filtering)
- Role-based access control (patient/therapist)

## 🎨 UI/UX Features

- Mobile-responsive design (mobile-first)
- Clean, calming aesthetic
- Form validation with helpful error messages
- Loading states and optimistic updates
- Success notifications
- Pattern insights and smart recommendations

## 📝 Development

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate   # Create/apply migrations
```

### Adding New Features

1. Define database model in `prisma/schema.prisma`
2. Create validation schema in `src/lib/validations/`
3. Build API endpoints in `src/app/api/`
4. Create UI components in `src/components/`
5. Build page in `src/app/(dashboard)/`

## 🗺️ Roadmap

### Phase 1: Foundation ✅ (Complete)
- Project setup
- Database schema
- Authentication system

### Phase 2: Core Features ✅ (60% Complete)
- [x] Daily Check-In
- [x] FFN Log
- [x] Weekly Tracker
- [x] Boundary Check-In
- [ ] Meaning & Belonging
- [ ] Joy Activity
- [ ] Safety Net

### Phase 3: Analytics (In Progress)
- Mood timeline charts
- Connection metrics
- Streak tracking
- Pattern recognition
- Exportable reports

### Phase 4: Therapist Features (Planned)
- Therapist login (6-digit passcode)
- Read-only view of patient data
- Privacy controls
- Access logging
- Flagged entries

### Phase 5: Advanced Features (Planned)
- PWA (offline mode)
- Push notifications
- Photo/voice journaling
- Calendar integration
- Health app integration

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

## 📄 License

Private project - All rights reserved

## 🆘 Support

For mental health crisis support:
- **US**: National Suicide Prevention Lifeline: 988
- **US**: Crisis Text Line: Text HOME to 741741
- **International**: https://findahelpline.com

---

**Built with ❤️ for mental health and well-being**

*Last Updated: October 2, 2025*
