# Mr. Lifter - מערכת ניהול אימונים

## 📋 תוכן עניינים
- [סקירה כללית](#סקירה-כללית)
- [תכונות המערכת](#תכונות-המערכת)
- [מבנה המערכת](#מבנה-המערכת)
- [התקנה והגדרה](#התקנה-והגדרה)
- [מדריך משתמש](#מדריך-משתמש)
- [מדריך אדמין](#מדריך-אדמין)
- [מבנה הדאטאבייס](#מבנה-הדאטאבייס)
- [API ופונקציות](#api-ופונקציות)
- [פתרון בעיות](#פתרון-בעיות)

## 🎯 סקירה כללית

**Mr. Lifter** היא אפליקציית ווב מתקדמת לניהול אימונים ומעקב התקדמות בחדר כושר. המערכת מיועדת למתאמנים ומאמנים המעוניינים במעקב מקצועי אחר האימונים שלהם.

### 🚀 טכנולוגיות
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite

## ✨ תכונות המערכת

### 👤 ניהול משתמשים
- **הרשמה והתחברות** - מערכת אימות מאובטחת
- **פרופיל אישי** - שם, משקל, גובה, גיל, BMI
- **אבטחת נתונים** - Row Level Security (RLS)

### 📅 תוכניות אימון
- **תוכניות חודשיות** - אוגוסט, ספטמבר, אוקטובר
- **תוכניות יומיות** - 7 ימים בשבוע עם תרגילים מפורטים
- **מידע מפורט** - סטים, חזרות, משקלים, זמני מנוחה
- **בחירת תרגילים** - לחיצה על תרגיל מעבירה לרישום אימון

### 📝 רישום אימונים
- **Workout A/B** - שני סוגי אימונים שונים
- **רישום מהיר** - תרגיל, משקל, סטים, חזרות, הערות
- **החלקת מסכים** - במובייל ניתן להחליק בין Workout A ל-B
- **שמירה אוטומטית** - כל הנתונים נשמרים בדאטאבייס

### 📊 תרשימים וסטטיסטיקות
- **גרף נפח יומי** - מעקב אחר נפח האימונים ב-30 יום האחרונים
- **תדירות תרגילים** - גרף עמודות של התרגילים הפופולריים
- **התקדמות במשקלים** - גרפי קו לתרגילים מובילים
- **סטטיסטיקות חודשיות** - מספר אימונים ונפח לפי חודשים
- **שיאים אישיים** - רשימת השיאים בכל תרגיל

### 🎯 מטרות אישיות
- **הגדרת מטרות** - יעדים מותאמים אישית
- **קטגוריות**: משקל גוף, כוח, סיבולת, מבנה גוף, מטרות אישיות
- **מעקב התקדמות** - עדכון בזמן אמת עם פס התקדמות
- **ניהול מטרות** - עריכה, מחיקה, סימון השלמה
- **התראות זמן** - מעקב ימים שנותרו

### 🎥 ספריית וידאו
- **קטגוריות**: תרגילים, מדריכים, מוטיבציה, תזונה
- **ניהול וידאו** - הוספה, עריכה, מחיקה (אדמין)
- **הטמעת YouTube** - הצגת וידאו ישירות באפליקציה

### 📱 מותאם למובייל
- **עיצוב רספונסיבי** - מותאם לכל גדלי מסך
- **מחוות מגע** - החלקה בין טאבים ואימונים
- **כפתורים גדולים** - מותאמים למגע
- **טקסט מותאם** - גדלים שונים לפי המכשיר

## 🏗️ מבנה המערכת

### 📁 מבנה קבצים
```
src/
├── components/          # רכיבי React
│   ├── AuthWrapper.tsx     # אימות משתמשים
│   ├── Dashboard.tsx       # מסך ראשי
│   ├── LogEntry.tsx        # רישום אימונים
│   ├── ProgramViewer.tsx   # צפייה בתוכניות
│   ├── ChartsPanel.tsx     # תרשימים
│   ├── GoalsPanel.tsx      # מטרות אישיות
│   └── ...
├── lib/                 # ספריות חיצוניות
│   ├── supabase.ts         # הגדרות Supabase
│   └── database.types.ts   # טיפוסי דאטאבייס
├── utils/               # פונקציות עזר
│   ├── supabase-storage.ts # פעולות דאטאבייס
│   ├── admin-config.ts     # הגדרות אדמין
│   └── calculations.ts     # חישובים
├── data/                # נתונים סטטיים
│   └── programs.ts         # תוכניות אימון
└── types/               # הגדרות טיפוסים
    └── index.ts            # כל הטיפוסים
```

### 🗄️ מבנה הדאטאבייס
```sql
-- טבלת משתמשים
users (
  id: uuid PRIMARY KEY,
  name: text,
  weight: numeric(5,2),
  height: numeric(5,2),
  age: integer,
  bmi: numeric(4,2),
  created_at: timestamptz
)

-- טבלת רישומי אימונים
workout_logs (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  date: date,
  exercise: text,
  weight: numeric(6,2),
  sets: integer,
  reps: integer,
  notes: text,
  duration: integer,
  created_at: timestamptz
)

-- טבלת מטרות
goals (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  title: text,
  description: text,
  target_value: numeric(10,2),
  current_value: numeric(10,2),
  unit: text,
  category: text CHECK (category IN ('weight', 'strength', 'endurance', 'body', 'custom')),
  target_date: date,
  is_completed: boolean,
  created_at: timestamptz
)

-- טבלת וידאו
videos (
  id: uuid PRIMARY KEY,
  title: text,
  description: text,
  url: text,
  thumbnail: text,
  category: text CHECK (category IN ('exercise', 'tutorial', 'motivation', 'nutrition')),
  created_at: timestamptz
)
```

## ⚙️ התקנה והגדרה

### 1. דרישות מערכת
- Node.js 18+
- npm או yarn
- חשבון Supabase

### 2. התקנה
```bash
# שכפול הפרויקט
git clone [repository-url]
cd mr-lifter

# התקנת תלויות
npm install

# הגדרת משתני סביבה
cp .env.example .env
```

### 3. הגדרת Supabase
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. הרצת המערכת
```bash
# פיתוח
npm run dev

# בנייה לפרודקשן
npm run build

# תצוגה מקדימה
npm run preview
```

## 👨‍💻 מדריך משתמש

### הרשמה והתחברות
1. פתח את האפליקציה
2. בחר "Sign Up" להרשמה או "Sign In" להתחברות
3. הזן מייל וסיסמה
4. צור פרופיל עם הפרטים האישיים שלך

### רישום אימון
1. עבור לטאב "Log Workout"
2. בחר Workout A או B
3. מלא פרטי התרגיל:
   - שם התרגיל
   - משקל (ק"ג)
   - מספר סטים
   - מספר חזרות
   - הערות (אופציונלי)
4. לחץ "Add Workout to Log"

### צפייה בתוכנית אימון
1. עבור לטאב "Program"
2. בחר חודש מהרשימה
3. לחץ על תרגיל כדי להעביר אותו לרישום אימון

### מעקב אחר התקדמות
1. **Stats** - סטטיסטיקות כלליות ושיאים אישיים
2. **Charts** - תרשימים ויזואליים של ההתקדמות
3. **History** - היסטוריית כל האימונים

### הגדרת מטרות
1. עבור לטאב "Goals"
2. לחץ "הוסף מטרה"
3. מלא פרטי המטרה:
   - כותרת
   - קטגוריה
   - ערך יעד
   - ערך נוכחי
   - תאריך יעד
4. עדכן התקדמות בשדה המיוחד

## 👑 מדריך אדמין

### הפיכה לאדמין
1. ערוך את הקובץ `src/utils/admin-config.ts`
2. הוסף את המייל שלך לרשימת `ADMIN_EMAILS`
3. התחבר עם המייל המורשה
4. כפתור "Admin Mode" יופיע בממשק

### ניהול תוכניות אימון
1. הפעל מצב אדמין
2. עבור לטאב "Program"
3. לחץ על אייקון העריכה בתרגיל
4. ערוך פרטים או הוסף תרגילים חדשים

### ניהול וידאו
1. הפעל מצב אדמין
2. עבור לטאב "Videos"
3. לחץ "Add Video" להוספת וידאו חדש
4. השתמש באייקוני העריכה/מחיקה לניהול

### הרשאות אדמין
- עריכת תוכניות אימון
- ניהול ספריית הוידאו
- גישה לכל הנתונים
- יצוא דוחות

## 🔧 API ופונקציות

### פונקציות משתמשים
```typescript
// שמירת משתמש
saveUserToSupabase(user: Omit<User, 'id' | 'createdAt'>): Promise<User | null>

// קבלת משתמש
getUserFromSupabase(): Promise<User | null>
```

### פונקציות אימונים
```typescript
// שמירת אימון
saveLogToSupabase(log: Omit<WorkoutLog, 'id' | 'userId'>): Promise<WorkoutLog | null>

// קבלת אימונים
getLogsFromSupabase(): Promise<WorkoutLog[]>
```

### פונקציות מטרות
```typescript
// שמירת מטרה
saveGoalToSupabase(goal: Omit<Goal, 'id' | 'userId' | 'createdAt'>): Promise<Goal | null>

// עדכון מטרה
updateGoalInSupabase(id: string, updates: Partial<Goal>): Promise<Goal | null>

// מחיקת מטרה
deleteGoalFromSupabase(id: string): Promise<boolean>
```

### פונקציות וידאו
```typescript
// שמירת וידאו
saveVideoToSupabase(video: Omit<Video, 'id' | 'createdAt'>): Promise<Video | null>

// עדכון וידאו
updateVideoInSupabase(id: string, updates: Partial<Video>): Promise<Video | null>

// מחיקת וידאו
deleteVideoFromSupabase(id: string): Promise<boolean>
```

## 🐛 פתרון בעיות

### בעיות התחברות
- **שגיאת API Key**: ודא שה-Supabase keys נכונים ב-.env
- **שגיאת רשת**: בדוק חיבור לאינטרנט
- **מייל לא מאומת**: בדוק תיבת מייל לאימות

### בעיות דאטאבייס
- **RLS Policies**: ודא שהמדיניות מוגדרת נכון
- **שגיאות שמירה**: בדוק הרשאות משתמש
- **נתונים לא נטענים**: בדוק חיבור לדאטאבייס

### בעיות מובייל
- **כפתורים קטנים**: השתמש בגרסה המעודכנת
- **טקסט לא קריא**: בדוק הגדרות זום בדפדפן
- **החלקה לא עובדת**: נסה לרענן את הדף

### בעיות ביצועים
- **טעינה איטית**: בדוק חיבור רשת
- **תרשימים לא נטענים**: ודא שיש נתוני אימונים
- **זיכרון גבוה**: נקה cache הדפדפן

## 📞 תמיכה

לתמיכה טכנית או שאלות:
- **אתר**: [mrlifter.co.il](https://mrlifter.co.il)
- **אינסטגרם**: [@mr.lifter_savyon](https://www.instagram.com/mr.lifter_savyon)
- **פייסבוק**: [Mr. Lifter Savyon](https://www.facebook.com/mrliftersavyon)

---

**גרסה**: 1.0.0  
**עדכון אחרון**: ינואר 2025  
**מפתח**: Mr. Lifter Team