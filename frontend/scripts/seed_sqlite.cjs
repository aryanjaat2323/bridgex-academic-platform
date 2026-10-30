const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../backend/bridgex.db');
const db = new Database(dbPath);

console.log('Initializing SQLite database at', dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    hod_name VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    department_id INTEGER NOT NULL REFERENCES departments(id),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) NOT NULL UNIQUE,
    semester INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    roll_number VARCHAR(50),
    employee_id VARCHAR(50),
    section VARCHAR(10) DEFAULT 'A',
    office_room VARCHAR(100),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faculty_subject_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_id INTEGER NOT NULL REFERENCES users(id),
    subject_id INTEGER NOT NULL REFERENCES subjects(id),
    section VARCHAR(10) DEFAULT 'A'
);

CREATE TABLE IF NOT EXISTS doubts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference_id VARCHAR(30) NOT NULL UNIQUE,
    student_id INTEGER NOT NULL REFERENCES users(id),
    assigned_faculty_id INTEGER NOT NULL REFERENCES users(id),
    subject_id INTEGER NOT NULL REFERENCES subjects(id),
    topic VARCHAR(200) NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    urgency VARCHAR(30) DEFAULT 'normal',
    status VARCHAR(30) DEFAULT 'pending',
    context_notes TEXT,
    attachment_url VARCHAR(500),
    is_escalated BOOLEAN DEFAULT 0,
    escalated_at DATETIME,
    escalation_reason TEXT,
    is_published BOOLEAN DEFAULT 0,
    upvotes INTEGER DEFAULT 0,
    rating_avg FLOAT DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doubt_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doubt_id INTEGER NOT NULL REFERENCES doubts(id),
    author_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_faculty_answer BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doubt_timeline_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doubt_id INTEGER NOT NULL REFERENCES doubts(id),
    previous_status VARCHAR(30),
    new_status VARCHAR(30),
    changed_by_user_id INTEGER REFERENCES users(id),
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS office_hour_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_id INTEGER NOT NULL REFERENCES users(id),
    day_of_week VARCHAR(20) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    slot_duration_minutes INTEGER DEFAULT 15,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slot_id INTEGER REFERENCES office_hour_slots(id),
    faculty_id INTEGER NOT NULL REFERENCES users(id),
    student_id INTEGER NOT NULL REFERENCES users(id),
    appointment_date VARCHAR(20) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS solved_doubt_ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doubt_id INTEGER NOT NULL REFERENCES doubts(id),
    student_id INTEGER NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL,
    feedback TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    link_url VARCHAR(300),
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS merged_doubts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    primary_doubt_id INTEGER NOT NULL REFERENCES doubts(id),
    merged_doubt_id INTEGER NOT NULL REFERENCES doubts(id),
    merged_by_id INTEGER NOT NULL REFERENCES users(id),
    notes TEXT,
    merged_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// Departments
const insertDept = db.prepare('INSERT OR IGNORE INTO departments (id, name, code, hod_name) VALUES (?, ?, ?, ?)');
insertDept.run(1, 'Computer Science & Engineering', 'CSE', 'Dr. K. Venkat');
insertDept.run(2, 'Electronics & Communication', 'ECE', 'Dr. S. Mukherjee');

// Courses
const insertCourse = db.prepare('INSERT OR IGNORE INTO courses (id, department_id, name, code) VALUES (?, ?, ?, ?)');
insertCourse.run(1, 1, 'B.Tech Computer Science', 'BT-CSE');
insertCourse.run(2, 1, 'Bachelor of Computer Applications', 'BCA');

// Subjects
const insertSub = db.prepare('INSERT OR IGNORE INTO subjects (id, course_id, name, code, semester) VALUES (?, ?, ?, ?, ?)');
insertSub.run(1, 1, 'Data Structures & Algorithms', 'CS201', 3);
insertSub.run(2, 1, 'Operating Systems', 'CS301', 4);
insertSub.run(3, 1, 'Database Management Systems', 'CS302', 4);
insertSub.run(4, 1, 'Computer Networks', 'CS401', 5);

// Bcrypt hash for password123
const pwHash = bcrypt.hashSync('password123', 12);
console.log('Generated bcrypt hash for password123:', pwHash);
console.log('Testing password verification:', bcrypt.compareSync('password123', pwHash));

// Users
const insertUser = db.prepare(`
  INSERT OR REPLACE INTO users (id, email, hashed_password, full_name, role, department_id, roll_number, employee_id, section, office_room, avatar_url, is_active)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

insertUser.run(1, 'admin@bridgex.edu', pwHash, 'Dr. K. Venkat (HOD)', 'admin', 1, null, 'EMP-HOD', 'A', 'Block A - 101', 'https://api.dicebear.com/7.x/initials/svg?seed=KV');
insertUser.run(2, 'faculty@bridgex.edu', pwHash, 'Dr. Priya Raman', 'faculty', 1, null, 'FAC-082', 'A', 'Block B - Room 304', 'https://api.dicebear.com/7.x/initials/svg?seed=PR');
insertUser.run(3, 'faculty2@bridgex.edu', pwHash, 'Prof. Rajesh Nair', 'faculty', 1, null, 'FAC-114', 'A', 'Block B - Room 310', 'https://api.dicebear.com/7.x/initials/svg?seed=RN');
insertUser.run(4, 'cr@bridgex.edu', pwHash, 'Tanya Verma (CR)', 'cr', 1, 'CS-2023-001', null, 'A', null, 'https://api.dicebear.com/7.x/initials/svg?seed=TV');
insertUser.run(5, 'student@bridgex.edu', pwHash, 'Aarav Sharma', 'student', 1, 'CS-2023-042', null, 'A', null, 'https://api.dicebear.com/7.x/initials/svg?seed=AS');
insertUser.run(6, 'sneha@bridgex.edu', pwHash, 'Sneha Patel', 'student', 1, 'CS-2023-068', null, 'A', null, 'https://api.dicebear.com/7.x/initials/svg?seed=SP');

// Assignments
const insertAssign = db.prepare('INSERT OR IGNORE INTO faculty_subject_assignments (faculty_id, subject_id, section) VALUES (?, ?, ?)');
insertAssign.run(2, 1, 'A');
insertAssign.run(2, 2, 'A');
insertAssign.run(3, 3, 'A');
insertAssign.run(3, 4, 'A');

// Office hour slots
const insertSlot = db.prepare('INSERT OR IGNORE INTO office_hour_slots (faculty_id, day_of_week, start_time, end_time, slot_duration_minutes) VALUES (?, ?, ?, ?, ?)');
insertSlot.run(2, 'Wednesday', '14:00', '16:00', 20);
insertSlot.run(2, 'Friday', '10:00', '12:00', 20);
insertSlot.run(3, 'Thursday', '15:00', '17:00', 30);

// Sample doubts
const insertDoubt = db.prepare(`
  INSERT OR IGNORE INTO doubts (id, reference_id, student_id, assigned_faculty_id, subject_id, topic, title, description, urgency, status, is_published, upvotes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
insertDoubt.run(1, 'BX-2026-1011', 5, 2, 1, 'Graph Algorithms', "Dijkstra's shortest path time complexity with Binary Heap vs Fibonacci Heap", "Could you please explain why Fibonacci heap improves Dijkstra's complexity?", 'normal', 'resolved', 1, 18);
insertDoubt.run(2, 'BX-2026-1012', 6, 2, 2, 'Memory Management', 'Thrashing mitigation in demand paging using working set model', 'How does the OS detect thrashing when page fault frequency rises?', 'important', 'answered', 1, 9);
insertDoubt.run(3, 'BX-2026-1013', 5, 3, 3, 'Indexing', 'B+ Tree leaf node linked list traversal in range queries', 'Why is B+ Tree preferred over B-Tree for range scans?', 'deadline_approaching', 'queued', 0, 0);
insertDoubt.run(4, 'BX-2026-1014', 5, 2, 1, 'Balanced Trees', 'Double rotation order in AVL trees: Left-Right vs Right-Left', 'I am confused about the order of pivot rotations.', 'normal', 'pending', 0, 0);

console.log('Seeded SQLite successfully! Users list:');
console.log(db.prepare('SELECT id, email, role, full_name, is_active FROM users').all());
