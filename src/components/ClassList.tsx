import React, { useState } from 'react';
import { CourseClass, Student, Teacher } from '../types';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  Users,
  Clock,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface ClassListProps {
  classes: CourseClass[];
  students: Student[];
  teachers: Teacher[];
  onSaveClass: (cls: CourseClass) => void;
  onDeleteClass: (classId: string) => void;
}

export const ClassList: React.FC<ClassListProps> = ({
  classes,
  students,
  teachers,
  onSaveClass,
  onDeleteClass,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<CourseClass | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    defaultDurationHours: 2,
    defaultTeacherId: '',
    feePerSession: 150000,
    description: '',
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      code: `CLS-${Math.floor(100 + Math.random() * 900)}`,
      defaultDurationHours: 2,
      defaultTeacherId: teachers[0]?.id || '',
      feePerSession: 150000,
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cls: CourseClass) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      code: cls.code,
      defaultDurationHours: cls.defaultDurationHours,
      defaultTeacherId: cls.defaultTeacherId || '',
      feePerSession: cls.feePerSession || 150000,
      description: cls.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newClass: CourseClass = {
      id: editingClass ? editingClass.id : `cls-${Date.now()}`,
      name: formData.name.trim(),
      code: formData.code.trim() || `CLS-${Date.now().toString().slice(-4)}`,
      defaultDurationHours: Number(formData.defaultDurationHours) || 2,
      defaultTeacherId: formData.defaultTeacherId || undefined,
      feePerSession: Number(formData.feePerSession) || 0,
      description: formData.description.trim(),
    };

    onSaveClass(newClass);
    setIsModalOpen(false);
  };

  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] p-5 rounded-xl border border-zinc-800/90 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span>Daftar Kelas & Pelajaran</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Kelola mata pelajaran kursus, durasi standar jam belajar, dan guru pengampu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama atau kode kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-700/80 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <button
            id="btn-add-class"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas</span>
          </button>
        </div>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClasses.map((cls) => {
          const studentCount = students.filter((s) => s.classId === cls.id).length;
          const assignedTeacher = teachers.find((t) => t.id === cls.defaultTeacherId);

          return (
            <div
              key={cls.id}
              className="bg-[#141414] rounded-xl border border-zinc-800/90 p-5 shadow-md hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {cls.code}
                    </span>
                    <h3 className="font-bold text-white text-base mt-2">{cls.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(cls)}
                      className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Kelas"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(cls.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Kelas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                  {cls.description || 'Tidak ada keterangan khusus.'}
                </p>

                <div className="mt-4 pt-3 border-t border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <Clock className="w-3.5 h-3.5" />
                      Durasi Standar:
                    </span>
                    <span className="font-semibold text-zinc-200">
                      {cls.defaultDurationHours} Jam / Pertemuan
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <Users className="w-3.5 h-3.5" />
                      Jumlah Siswa:
                    </span>
                    <span className="font-semibold text-blue-400">{studentCount} Siswa</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Guru Default:</span>
                    <span className="font-medium text-zinc-300 truncate max-w-[150px]">
                      {assignedTeacher ? assignedTeacher.name : 'Belum Ditentukan'}
                    </span>
                  </div>

                  {cls.feePerSession !== undefined && cls.feePerSession > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Tarif / Sesi:</span>
                      <span className="font-mono font-semibold text-emerald-400">
                        Rp {cls.feePerSession.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delete confirmation inline */}
              {deleteConfirmId === cls.id && (
                <div className="mt-4 p-3 bg-rose-950/50 border border-rose-800/60 rounded-lg text-xs">
                  <p className="font-semibold text-rose-200">
                    Hapus kelas ini? Siswa di kelas ini tetap ada di data.
                  </p>
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2.5 py-1 text-zinc-400 hover:bg-zinc-800 rounded text-[11px] font-medium cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => {
                        onDeleteClass(cls.id);
                        setDeleteConfirmId(null);
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-semibold cursor-pointer shadow-sm"
                    >
                      Ya, Hapus
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12 bg-[#141414] rounded-xl border border-zinc-800/90 p-8">
          <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Tidak ada kelas ditemukan</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Gunakan tombol Tambah Kelas untuk membuat mata pelajaran atau program kursus baru.
          </p>
        </div>
      )}

      {/* Modal Input & Edit Kelas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#141414] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-800 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span>{editingClass ? 'Edit Kelas Kursus' : 'Tambah Kelas Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Nama Kelas / Mata Pelajaran *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bahasa Inggris Percakapan Dasar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 text-white placeholder:text-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Kode Kelas</label>
                  <input
                    type="text"
                    placeholder="ENG-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono bg-zinc-900 text-white placeholder:text-zinc-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Durasi Jam / Pertemuan *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="8"
                    required
                    value={formData.defaultDurationHours}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultDurationHours: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono font-bold bg-zinc-900 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Guru Pengampu Default
                </label>
                <select
                  value={formData.defaultTeacherId}
                  onChange={(e) => setFormData({ ...formData, defaultTeacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 text-white cursor-pointer"
                >
                  <option value="">-- Pilih Guru Pengajar --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Tarif Kursus per Sesi (Rp)
                </label>
                <input
                  type="number"
                  step="5000"
                  min="0"
                  value={formData.feePerSession}
                  onChange={(e) =>
                    setFormData({ ...formData, feePerSession: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono bg-zinc-900 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Deskripsi / Catatan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan silabus atau target belajar..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 text-white placeholder:text-zinc-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Kelas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
