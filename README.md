# ResumeRank AI

AI-powered recruitment platform that intelligently ranks and analyzes candidate resumes to streamline your hiring process.

## 🌟 Overview

ResumeRank AI is a modern recruitment platform that leverages Google's Gemini AI to automatically analyze resumes, extract key information, and provide intelligent matching scores against job requirements. The platform helps HR teams and recruiters make data-driven hiring decisions efficiently.

## ✨ Key Features

### For Recruiters
- **AI-Powered Resume Analysis** - Automatic extraction of skills, experience, and qualifications using Google Gemini AI
- **Intelligent Ranking** - Smart scoring system (0-100) that matches candidates against job requirements
- **Job Management** - Create, edit, and manage job postings with detailed requirements
- **Advanced Filtering** - Search, filter, and sort candidates by score, skills, location, and more
- **Bulk Operations** - Handle multiple candidates simultaneously (analyze, tag, delete)
- **Real-time Updates** - Live candidate list updates using Supabase real-time subscriptions
- **Tagging System** - Organize candidates with custom tags for better workflow management
- **Re-analysis Feature** - Re-evaluate candidates with updated job requirements

### For Candidates
- **Easy Application** - Simple public application form with resume upload
- **Multiple Formats** - Support for PDF and DOCX resume formats
- **Instant Feedback** - Get analyzed immediately upon submission

### Admin Features
- **User Management** - Manage user accounts, roles, and permissions
- **Credit System** - Quota-based AI analysis with configurable limits
- **Activity Monitoring** - Track system usage and user activities
- **Job Oversight** - View and manage all jobs across the platform

### UI/UX
- **Fully Responsive** - Optimized for all devices (iPhone SE to Desktop 1920px+)
- **Modern Design** - Clean, gradient-based UI with smooth animations
- **Dark Mode Support** - Comfortable viewing in any lighting condition
- **Accessible** - WCAG 2.1 AA compliant with proper contrast ratios

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript 5** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality React components built on Radix UI
- **Sonner** - Beautiful toast notifications
- **date-fns** - Date formatting and manipulation

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Storage for resume files
  - Row Level Security (RLS)

### AI & Analytics
- **Google Gemini 2.0 Flash** - AI-powered resume analysis
- **Structured Output** - Type-safe AI responses

### Development Tools
- **ESLint** - Code linting
- **Prettier** (recommended) - Code formatting
- **Git** - Version control

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm**
- **Supabase Account** - For database and auth
- **Google Cloud Account** - For Gemini AI API access

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/tanakrititn/resumerank-ai.git
cd resumerank-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

1. Create a new Supabase project at https://supabase.com
2. Run the database migrations (SQL scripts should be in `/supabase/migrations`)
3. Set up the following tables:
   - `profiles` - User profiles and credits
   - `jobs` - Job postings
   - `candidates` - Candidate applications
   - `candidate_tags` - Tags for candidates
   - `audit_logs` - Activity tracking

### 5. Storage Setup

Create storage buckets in Supabase:
- `resumes` - For storing uploaded resume files

Configure storage policies for public read access and authenticated write access.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
resumerank-ai/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Authentication pages
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── (dashboard)/         # Protected dashboard routes
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   └── jobs/            # Job management
│   │   ├── admin/               # Admin panel
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   └── jobs/
│   │   ├── api/                 # API routes
│   │   │   ├── analyze-resume/
│   │   │   ├── re-analyze/
│   │   │   ├── apply/
│   │   │   └── admin/
│   │   ├── apply/               # Public application pages
│   │   └── page.tsx             # Landing page
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── jobs/                # Job-related components
│   │   └── candidates/          # Candidate components
│   ├── lib/                     # Utility functions
│   │   ├── actions/             # Server actions
│   │   ├── supabase/            # Supabase clients
│   │   └── utils.ts             # Helper functions
│   └── types/                   # TypeScript type definitions
├── public/                      # Static assets
├── supabase/                    # Supabase migrations
├── .env.local                   # Environment variables
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
```

## 🔑 Key Features in Detail

### 1. AI Resume Analysis

The system uses Google Gemini 2.0 Flash to:
- Extract candidate information (name, email, phone, location)
- Identify skills and technologies
- Analyze work experience and education
- Calculate matching score against job requirements
- Provide detailed analysis and recommendations

### 2. Job Management with Search & Filter

- **Search**: Full-text search across title, description, location, and requirements
- **Filters**: Status (Open/Paused/Closed), Location, Sort options
- **Pagination**: Configurable items per page (6, 12, 24, 48)
- **Status Management**: OPEN, PAUSED, CLOSED states
- **Candidate Tracking**: Real-time count of applicants per job

### 3. Candidate Management

- **Bulk Analysis**: Analyze multiple candidates simultaneously
- **Tagging System**: Custom tags for workflow organization
- **Filtering**: By score range, tags, analysis status
- **Sorting**: By score, name, application date
- **Real-time Updates**: Live list updates via Supabase subscriptions

### 4. Credit System

- Users receive monthly AI analysis credits
- Admin can adjust quotas per user
- Reset credits manually or automatically
- Track credit usage and history

### 5. Security Features

- Row Level Security (RLS) on all tables
- Authenticated routes protection
- Admin role validation
- Secure file storage with access policies
- SQL injection prevention
- XSS protection

## 🌐 API Routes

### Public Routes
- `POST /api/apply` - Submit job application

### Protected Routes
- `POST /api/analyze-resume` - Analyze single resume
- `POST /api/re-analyze` - Re-analyze candidates
- `POST /api/candidates/bulk-delete` - Delete multiple candidates
- `POST /api/candidates/bulk-tag` - Tag multiple candidates
- `POST /api/candidates/bulk-update` - Update multiple candidates
- `GET/POST /api/candidates/tags` - Manage candidate tags

### Admin Routes
- `POST /api/admin/users/toggle-admin` - Toggle admin role
- `POST /api/admin/users/update-quota` - Update user quota
- `POST /api/admin/users/reset-credits` - Reset user credits
- `DELETE /api/admin/users/delete` - Delete user
- `POST /api/admin/jobs/update-status` - Update job status
- `DELETE /api/admin/jobs/delete` - Delete job

## 📱 Responsive Design

The application is optimized for:
- **iPhone SE** (375px) - Minimum supported width
- **Mobile** (375px - 639px)
- **Tablet** (640px - 1023px)
- **Desktop** (1024px - 1919px)
- **Large Desktop** (1920px+)

Responsive patterns used:
- Mobile-first approach
- Flexible grid layouts
- Adaptive font sizes
- Touch-friendly tap targets
- Conditional element visibility

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

```bash
vercel --prod
```

### Docker (Alternative)

```bash
docker build -t resumerank-ai .
docker run -p 3000:3000 resumerank-ai
```

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start development server

# Building
npm run build        # Create production build
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npx tsc --noEmit     # Type check

# Database
npx supabase db push # Push migrations
npx supabase db pull # Pull schema
```

## 📊 Database Schema

### Main Tables

**profiles**
- User information and metadata
- Credit tracking
- Admin role flag

**jobs**
- Job postings with requirements
- Status management (OPEN, PAUSED, CLOSED)
- Linked to user (creator)

**candidates**
- Application data
- Resume file URL
- AI analysis results and scores
- Linked to job and user

**candidate_tags**
- Many-to-many relationship
- Custom tags for workflow

**audit_logs**
- System activity tracking
- User action logging

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 👥 Authors

- **FenexTech Team** - Initial work and development

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Supabase for backend infrastructure
- Google for Gemini AI
- shadcn for the beautiful UI components

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/tanakrititn/resumerank-ai/issues)

## 🗺 Roadmap

- [ ] Email notifications for new applications
- [ ] Interview scheduling integration
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations
- [ ] Mobile app (iOS/Android)
- [ ] Multi-language support
- [ ] Candidate portal for application tracking
- [ ] Video interview integration
- [ ] ATS integration (Greenhouse, Lever, etc.)

---

**Built with ❤️ by FenexTech**
