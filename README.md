# TalentFlow - Mini Hiring Platform

A comprehensive React application that enables HR teams to manage jobs, candidates, and assessments in a streamlined hiring process.

## 🚀 Features

### Jobs Management
- **Job Board**: List with server-like pagination & filtering (title, status, tags)
- **Create/Edit Jobs**: Dedicated pages for job creation and editing with validation
- **Archive/Unarchive**: Toggle job status with visual indicators
- **Drag & Drop Reordering**: Optimistic updates with rollback on failure
- **Deep Linking**: Direct access to jobs via `/jobs/:jobId`
- **Tag System**: Comprehensive tag filtering with 50+ predefined tags

### Candidates Management
- **Virtualized List**: Handles 1000+ candidates with smooth scrolling
- **Client-side Search**: Real-time search by name/email with debouncing
- **Server-like Filtering**: Filter by current stage (applied, screen, tech, offer, hired, rejected)
- **Kanban Board**: Drag-and-drop candidate progression through hiring stages
- **Candidate Profiles**: Detailed view with timeline of status changes
- **Notes with @Mentions**: Rich text notes with user mention suggestions

### Assessments System
- **Assessment Builder**: Visual editor for creating job-specific assessments
- **Question Types**: Support for all required question types:
  - Short text
  - Long text
  - Numeric (with range validation)
  - Single choice
  - Multi choice
  - File upload
- **Conditional Logic**: Show/hide questions based on previous answers
- **Live Preview**: Real-time preview of assessment as candidates will see it
- **Validation Rules**: Required fields, max length, numeric ranges
- **Drag & Drop**: Reorder questions in the builder
- **Candidate Interface**: Clean assessment taking experience

## 🛠️ Technical Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI Framework**: Chakra UI with custom theme
- **State Management**: React Hooks (useState, useEffect, useMemo, useCallback)
- **Routing**: React Router v6 with nested routes
- **Drag & Drop**: @dnd-kit for smooth interactions
- **Virtualization**: @tanstack/react-virtual for performance
- **Forms**: React Hook Form with validation
- **Database**: IndexedDB via Dexie.js
- **API Mocking**: MSW (Mock Service Worker)
- **Data Generation**: Faker.js for realistic seed data

## 📁 Project Structure

```
src/
├── api/
│   ├── db.ts              # IndexedDB schema and configuration
│   ├── handlers.ts        # MSW API handlers
│   ├── seed.ts           # Database seeding with realistic data
│   └── browser.ts        # MSW browser setup
├── components/
│   ├── Layout.tsx        # Main app layout with navigation
│   └── ui/               # Reusable UI components
├── features/
│   ├── assessments/
│   │   ├── AssessmentPreview.tsx    # Live assessment preview
│   │   └── QuestionEditor.tsx       # Question builder component
│   ├── candidates/
│   │   ├── CandidateCard.tsx        # Draggable candidate card
│   │   ├── KanbanBoard.tsx          # Drag-and-drop board
│   │   └── KanbanColumn.tsx         # Individual stage columns
│   └── jobs/
│       └── JobForm.tsx              # Reusable job form component
├── pages/
│   ├── JobsPage.tsx                 # Main jobs listing
│   ├── JobDetailPage.tsx            # Individual job view
│   ├── JobEditorPage.tsx            # Job creation/editing
│   ├── CandidatesPage.tsx           # Candidates listing (list/kanban)
│   ├── CandidateProfilePage.tsx     # Individual candidate view
│   ├── AssessmentBuilderPage.tsx    # Assessment creation/editing
│   └── CandidateAssessmentPage.tsx  # Assessment taking interface
├── App.tsx               # Main app component with routing
└── main.tsx             # App entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd talentflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🎯 Core Flows

### 1. Job Management Flow
1. **View Jobs**: Browse paginated job list with filtering
2. **Create Job**: Click "Create Job" → Fill form → Save
3. **Edit Job**: Click "Edit" on job card → Modify → Save
4. **Archive Job**: Toggle archive status with visual feedback
5. **Reorder Jobs**: Drag and drop for custom ordering

### 2. Candidate Management Flow
1. **View Candidates**: Switch between list and Kanban views
2. **Search/Filter**: Real-time search and stage filtering
3. **Move Candidates**: Drag between stages in Kanban view
4. **View Profile**: Click candidate for detailed timeline
5. **Add Notes**: Rich text notes with @mention support

### 3. Assessment Flow
1. **Create Assessment**: Navigate to job → "Manage Assessment"
2. **Build Questions**: Add various question types with validation
3. **Set Conditions**: Configure conditional question logic
4. **Preview**: Live preview of candidate experience
5. **Candidate Takes**: Apply for job → Complete assessment
6. **Submit**: Responses stored in IndexedDB

## 🔧 API Endpoints

The application uses MSW to simulate a REST API:

### Jobs
- `GET /jobs` - List jobs with pagination and filtering
- `POST /jobs` - Create new job
- `GET /jobs/:id` - Get job details
- `PATCH /jobs/:id` - Update job
- `PATCH /jobs/:id/reorder` - Reorder jobs (with occasional 500 errors)

### Candidates
- `GET /candidates` - List candidates with filtering
- `POST /candidates` - Create new candidate
- `PATCH /candidates/:id` - Update candidate (stage transitions)
- `GET /candidates/:id/timeline` - Get candidate timeline

### Assessments
- `GET /assessments/:jobId` - Get assessment for job
- `PUT /assessments/:jobId` - Save/update assessment
- `POST /assessments/:jobId/submit` - Submit candidate responses

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop and mobile
- **Dark/Light Mode**: System preference detection
- **Loading States**: Spinners and skeleton loaders
- **Error Handling**: Toast notifications for user feedback
- **Optimistic Updates**: Immediate UI feedback with rollback
- **Accessibility**: ARIA labels and keyboard navigation
- **Smooth Animations**: Framer Motion for transitions

## 📊 Data Management

### IndexedDB Schema
- **Jobs**: id, title, slug, status, tags, order
- **Candidates**: id, name, email, jobId, stage
- **Assessments**: jobId, questions[]
- **AssessmentResponses**: id, candidateId, assessmentId, responses, submittedAt

### Seed Data
- **25 Jobs**: Mix of active/archived with realistic titles
- **1000 Candidates**: Randomly assigned to jobs and stages
- **5 Assessments**: Comprehensive assessments with 10+ questions each
- **Realistic Tags**: 50+ categorized tags for filtering

## 🚀 Performance Optimizations

- **Virtual Scrolling**: Handle 1000+ candidates smoothly
- **Debounced Search**: Prevent excessive API calls
- **Memoized Components**: Optimize re-renders
- **Lazy Loading**: Code splitting for better initial load
- **Optimistic Updates**: Immediate UI feedback
- **Efficient Filtering**: Client-side filtering with useMemo

## 🧪 Testing & Quality

- **TypeScript**: Full type safety throughout
- **ESLint**: Code quality and consistency
- **Error Boundaries**: Graceful error handling
- **Form Validation**: Comprehensive input validation
- **API Error Simulation**: 5-10% error rate for testing

## 🚀 Deployment

The application is ready for deployment to any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: Connect GitHub repository
- **GitHub Pages**: `npm run build && gh-pages -d dist`

## 🔮 Future Enhancements

- **Authentication**: User login and role-based access
- **Real Backend**: Replace MSW with actual API
- **Email Notifications**: Candidate and HR notifications
- **Analytics Dashboard**: Hiring metrics and insights
- **Bulk Operations**: Mass candidate updates
- **Advanced Filtering**: Date ranges, custom fields
- **Export Features**: CSV/PDF exports
- **Mobile App**: React Native version

## 📝 Technical Decisions

### Why IndexedDB?
- **Offline Support**: Works without internet connection
- **Large Storage**: Handle 1000+ candidates efficiently
- **Real-time**: No network delays for local operations
- **Persistence**: Data survives browser refreshes

### Why MSW?
- **Realistic API**: Simulates real backend behavior
- **Error Simulation**: Test error handling scenarios
- **Network Delays**: Mimic real-world conditions
- **Easy Migration**: Simple to replace with real API

### Why Chakra UI?
- **Accessibility**: Built-in ARIA support
- **Customization**: Easy theme customization
- **Performance**: Optimized components
- **Developer Experience**: Excellent TypeScript support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**TalentFlow** - Streamlining the hiring process with modern web technologies.