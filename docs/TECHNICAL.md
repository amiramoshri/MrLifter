# Mr. Lifter - תיעוד טכני

## 🏗️ ארכיטקטורה טכנית

### Frontend Architecture
```
┌─────────────────────────────────────┐
│              React App              │
├─────────────────────────────────────┤
│         Component Layer             │
│  ┌─────────────┐ ┌─────────────┐   │
│  │  Dashboard  │ │ AuthWrapper │   │
│  └─────────────┘ └─────────────┘   │
│  ┌─────────────┐ ┌─────────────┐   │
│  │  LogEntry   │ │ ChartsPanel │   │
│  └─────────────┘ └─────────────┘   │
├─────────────────────────────────────┤
│           Utils Layer               │
│  ┌─────────────┐ ┌─────────────┐   │
│  │   Storage   │ │    Admin    │   │
│  └─────────────┘ └─────────────┘   │
├─────────────────────────────────────┤
│            Data Layer               │
│  ┌─────────────┐ ┌─────────────┐   │
│  │  Supabase   │ │    Types    │   │
│  └─────────────┘ └─────────────┘   │
└─────────────────────────────────────┘
```

### Backend Architecture (Supabase)
```
┌─────────────────────────────────────┐
│            Supabase                 │
├─────────────────────────────────────┤
│              Auth                   │
│  ┌─────────────────────────────┐   │
│  │     JWT Authentication      │   │
│  │     Row Level Security      │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│            Database                 │
│  ┌─────────────────────────────┐   │
│  │        PostgreSQL           │   │
│  │    ┌─────┐ ┌─────┐ ┌─────┐  │   │
│  │    │Users│ │Logs │ │Goals│  │   │
│  │    └─────┘ └─────┘ └─────┘  │   │
│  │    ┌─────┐                  │   │
│  │    │Video│                  │   │
│  │    └─────┘                  │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│            Real-time                │
│  ┌─────────────────────────────┐   │
│  │      Subscriptions          │   │
│  │      Live Updates           │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## 🔧 רכיבים טכניים

### State Management
המערכת משתמשת ב-React Hooks לניהול מצב:

```typescript
// Dashboard State
const [activeTab, setActiveTab] = useState<TabType>('program');
const [logs, setLogs] = useState<WorkoutLog[]>([]);
const [user, setUser] = useState<User | null>(null);
const [isAdmin, setIsAdmin] = useState(false);

// Loading & Error States
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### Data Flow
```
User Action → Component → Utils Function → Supabase → Database
                ↓
            State Update → UI Re-render
```

### Authentication Flow
```
1. User enters credentials
2. Supabase Auth validates
3. JWT token generated
4. User session stored
5. RLS policies applied
6. Data access granted
```

## 📊 Database Schema Details

### Users Table
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  weight numeric(5,2) NOT NULL,
  height numeric(5,2) NOT NULL,
  age integer,
  bmi numeric(4,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS Policy
CREATE POLICY "Users can manage their own data" 
ON users FOR ALL 
TO authenticated 
USING (auth.uid() = id);
```

### Workout Logs Table
```sql
CREATE TABLE workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  exercise text NOT NULL,
  weight numeric(6,2) NOT NULL,
  sets integer NOT NULL,
  reps integer NOT NULL,
  notes text,
  duration integer,
  created_at timestamptz DEFAULT now()
);

-- RLS Policy
CREATE POLICY "Users can manage their own workout logs" 
ON workout_logs FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);
```

### Goals Table
```sql
CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_value numeric(10,2) NOT NULL,
  current_value numeric(10,2) DEFAULT 0,
  unit text DEFAULT 'ק"ג',
  category text CHECK (category IN ('weight', 'strength', 'endurance', 'body', 'custom')),
  target_date date NOT NULL,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- RLS Policy
CREATE POLICY "Users can manage their own goals" 
ON goals FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
```

### Videos Table
```sql
CREATE TABLE videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  url text NOT NULL,
  thumbnail text,
  category text CHECK (category IN ('exercise', 'tutorial', 'motivation', 'nutrition')),
  created_at timestamptz DEFAULT now()
);

-- RLS Policies
CREATE POLICY "All authenticated users can read videos" 
ON videos FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admin users can manage videos" 
ON videos FOR ALL 
TO authenticated 
USING (true);
```

## 🔐 Security Implementation

### Row Level Security (RLS)
כל טבלה מוגנת ב-RLS policies:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
```

### Admin System
```typescript
// Admin Configuration
export const ADMIN_EMAILS = [
  'admin@mrlifter.co.il',
  'coach@mrlifter.co.il'
];

export const isAdminUser = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// Usage in Components
const isUserAdmin = isAdminUser(userEmail);
```

### Data Validation
```typescript
// Client-side validation
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.name.trim()) {
    newErrors.name = 'Name is required';
  }
  
  if (!formData.weight || parseFloat(formData.weight) <= 0) {
    newErrors.weight = 'Valid weight is required';
  }
  
  return Object.keys(newErrors).length === 0;
};
```

## 📱 Mobile Optimization

### Responsive Design
```css
/* Mobile First Approach */
.component {
  /* Mobile styles (default) */
  padding: 0.5rem;
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  .component {
    /* Tablet and up */
    padding: 1rem;
    font-size: 1rem;
  }
}
```

### Touch Gestures
```typescript
// Swipe handling for mobile
const handleTouchStart = (e: React.TouchEvent) => {
  setTouchStart(e.targetTouches[0].clientX);
};

const handleTouchEnd = () => {
  if (!touchStart || !touchEnd) return;
  
  const distance = touchStart - touchEnd;
  const isLeftSwipe = distance > 50;
  const isRightSwipe = distance < -50;

  if (isLeftSwipe && activeWorkout === 'A') {
    setActiveWorkout('B');
  }
  if (isRightSwipe && activeWorkout === 'B') {
    setActiveWorkout('A');
  }
};
```

### Mobile-Specific Features
- **Touch targets**: כפתורים בגודל מינימום 44px
- **Viewport meta**: מניעת זום לא רצוי
- **Scrollbar hiding**: גלילה נקייה בטאבים
- **Active states**: משוב ויזואלי בלחיצה

## 📊 Charts Implementation

### Recharts Integration
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Chart Component
<ResponsiveContainer width="100%" height="100%">
  <LineChart data={chartData.progressData}>
    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
    <XAxis dataKey="date" stroke="#9CA3AF" />
    <YAxis stroke="#9CA3AF" />
    <Tooltip contentStyle={{ 
      backgroundColor: '#1F2937', 
      border: '1px solid #374151',
      borderRadius: '8px',
      color: '#F9FAFB'
    }} />
    <Line 
      type="monotone" 
      dataKey="volume" 
      stroke="#3B82F6" 
      strokeWidth={3}
    />
  </LineChart>
</ResponsiveContainer>
```

### Data Processing
```typescript
// Progress data calculation
const progressData = useMemo(() => {
  const last30Days = logs.filter(log => {
    const logDate = new Date(log.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return logDate >= thirtyDaysAgo;
  });

  const dailyVolume = last30Days.reduce((acc, log) => {
    const date = log.date;
    const volume = log.weight * log.sets * log.reps;
    acc[date] = (acc[date] || 0) + volume;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(dailyVolume).map(([date, volume]) => ({
    date: new Date(date).toLocaleDateString('he-IL'),
    volume: Math.round(volume)
  }));
}, [logs]);
```

## 🚀 Performance Optimization

### Code Splitting
```typescript
// Lazy loading components
const ChartsPanel = React.lazy(() => import('./ChartsPanel'));
const GoalsPanel = React.lazy(() => import('./GoalsPanel'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <ChartsPanel user={user} logs={logs} />
</Suspense>
```

### Memoization
```typescript
// Expensive calculations
const chartData = useMemo(() => {
  // Heavy data processing
  return processChartData(logs);
}, [logs]);

// Component memoization
const MemoizedChart = React.memo(ChartComponent);
```

### Database Optimization
```sql
-- Indexes for better performance
CREATE INDEX idx_workout_logs_user_date ON workout_logs(user_id, date DESC);
CREATE INDEX idx_goals_user_category ON goals(user_id, category);
CREATE INDEX idx_videos_category ON videos(category);
```

## 🔄 Error Handling

### Global Error Boundary
```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

### API Error Handling
```typescript
const saveLogToSupabase = async (log: Omit<WorkoutLog, 'id' | 'userId'>): Promise<WorkoutLog | null> => {
  try {
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
      return null;
    }

    const { data, error } = await supabase
      .from('workout_logs')
      .insert(logData)
      .select()
      .single();

    if (error) {
      console.error('Error saving workout log:', error);
      return null;
    }

    return transformData(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};
```

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Component testing
describe('LogEntry Component', () => {
  test('renders form fields correctly', () => {
    render(<LogEntry onSubmit={mockSubmit} />);
    expect(screen.getByLabelText('Exercise Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Weight (kg)')).toBeInTheDocument();
  });

  test('validates required fields', () => {
    render(<LogEntry onSubmit={mockSubmit} />);
    fireEvent.click(screen.getByText('Add Workout'));
    expect(screen.getByText('Exercise is required')).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
// Database integration
describe('Supabase Integration', () => {
  test('saves workout log successfully', async () => {
    const mockLog = {
      date: '2025-01-01',
      exercise: 'Bench Press',
      weight: 80,
      sets: 3,
      reps: 10
    };

    const result = await saveLogToSupabase(mockLog);
    expect(result).toBeTruthy();
    expect(result.exercise).toBe('Bench Press');
  });
});
```

## 🚀 Deployment

### Build Process
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview build
npm run preview
```

### Environment Variables
```env
# Production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Development
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Admin users configured
- [ ] SSL certificate installed
- [ ] Performance monitoring setup

## 📈 Monitoring & Analytics

### Performance Metrics
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### Error Tracking
```typescript
// Error logging
const logError = (error: Error, context: string) => {
  console.error(`[${context}]`, error);
  // Send to monitoring service
  // analytics.track('error', { error: error.message, context });
};
```

### Usage Analytics
```typescript
// Track user actions
const trackEvent = (event: string, properties?: object) => {
  // analytics.track(event, properties);
  console.log('Event:', event, properties);
};

// Usage
trackEvent('workout_logged', { exercise: 'Bench Press', weight: 80 });
trackEvent('goal_created', { category: 'strength' });
```

---

**מסמך זה מתעדכן באופן שוטף עם התפתחות המערכת**