'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    router.push('/auth/login');
  }

  return (
    <button
      onClick={logout}
      className="absolute top-4 right-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-red-700 transition"
    >
      Salir
    </button>
  );
}