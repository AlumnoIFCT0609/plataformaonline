// ============================================
// ARCHIVO: frontend/components/common/DeleteConfirmationModal.tsx
// ============================================

'use client';

import { useState } from 'react';
import { X, AlertTriangle, Archive, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hardDelete: boolean) => Promise<void>;
  itemType: 'tutor' | 'alumno' | 'curso';
  itemName: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemType,
  itemName,
}: DeleteConfirmationModalProps) {
  const [selectedOption, setSelectedOption] = useState<'archive' | 'delete'>('archive');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(selectedOption === 'delete');
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabels = () => {
    switch (itemType) {
      case 'tutor':
        return {
          singular: 'el tutor',
          action: 'desactivar',
          archiveTitle: 'Desactivar tutor',
          archiveDesc: 'El tutor quedará inactivo pero sus datos se mantendrán. Podrás reactivarlo más tarde.',
          deleteTitle: 'Eliminar tutor permanentemente',
          deleteDesc: 'Se eliminarán todos los datos del tutor de forma permanente. Esta acción NO se puede deshacer.',
        };
      case 'alumno':
        return {
          singular: 'el alumno',
          action: 'desactivar',
          archiveTitle: 'Desactivar alumno',
          archiveDesc: 'El alumno quedará inactivo pero sus datos se mantendrán. Podrás reactivarlo más tarde.',
          deleteTitle: 'Eliminar alumno permanentemente',
          deleteDesc: 'Se eliminarán todos los datos del alumno de forma permanente. Esta acción NO se puede deshacer.',
        };
      case 'curso':
        return {
          singular: 'el curso',
          action: 'archivar',
          archiveTitle: 'Archivar curso',
          archiveDesc: 'El curso quedará archivado y no será visible para nuevos alumnos. Los alumnos actuales mantendrán acceso.',
          deleteTitle: 'Eliminar curso permanentemente',
          deleteDesc: 'Se eliminará el curso y TODO su contenido (módulos, lecciones, etc.) de forma permanente. Esta acción NO se puede deshacer.',
        };
    }
  };

  const labels = getTypeLabels();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              ¿Qué deseas hacer con {labels.singular}?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 mb-4">
            <strong>{itemName}</strong>
          </p>

          {/* Option 1: Archive/Deactivate */}
          <label
            className={`
              flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer
              transition-all duration-200
              ${
                selectedOption === 'archive'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <input
              type="radio"
              name="deleteOption"
              value="archive"
              checked={selectedOption === 'archive'}
              onChange={(e) => setSelectedOption(e.target.value as 'archive')}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Archive size={20} className="text-blue-600" />
                <h3 className="font-semibold text-gray-800">
                  {labels.archiveTitle}
                </h3>
              </div>
              <p className="text-sm text-gray-600">{labels.archiveDesc}</p>
            </div>
          </label>

          {/* Option 2: Permanent Delete */}
          <label
            className={`
              flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer
              transition-all duration-200
              ${
                selectedOption === 'delete'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <input
              type="radio"
              name="deleteOption"
              value="delete"
              checked={selectedOption === 'delete'}
              onChange={(e) => setSelectedOption(e.target.value as 'delete')}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Trash2 size={20} className="text-red-600" />
                <h3 className="font-semibold text-gray-800">
                  {labels.deleteTitle}
                </h3>
              </div>
              <p className="text-sm text-gray-600">{labels.deleteDesc}</p>
            </div>
          </label>

          {/* Warning */}
          {selectedOption === 'delete' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  ⚠️ Advertencia
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Esta acción es irreversible. Una vez eliminado, no podrás recuperar la información.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`
              flex-1 px-4 py-2 rounded-lg text-white font-medium
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              ${
                selectedOption === 'archive'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            `}
          >
            {loading
              ? 'Procesando...'
              : selectedOption === 'archive'
              ? labels.action.charAt(0).toUpperCase() + labels.action.slice(1)
              : 'Eliminar permanentemente'}
          </button>
        </div>
      </div>
    </div>
  );
}