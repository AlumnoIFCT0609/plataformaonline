// ============================================
// ARCHIVO 7: frontend/types/index.ts
// ============================================

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'tutor' | 'student';
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  tutorName: string;
  enrolledStudents?: number;
  progressPercentage?: number;
}

export interface Enrollment {
  id: string;
  courseTitle: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  progressPercentage: number;
}
