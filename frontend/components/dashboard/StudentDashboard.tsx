import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Award, Bell, TrendingUp } from 'lucide-react';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    enrolledCourses: [],
    upcomingExams: [],
    recentAnnouncements: [],
    stats: {
      coursesInProgress: 0,
      coursesCompleted: 0,
      averageScore: 0,
      totalHoursLearned: 0
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/v1/dashboard/student', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-8 h-8" style={{ color }} />
        </div>
      </div>
    </div>
  );

  const CourseCard = ({ course }) => {
    const progressPercentage = course.progressPercentage || 0;
    
    return (
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border">
        <div className="flex gap-4">
          <img 
            src={course.thumbnailUrl || 'https://via.placeholder.com/150'} 
            alt={course.title}
            className="w-24 h-24 rounded object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Por: {course.tutorName}
            </p>
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progreso</span>
                <span className="font-semibold">{progressPercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Continuar aprendiendo →
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ExamCard = ({ exam }) => {
    const daysUntil = Math.ceil((new Date(exam.availableUntil) - new Date()) / (1000 * 60 * 60 * 24));
    
    return (
      <div className="bg-white rounded-lg shadow p-4 border border-orange-200">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{exam.title}</h4>
            <p className="text-sm text-gray-600">{exam.courseTitle}</p>
          </div>
          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
            {daysUntil} días
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-600 mt-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {exam.durationMinutes} min
          </span>
          <span>Intento {exam.attemptNumber || 1}/{exam.maxAttempts}</span>
        </div>
        <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm font-medium">
          Iniciar Examen
        </button>
      </div>
    );
  };

  const AnnouncementCard = ({ announcement }) => (
    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded">
          <Bell className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm mb-1">
            {announcement.title}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            {announcement.content}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{announcement.courseTitle || 'Anuncio Global'}</span>
            <span>•</span>
            <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi Panel de Aprendizaje</h1>
          <p className="text-gray-600 mt-1">Bienvenido de nuevo, continúa donde lo dejaste</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={BookOpen}
            title="Cursos en Progreso"
            value={dashboardData.stats.coursesInProgress}
            color="#3B82F6"
          />
          <StatCard
            icon={Award}
            title="Cursos Completados"
            value={dashboardData.stats.coursesCompleted}
            color="#10B981"
          />
          <StatCard
            icon={TrendingUp}
            title="Promedio General"
            value={`${dashboardData.stats.averageScore.toFixed(1)}%`}
            color="#F59E0B"
          />
          <StatCard
            icon={Clock}
            title="Horas de Aprendizaje"
            value={dashboardData.stats.totalHoursLearned}
            subtitle="Este mes"
            color="#8B5CF6"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enrolled Courses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Mis Cursos</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Ver todos →
                </button>
              </div>
              <div className="space-y-4">
                {dashboardData.enrolledCourses.length > 0 ? (
                  dashboardData.enrolledCourses.slice(0, 3).map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">Aún no estás inscrito en ningún curso</p>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                      Explorar Cursos
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h2>
              <div className="bg-white rounded-lg shadow">
                <div className="divide-y">
                  <div className="p-4 flex items-center gap-3 hover:bg-gray-50">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Completaste "Módulo 3: React Hooks"
                      </p>
                      <p className="text-xs text-gray-500">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center gap-3 hover:bg-gray-50">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Nueva lección disponible en "JavaScript Avanzado"
                      </p>
                      <p className="text-xs text-gray-500">Hace 5 horas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Exams */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Próximos Exámenes</h2>
              <div className="space-y-3">
                {dashboardData.upcomingExams.length > 0 ? (
                  dashboardData.upcomingExams.map(exam => (
                    <ExamCard key={exam.id} exam={exam} />
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No hay exámenes próximos</p>
                  </div>
                )}
              </div>
            </div>

            {/* Announcements */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Anuncios</h2>
              <div className="space-y-3">
                {dashboardData.recentAnnouncements.length > 0 ? (
                  dashboardData.recentAnnouncements.slice(0, 3).map(announcement => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No hay anuncios nuevos</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;