import React from 'react';
import { AttendanceSession, CourseClass, CourseSettings, Student, StudentRecap, Teacher } from '../types';
import {
  GraduationCap,
  Users,
  BookOpen,
  Clock,
  ClipboardCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { NavTab } from './Navbar';

interface DashboardProps {
  students: Student[];
  teachers: Teacher[];
  classes: CourseClass[];
  sessions: AttendanceSession[];
  recaps: StudentRecap[];
  settings: CourseSettings;
  setCurrentTab: (tab: NavTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  teachers,
  classes,
  sessions,
  recaps,
  settings,
  setCurrentTab,
}) => {
  // Hitung total jam belajar (hanya yang hadir)
  const totalAttendedHours = recaps.reduce((acc, r) => acc + r.totalHours, 0);
  const totalPresentSessions = recaps.reduce((acc, r) => acc + r.totalPresent, 0);

  // Siswa yang mencapai ambang invoice (>= 4 pertemuan ATAU >= 8 jam)
  const invoiceReadyStudents = recaps.filter((r) => r.isInvoiceReady);

  // Hitung persentase kehadiran siswa
  let totalHadirCount = 0;
  let totalIzinCount = 0;
  let totalSakitCount = 0;
  let totalAlpaCount = 0;

  sessions.forEach((sess) => {
    sess.studentEntries.forEach((entry) => {
      if (entry.status === 'Hadir') totalHadirCount++;
      else if (entry.status === 'Izin') totalIzinCount++;
      else if (entry.status === 'Sakit') totalSakitCount++;
      else if (entry.status === 'Alpa') totalAlpaCount++;
    });
  });

  const totalEntries = totalHadirCount + totalIzinCount + totalSakitCount + totalAlpaCount;
  const presenceRate = totalEntries > 0 ? Math.round((totalHadirCount / totalEntries) * 100) : 0;

  // Sesi terbaru (5 terakhir)
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#161616] via-[#1c1c20] to-[#161616] border border-zinc-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 text-blue-400 border border-zinc-700/60 text-xs font-medium mb-3 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Sistem Terintegrasi Google Spreadsheet & Apps Script</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Selamat Datang di {settings.courseName}
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-2xl leading-relaxed">
            Kelola data kelas, siswa, guru, pencatatan absensi harian, serta pemantauan otomatis
            ambang tagihan invoice 4x pertemuan atau 8 jam belajar.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-quick-attendance"
            onClick={() => setCurrentTab('attendance')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ClipboardCheck className="w-4 h-4 text-blue-600" />
            <span>Catat Absen Sekarang</span>
          </button>
          <button
            id="btn-quick-recap"
            onClick={() => setCurrentTab('recap')}
            className="px-4 py-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm border border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-zinc-400" />
            <span>Lihat Rekap</span>
          </button>
        </div>
      </div>

      {/* Invoice Alert Bar if threshold met */}
      {invoiceReadyStudents.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-900/60 text-amber-300 border border-amber-700/50 rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-200">
                Pemberitahuan Invoice:{' '}
                <span className="underline">{invoiceReadyStudents.length} Siswa</span> Telah Mencapai
                Ambang Tagihan!
              </h3>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Siswa telah menyelesaikan minimal 4x pertemuan atau 8 jam belajar. Tagihan kursus siap
                diterbitkan dan dicetak di tab baru.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentTab('recap')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition-colors shrink-0 shadow-md cursor-pointer"
          >
            <span>Buka Rekap & Cetak Invoice</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#141414] p-5 rounded-xl border border-zinc-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Siswa
            </span>
            <div className="p-2 bg-blue-950/50 text-blue-400 border border-blue-800/40 rounded-lg">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            {students.length}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {students.filter((s) => s.status === 'active').length} siswa aktif
          </div>
        </div>

        <div className="bg-[#141414] p-5 rounded-xl border border-zinc-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Guru
            </span>
            <div className="p-2 bg-indigo-950/50 text-indigo-400 border border-indigo-800/40 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            {teachers.length}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Pengajar terdaftar</div>
        </div>

        <div className="bg-[#141414] p-5 rounded-xl border border-zinc-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Kelas
            </span>
            <div className="p-2 bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            {classes.length}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Program kursus aktif</div>
        </div>

        <div className="bg-[#141414] p-5 rounded-xl border border-zinc-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Jam Belajar Hadir
            </span>
            <div className="p-2 bg-purple-950/50 text-purple-400 border border-purple-800/40 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            {totalAttendedHours}{' '}
            <span className="text-sm font-normal text-zinc-500">Jam</span>
          </div>
          <div className="mt-1 text-xs text-zinc-500">Akumulasi siswa hadir</div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-[#141414] p-5 rounded-xl border border-zinc-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Tagihan Siap
            </span>
            <div className="p-2 bg-amber-950/50 text-amber-400 border border-amber-800/40 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-amber-400">
            {invoiceReadyStudents.length}
          </div>
          <div className="mt-1 text-xs text-zinc-500">≥ 4x atau ≥ 8 jam</div>
        </div>
      </div>

      {/* Analytics & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Breakdown Card */}
        <div className="bg-[#141414] rounded-xl border border-zinc-800/90 p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Tingkat Kehadiran Siswa</span>
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-800/40">
              {presenceRate}% Hadir
            </span>
          </div>

          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Hadir ({totalHadirCount})
                </span>
                <span className="text-zinc-400">
                  {totalEntries > 0 ? Math.round((totalHadirCount / totalEntries) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${totalEntries > 0 ? (totalHadirCount / totalEntries) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Izin ({totalIzinCount})
                </span>
                <span className="text-zinc-400">
                  {totalEntries > 0 ? Math.round((totalIzinCount / totalEntries) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${totalEntries > 0 ? (totalIzinCount / totalEntries) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  Sakit ({totalSakitCount})
                </span>
                <span className="text-zinc-400">
                  {totalEntries > 0 ? Math.round((totalSakitCount / totalEntries) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-sky-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${totalEntries > 0 ? (totalSakitCount / totalEntries) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Alpa ({totalAlpaCount})
                </span>
                <span className="text-zinc-400">
                  {totalEntries > 0 ? Math.round((totalAlpaCount / totalEntries) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${totalEntries > 0 ? (totalAlpaCount / totalEntries) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-lg bg-[#18181b] border border-zinc-800 text-xs text-zinc-400 leading-relaxed">
            <span className="font-semibold text-zinc-200">Aturan Durasi Jam:</span> Durasi jam hanya
            dihitung dan terakumulasi untuk siswa yang berstatus <strong>Hadir</strong>. Ketidakhadiran
            (Izin/Sakit/Alpa) dihitung <strong>0 Jam</strong>.
          </div>
        </div>

        {/* Invoice Target Progress List */}
        <div className="bg-[#141414] rounded-xl border border-zinc-800/90 p-6 shadow-md lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Status Siklus Kehadiran & Invoice Siswa
              </h3>
              <p className="text-xs text-zinc-400">
                Ketentuan otomatis: Ambang tercapai bila siswa hadir 4x pertemuan ATAU 8 jam
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('recap')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Semua Siswa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#18181b] text-zinc-400 font-semibold border-y border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3">Kelas</th>
                  <th className="py-2.5 px-3 text-center">Kehadiran</th>
                  <th className="py-2.5 px-3 text-center">Total Jam</th>
                  <th className="py-2.5 px-3">Status Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {recaps.slice(0, 5).map((r) => {
                  const progressSession = Math.min(100, Math.round((r.totalPresent / 4) * 100));
                  return (
                    <tr key={r.student.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{r.student.name}</div>
                        <div className="text-[11px] text-zinc-500 font-mono">
                          NIS: {r.student.nis}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-zinc-300 font-medium">{r.className}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-zinc-100">{r.totalPresent}</span>
                        <span className="text-zinc-500">/4 sesi</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-blue-400">{r.totalHours}</span>
                        <span className="text-zinc-500">/8 jam</span>
                      </td>
                      <td className="py-3 px-3">
                        {r.isInvoiceReady ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950/70 text-amber-300 border border-amber-700/60 animate-pulse">
                            <CheckCircle2 className="w-3 h-3 text-amber-400" />
                            Siap Terbit Invoice
                          </span>
                        ) : (
                          <div className="w-28">
                            <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                              <span>Progres</span>
                              <span>{progressSession}%</span>
                            </div>
                            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-blue-500 h-1.5 rounded-full"
                                style={{ width: `${progressSession}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Sessions List */}
      <div className="bg-[#141414] rounded-xl border border-zinc-800/90 p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Riwayat Sesi Absensi Terakhir</h3>
            <p className="text-xs text-zinc-400">Pencatatan kelas, guru, dan kehadiran siswa</p>
          </div>
          <button
            onClick={() => setCurrentTab('attendance')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Tambah Presensi Baru</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentSessions.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">
            Belum ada riwayat presensi tercatat.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSessions.map((sess) => {
              const presentCount = sess.studentEntries.filter((e) => e.status === 'Hadir').length;
              return (
                <div
                  key={sess.id}
                  className="p-4 rounded-xl border border-zinc-800 bg-[#18181b] hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      {sess.date}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-950/60 text-blue-300 border border-blue-800/40 font-semibold text-[11px]">
                      {sess.durationHours} Jam
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm line-clamp-1">{sess.className}</h4>
                  <div className="text-xs text-zinc-300 mt-1">
                    Guru:{' '}
                    <span className="font-medium text-white">{sess.teacherName}</span> (
                    <span
                      className={
                        sess.teacherStatus === 'Hadir' ? 'text-emerald-400 font-semibold' : 'text-amber-400'
                      }
                    >
                      {sess.teacherStatus}
                    </span>
                    )
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 line-clamp-1 italic">
                    Materi: {sess.topic || '-'}
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">
                      Kehadiran Siswa:{' '}
                      <strong className="text-zinc-100">
                        {presentCount}/{sess.studentEntries.length} Hadir
                      </strong>
                    </span>
                    <span className="text-emerald-300 font-semibold text-[11px] bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                      +{presentCount * sess.durationHours} Jam Total
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
