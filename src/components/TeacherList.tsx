import React, { useState } from 'react';
import { Teacher } from '../types';
import { Users, Plus, Edit2, Trash2, Search, Phone, BookOpen, Check, X } from 'lucide-react';

interface TeacherListProps {
  teachers: Teacher[];
  onSaveTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacherId: string) => void;
}

export const TeacherList: React.FC<TeacherListProps> = ({
  teachers,
  onSaveTeacher,
  onDeleteTeacher,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    nip: '',
    subject: '',
    phone: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      nip: `TCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      subject: '',
      phone: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tch: Teacher) => {
    setEditingTeacher(tch);
    setFormData({
      name: tch.name,
      nip: tch.nip,
      subject: tch.subject,
      phone: tch.phone,
      status: tch.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const teacher: Teacher = {
      id: editingTeacher ? editingTeacher.id : `tch-${Date.now()}`,
      name: formData.name.trim(),
      nip: formData.nip.trim() || `TCH-${Date.now().toString().slice(-4)}`,
      subject: formData.subject.trim() || 'Umum',
      phone: formData.phone.trim(),
      status: formData.status,
    };

    onSaveTeacher(teacher);
    setIsModalOpen(false);
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] p-5 rounded-xl border border-zinc-800/90 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Daftar Guru / Pengajar</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Data tenaga pendidik kursus, spesialisasi mata pelajaran, kontak, dan status aktif.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, NIP, pelajaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-700/80 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <button
            id="btn-add-teacher"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Guru</span>
          </button>
        </div>
      </div>

      {/* Grid of Teachers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.map((tch) => (
          <div
            key={tch.id}
            className="bg-[#141414] rounded-xl border border-zinc-800/90 p-5 shadow-md hover:border-zinc-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 font-bold flex items-center justify-center text-sm shrink-0">
                    {tch.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm leading-snug">{tch.name}</h3>
                    <div className="text-[11px] font-mono text-zinc-400">NIP: {tch.nip}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(tch)}
                    className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit Guru"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(tch.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Guru"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    Spesialisasi:
                  </span>
                  <span className="font-semibold text-zinc-200">{tch.subject}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <Phone className="w-3.5 h-3.5" />
                    Kontak:
                  </span>
                  <span className="font-mono text-zinc-300">{tch.phone || '-'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Status:</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tch.status === 'active'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {tch.status === 'active' ? 'Aktif Mengajar' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            </div>

            {/* Inline delete confirmation */}
            {deleteConfirmId === tch.id && (
              <div className="mt-4 p-3 bg-rose-950/50 border border-rose-800/60 rounded-lg text-xs">
                <p className="font-semibold text-rose-200">
                  Hapus pengajar {tch.name} dari daftar?
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
                      onDeleteTeacher(tch.id);
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
        ))}
      </div>

      {filteredTeachers.length === 0 && (
        <div className="text-center py-12 bg-[#141414] rounded-xl border border-zinc-800/90 p-8">
          <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Tidak ada data guru ditemukan</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Gunakan tombol Tambah Guru untuk menambahkan data pengajar kursus.
          </p>
        </div>
      )}

      {/* Modal Input & Edit Guru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#141414] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-800 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>{editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}</span>
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
                  Nama Lengkap Guru Beserta Gelar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso, M.Pd."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 text-white placeholder:text-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">NIP / ID Guru</label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono bg-zinc-900 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                    }
                    className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 text-white cursor-pointer"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Bidang Studi / Spesialisasi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bahasa Inggris, Matematika, Coding..."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 text-white placeholder:text-zinc-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono bg-zinc-900 text-white placeholder:text-zinc-500"
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
                  <span>Simpan Guru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
