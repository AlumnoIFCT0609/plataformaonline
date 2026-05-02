// ============================================
// ARCHIVO 3: backend/src/types/index.ts
// ============================================

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'tutor' | 'student';
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
}

export interface Course {
  id: string;
  tutorId: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl?: string;
  contentType: 'video' | 'document' | 'mixed';
  status: 'draft' | 'published' | 'archived';
  level?: string;
  durationHours?: number;
  createdAt: Date;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  progressPercentage: number;
  enrolledAt: Date;
}

export interface Exam {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  passingScore: number;
  maxAttempts: number;
  status: 'draft' | 'published' | 'closed';
}