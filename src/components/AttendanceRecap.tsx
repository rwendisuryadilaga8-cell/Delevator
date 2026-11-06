import React, { useState } from 'react';
import { CourseClass, CourseSettings, Student, StudentRecap, TeacherRecap } from '../types';
import {
  FileSpreadsheet,
  Printer,
  Bell,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  RotateCcw,
  Calendar,
  ExternalLink,
  Users,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { openInvoicePrintWindow } from '../utils/printInvoice';

interface AttendanceRecapProps {
  recaps: StudentRecap[];
  teacherRecaps: TeacherRecap[];
  classes: CourseClass[];
  settings: CourseSettings;
  onResetStudentCycle: (studentId: string) => void;
}

export const AttendanceRecap: React.FC<AttendanceRecapProps> = ({
  recaps,
  teacherRecaps,
  classes,
  settings,
  onResetStudentCycle,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [onlyInvoiceReady, setOnlyInvoiceReady] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<StudentRecap | null>(null);

  // Filter recaps
  const filteredRecaps = recaps.filter((r) => {
    const matchSearch =
      r.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student.nis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = selectedClass === 'ALL' || r.student.classId === selectedClass;
    const matchInvoice = !onlyInvoiceReady || r.isInvoiceReady;
    return matchSearch && matchClass && matchInvoice;
  });

  const invoiceReadyCount = recaps.filter((r) => r.isInvoiceReady).length;
  const totalBillableAmount = recaps
    .filter((r) => r.isInvoiceReady)
    .reduce((sum, r) => sum + r.totalHours * (settings.hourlyRate || 75000), 0);

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] p-5 rounded-xl border border-zinc-800/90 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            <span>Rekapitulasi Presensi & Tagihan Kursus</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Akumulasi kehadiran siswa (durasi jam dihitung jika hadir) dan pemberitahuan invoice
            otomatis saat mencapai 4x pertemuan atau 8 jam.
          </p>
        </div>

        {/* Tab Switcher: Rekap Siswa vs Rekap Guru */}
        <div className="inline-flex rounded-xl p-1 bg-zinc-900 border border-zinc-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'students'
                ? 'bg-zinc-800 text-white border border-zinc-700/80 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Rekap Siswa ({recaps.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'teachers'
                ? 'bg-zinc-800 text-white border border-zinc-700/80 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Rekap Guru ({teacherRecaps.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'students' ? (
        <>
          {/* Notification Banner for Ready Invoices */}
          {invoiceReadyCount > 0 && (
            <div className="bg-gradient-to-r from-[#241508] via-[#331d0b] to-[#241508] border border-amber-600/50 text-white p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl backdrop-blur-xs">
                  <Bell className="w-6 h-6 text-amber-300 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-amber-200">
                    Pemberitahuan Invoice: {invoiceReadyCount} Siswa Siap Ditagih!
                  </h3>
                  <p className="text-xs text-amber-300/80 mt-0.5">
                    Siswa telah mencapai batas kuota 4x pertemuan atau 8 jam kehadiran. Estimasi total
                    tagihan siap cetak: <strong className="text-white">Rp {totalBillableAmount.toLocaleString('id-ID')}</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOnlyInvoiceReady(!onlyInvoiceReady)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    onlyInvoiceReady
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-zinc-800/80 hover:bg-zinc-700 text-amber-200 border border-amber-700/50'
                  }`}
                >
                  {onlyInvoiceReady ? '✓ Menampilkan Hanya Siap Invoice' : 'Filter Yang Siap Invoice'}
                </button>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141414] p-4 rounded-xl border border-zinc-800">
            <div className="flex flex-wrap items-center gap-3">
              {/* Class Filter */}
              <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-700/80 text-xs">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-transparent border-none text-xs text-zinc-200 font-medium focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL" className="bg-zinc-900 text-zinc-100">
                    Semua Kelas ({recaps.length})
                  </option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id} className="bg-zinc-900 text-zinc-100">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Invoice Ready Toggle */}
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyInvoiceReady}
                  onChange={(e) => setOnlyInvoiceReady(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-zinc-700 bg-zinc-900"
                />
                <span>Hanya Tampilkan yang Siap Invoice (≥4x / ≥8 Jam)</span>
              </label>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari siswa atau NIS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
          </div>

          {/* Recaps Table */}
          <div className="bg-[#141414] rounded-xl border border-zinc-800/90 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18181b] text-zinc-400 font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4 text-center">Hadir</th>
                    <th className="py-3 px-4 text-center">Izin/Sakit/Alpa</th>
                    <th className="py-3 px-4 text-center">Total Jam Hadir</th>
                    <th className="py-3 px-4">Status & Ambang Invoice</th>
                    <th className="py-3 px-4 text-center">Aksi & Cetak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredRecaps.map((item) => {
                    const sessionProgress = Math.min(100, Math.round((item.totalPresent / 4) * 100));
                    const hoursProgress = Math.min(100, Math.round((item.totalHours / 8) * 100));

                    return (
                      <tr
                        key={item.student.id}
                        className={`transition-colors ${
                          item.isInvoiceReady
                            ? 'bg-amber-950/20 hover:bg-amber-950/30'
                            : 'hover:bg-zinc-800/40'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{item.student.name}</div>
                          <div className="text-[11px] text-zinc-500 font-mono">
                            NIS: {item.student.nis} • Wali: {item.student.parentName || '-'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-medium text-zinc-300">{item.className}</span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                            {item.totalPresent} Pertemuan
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center text-zinc-400">
                          <span title="Izin">{item.totalPermission} I</span> /{' '}
                          <span title="Sakit">{item.totalSick} S</span> /{' '}
                          <span title="Alpa">{item.totalAbsent} A</span>
                        </td>

                        {/* Durasi Jam Kehadiran (Hanya dihitung jika Hadir) */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="font-mono font-bold text-blue-400 text-sm">
                            {item.totalHours} Jam
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            {item.totalHours >= 8 ? 'Target 8 Jam tercapai' : `${8 - item.totalHours} jam menuju target`}
                          </div>
                        </td>

                        {/* Status Invoice & Ambang */}
                        <td className="py-3.5 px-4">
                          {item.isInvoiceReady ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-950/80 text-amber-300 border border-amber-700/60">
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                                <span>SIAP INVOICE!</span>
                              </span>
                              <div className="text-[11px] font-semibold text-amber-300">
                                {item.invoiceThresholdReason}
                              </div>
                            </div>
                          ) : (
                            <div className="w-36 space-y-1">
                              <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                                <span>{item.totalPresent}/4 Sesi</span>
                                <span>{item.totalHours}/8 Jam</span>
                              </div>
                              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-blue-500 h-1.5 rounded-full"
                                  style={{
                                    width: `${Math.max(sessionProgress, hoursProgress)}%`,
                                  }}
                                />
                              </div>
                              <div className="text-[10px] text-zinc-500">Belum mencapai ambang</div>
                            </div>
                          )}
                        </td>

                        {/* Actions: Cetak Preview Tab Baru & Reset Cycle */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Tombol Cetak Preview Tab Baru (Permintaan Spesifik User) */}
                            <button
                              id={`btn-print-invoice-${item.student.id}`}
                              onClick={() => openInvoicePrintWindow(item, settings)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
                              title="Cetak invoice & riwayat di tab baru browser"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Cetak (Tab Baru)</span>
                            </button>

                            {/* Tombol Riwayat Detail Modal */}
                            <button
                              onClick={() => setSelectedStudentForHistory(item)}
                              className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                              title="Lihat Rincian Riwayat Absen"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>

                            {/* Reset Siklus jika sudah diterbitkan invoice */}
                            {item.isInvoiceReady && (
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Mulai siklus tagihan baru untuk siswa ${item.student.name}? Kehadiran sebelumnya tetap tersimpan di riwayat.`
                                    )
                                  ) {
                                    onResetStudentCycle(item.student.id);
                                  }
                                }}
                                className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Reset Siklus Tagihan (Invoice Sudah Lunas)"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredRecaps.length === 0 && (
              <div className="text-center py-12 p-8">
                <FileSpreadsheet className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">Tidak ada data rekap ditemukan</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Coba ganti filter kelas atau kata kunci pencarian.
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Rekap Guru */
        <div className="bg-[#141414] rounded-xl border border-zinc-800/90 shadow-md overflow-hidden">
          <div className="p-5 border-b border-zinc-800">
            <h3 className="text-base font-bold text-white">Rekapitulasi Mengajar Guru</h3>
            <p className="text-xs text-zinc-400">
              Total sesi pertemuan dan jam mengajar guru yang telah terlaksana.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#18181b] text-zinc-400 font-semibold border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Nama Guru</th>
                  <th className="py-3 px-4">NIP / ID</th>
                  <th className="py-3 px-4">Bidang Studi</th>
                  <th className="py-3 px-4 text-center">Sesi Terjadwal</th>
                  <th className="py-3 px-4 text-center">Sesi Hadir</th>
                  <th className="py-3 px-4 text-center">Total Jam Mengajar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {teacherRecaps.map((tr) => (
                  <tr key={tr.teacher.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{tr.teacher.name}</td>
                    <td className="py-3.5 px-4 font-mono text-zinc-500">{tr.teacher.nip}</td>
                    <td className="py-3.5 px-4 font-medium text-zinc-300">{tr.teacher.subject}</td>
                    <td className="py-3.5 px-4 text-center font-medium text-zinc-300">
                      {tr.totalSessionsScheduled} Sesi
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                        {tr.totalSessionsPresent} Sesi Hadir
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-400 text-sm">
                      {tr.totalHoursTaught} Jam
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Detail Riwayat Kehadiran Per Siswa */}
      {selectedStudentForHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141414] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-800 max-h-[90vh] flex flex-col text-zinc-100">
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Rincian Kehadiran: {selectedStudentForHistory.student.name}
                </h3>
                <p className="text-xs text-zinc-400">
                  NIS: {selectedStudentForHistory.student.nis} • Kelas:{' '}
                  {selectedStudentForHistory.className}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForHistory(null)}
                className="text-zinc-400 hover:text-white p-1.5 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-4 overflow-y-auto space-y-3 text-xs flex-1">
              <div className="grid grid-cols-3 gap-3 p-3 bg-[#18181b] rounded-xl border border-zinc-800 text-center">
                <div>
                  <div className="text-zinc-400 text-[11px]">Total Pertemuan Hadir</div>
                  <div className="text-lg font-bold text-emerald-400">
                    {selectedStudentForHistory.totalPresent}x
                  </div>
                </div>
                <div>
                  <div className="text-zinc-400 text-[11px]">Total Jam Belajar</div>
                  <div className="text-lg font-bold text-blue-400">
                    {selectedStudentForHistory.totalHours} Jam
                  </div>
                </div>
                <div>
                  <div className="text-zinc-400 text-[11px]">Status Invoice</div>
                  <div
                    className={`text-xs font-bold mt-1 ${
                      selectedStudentForHistory.isInvoiceReady
                        ? 'text-amber-400'
                        : 'text-zinc-400'
                    }`}
                  >
                    {selectedStudentForHistory.isInvoiceReady ? 'Siap Diterbitkan' : 'Sedang Berjalan'}
                  </div>
                </div>
              </div>

              <h4 className="font-bold text-white mt-2">Log Riwayat Tiap Sesi:</h4>
              {selectedStudentForHistory.attendanceHistory.length === 0 ? (
                <div className="text-center py-6 text-zinc-500">Belum ada riwayat tercatat.</div>
              ) : (
                <div className="space-y-2">
                  {selectedStudentForHistory.attendanceHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#18181b] border border-zinc-800 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{item.date}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'Hadir'
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                                : 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="font-mono text-blue-400 font-semibold">{item.hours} Jam</span>
                        </div>
                        <div className="text-zinc-400 text-[11px] mt-0.5">
                          Guru: {item.teacherName} • Materi: {item.topic}
                        </div>
                        {item.note && (
                          <div className="text-amber-300 text-[11px] mt-0.5 italic">
                            Catatan: {item.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => openInvoicePrintWindow(selectedStudentForHistory, settings)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Invoice di Tab Baru</span>
              </button>
              <button
                onClick={() => setSelectedStudentForHistory(null)}
                className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold hover:bg-zinc-800 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
