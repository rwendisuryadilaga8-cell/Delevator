import React, { useState } from 'react';
import { CourseClass, Student } from '../types';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Search,
  Phone,
  MessageCircle,
  Filter,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';

interface StudentListProps {
  students: Student[];
  classes: CourseClass[];
  onSaveStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  classes,
  onSaveStudent,
  onDeleteStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    nis: '',
    classId: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Delete modal state - specific requirement: "Tambahkan Hapus pada Menu Daftar siswa"
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      nis: `SIS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      classId: classes[0]?.id || '',
      phone: '',
      parentName: '',
      parentPhone: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (std: Student) => {
    setEditingStudent(std);
    setFormData({
      name: std.name,
      nis: std.nis,
      classId: std.classId,
      phone: std.phone || '',
      parentName: std.parentName || '',
      parentPhone: std.parentPhone || '',
      status: std.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.classId) return;

    const student: Student = {
      id: editingStudent ? editingStudent.id : `std-${Date.now()}`,
      name: formData.name.trim(),
      nis: formData.nis.trim() || `SIS-${Date.now().toString().slice(-4)}`,
      classId: formData.classId,
      phone: formData.phone.trim(),
      parentName: formData.parentName.trim(),
      parentPhone: formData.parentPhone.trim(),
      status: formData.status,
      joinedDate: editingStudent?.joinedDate || new Date().toISOString().split('T')[0],
      cycleStartDate: editingStudent?.cycleStartDate,
    };

    onSaveStudent(student);
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      onDeleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  const classMap = new Map<string, string>();
  classes.forEach((c) => classMap.set(c.id, c.name));

  const filteredStudents = students.filter((std) => {
    const matchSearch =
      std.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (std.parentName && std.parentName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchClass = selectedClassFilter === 'ALL' || std.classId === selectedClassFilter;
    return matchSearch && matchClass;
  });

  return (
    <div className="space-y-6">
      {/* Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] p-5 rounded-xl border border-zinc-800/90 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <span>Daftar Siswa Kursus</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Data identitas siswa, kelas terdaftar, kontak wali murid, serta fitur Tambah, Edit, dan Hapus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-700/80 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-zinc-200 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="ALL" className="bg-zinc-900 text-zinc-100">
                Semua Kelas ({students.length})
              </option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id} className="bg-zinc-900 text-zinc-100">
                  {cls.name} ({students.filter((s) => s.classId === cls.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama / NIS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-700/80 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>

          <button
            id="btn-add-student"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Table of Students */}
      <div className="bg-[#141414] rounded-xl border border-zinc-800/90 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#18181b] text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">NIS / ID</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Kelas Terdaftar</th>
                <th className="py-3 px-4">Kontak Siswa / Ortu</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi (Edit / Hapus)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredStudents.map((std, idx) => {
                const cleanPhone = (std.parentPhone || std.phone || '').replace(/[^0-9]/g, '');
                const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

                return (
                  <tr key={std.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-zinc-500 font-mono">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-zinc-400">{std.nis}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{std.name}</div>
                      {std.parentName && (
                        <div className="text-[11px] text-zinc-400">
                          Wali: <span className="font-medium text-zinc-300">{std.parentName}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/40">
                        {classMap.get(std.classId) || 'Kelas Tidak Diketahui'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {std.phone && (
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            <Phone className="w-3 h-3 text-zinc-500" />
                            <span>{std.phone}</span>
                          </div>
                        )}
                        {std.parentPhone && (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`https://wa.me/${waNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:underline"
                              title="Kirim pesan WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>WA Ortu: {std.parentPhone}</span>
                            </a>
                          </div>
                        )}
                        {!std.phone && !std.parentPhone && (
                          <span className="text-zinc-600 italic">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          std.status === 'active'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {std.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(std)}
                          className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit Data Siswa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {/* Tombol Hapus pada menu Siswa (Permintaan user spesifik) */}
                        <button
                          onClick={() => setStudentToDelete(std)}
                          className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12 p-8">
            <GraduationCap className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Tidak ada siswa ditemukan</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Periksa pencarian atau tambahkan siswa baru dengan tombol Tambah Siswa.
            </p>
          </div>
        )}
      </div>

      {/* Modal Input & Edit Siswa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#141414] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-800 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                <span>{editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</span>
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
                <label className="block font-semibold text-zinc-300 mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Rizki"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 text-white placeholder:text-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">NIS / ID Siswa</label>
                  <input
                    type="text"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono bg-zinc-900 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Status Belajar</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                    }
                    className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 text-white font-medium cursor-pointer"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Kelas / Pelajaran *</label>
                <select
                  required
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 text-white font-medium cursor-pointer"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">No. HP Siswa</label>
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono bg-zinc-900 text-white placeholder:text-zinc-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    placeholder="Bpk / Ibu..."
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 text-white placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  No. WhatsApp Orang Tua (Untuk Notifikasi Tagihan)
                </label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
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
                  <span>Simpan Siswa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Siswa (Diminta spesifik: Tambahkan Hapus pada Menu Daftar siswa) */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141414] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-zinc-800 text-white">
            <div className="p-3 bg-rose-950/60 border border-rose-800/60 text-rose-300 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Hapus Data Siswa?</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus siswa{' '}
              <strong className="text-white">{studentToDelete.name}</strong> (NIS:{' '}
              {studentToDelete.nis})? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-3.5 py-2 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Siswa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
