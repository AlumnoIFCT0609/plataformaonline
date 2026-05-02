// ============================================
// ARCHIVO: frontend/src/components/admin/CourseTable.tsx
// ============================================

'use client';

import { Edit2, Trash2, CheckCircle, FileText, Archive } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;                    // ← AÑADE
  description: string;             // ← AÑADE
  tutorId: string;                 // ← AÑADE
  tutorName?: string;
  status: 'draft' | 'published' | 'archived';
  contentType: 'video' | 'document' | 'mixed';
  level: string;
  durationHours?: number;
  maxStudents?: number;            // ← AÑADE el ?
  language?: string;               // ← AÑADE
  createdAt: string;
}

interface CourseTableProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
  onPublish: (courseId: string) => void;
  onToggleStatus: (courseId: string, currentStatus: string) => void;
  
}

export default function CourseTable({
  courses,
  onEdit,
  onDelete,
  onPublish,
  onToggleStatus, 
}: CourseTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      draft: 'Borrador',
      published: 'Publicado',
      archived: 'Archivado',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'document':
        return '📄';
      case 'mixed':
        return '📚';
      default:
        return '📝';
    }
  };

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No hay cursos para mostrar</p>
      </div>
    );
  }


  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Curso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tutor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duración
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {course.title}
                  </div>
                  <div className="text-sm text-gray-500">{course.level}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {course.tutorName || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 text-lg">
                      {getContentTypeIcon(course.contentType)}
                    </span>
                    {course.contentType}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
  <button
    onClick={() => onToggleStatus(course.id, course.status)}
    disabled={course.status === 'published'}
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      course.status === 'published'
        ? 'bg-green-100 text-green-800 cursor-not-allowed'
        : course.status === 'draft'
        ? 'bg-yellow-100 text-yellow-800 cursor-pointer hover:opacity-80'
        : 'bg-gray-100 text-gray-800 cursor-pointer hover:opacity-80'
    }`}
  >
    {course.status === 'published' ? 'Publicado' : course.status === 'draft' ? 'Borrador' : 'Archivado'}
  </button>
</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {course.durationHours}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(course.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center space-x-2">
                    {course.status === 'draft' && (
                      <button
                        onClick={() => onPublish(course.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Publicar"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(course)}
                      className="text-emerald-600 hover:text-emerald-900"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(course)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}