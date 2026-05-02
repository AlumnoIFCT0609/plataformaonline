// ============================================
// ARCHIVO: frontend/src/components/admin/Sidebar.tsx
// ============================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, GraduationCap, BookOpen } from 'lucide-react';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/dashboard/admin',
    icon: Home,
  },
  {
    label: 'Tutores',
    href: '/dashboard/admin/tutores',
    icon: Users,
  },
  {
    label: 'Alumnos',
    href: '/dashboard/admin/alumnos',
    icon: GraduationCap,
  },
  {
    label: 'Cursos',
    href: '/dashboard/admin/cursos',
    icon: BookOpen,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">Panel Admin</h2>
      </div>

      <nav className="px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg
                transition-colors duration-200
                ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}