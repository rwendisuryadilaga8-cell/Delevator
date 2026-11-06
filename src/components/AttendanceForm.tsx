import React, { useState, useEffect } from 'react';
import {
  AttendanceSession,
  AttendanceStatus,
  CourseClass,
  CourseSettings,
  Student,
  StudentAttendanceEntry,
  Teacher,
} from '../types';
import {
  ClipboardCheck,
  Calendar,
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  CheckCheck,
  History,
  Trash2,
  Info,
} from 'lucide-react';
import { sendDataToGas } from '../utils/gasConnector';

interface AttendanceFormProps {
  classes: CourseClass[];
  students: Student[];
  teachers: Teacher[];
  sessions: AttendanceSession[];
  settings: CourseSettings;
  onSaveSession: (session: AttendanceSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  classes,
  students,
  teachers,
  sessions,
  settings,
  onSaveSession,
  onDeleteSession,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'record' | 'history'>('record');

  // Form states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState(teachers[0]?.id || '');
  const [teacherStatus, setTeacherStatus] = useState<AttendanceStatus>('Hadir');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [topic, setTopic] = useState('');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Student presence mapping: studentId -> { status, note }
  const [studentEntries, setStudentEntries] = useState<Record<string, { status: AttendanceStatus; note: string }>>({});

  // When class changes, update duration and default teacher if available
  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
    const currentClass = classes.find((c) => c.id === selectedClassId);
    if (currentClass) {
      setDurationHours(currentClass.defaultDurationHours || 2);
      if (currentClass.defaultTeacherId) {
        setSelectedTeacherId(currentClass.defaultTeacherId);
      }
    }
  }, [selectedClassId, classes]);

  // Students belonging to current class
  const classStudents = students.filter(
    (s) => s.classId === selectedClassId && s.status === 'active'
  );

  // Initialize or update entries when class students change
  useEffect(() => {
    const initialMap: Record<string, { status: AttendanceStatus; note: string }> = {};
    classStudents.forEach((s) => {
      initialMap[s.id] = {
        status: 'Hadir', // Default hadir
        note: '',
      };
    });
    setStudentEntries(initialMap);
  }, [selectedClassId, students]);

  const handleStudentStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleStudentNoteChange = (studentId: string, note: string) => {
    setStudentEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
  };

  const markAllStudents = (status: AttendanceStatus) => {
    const updated: Record<string, { status: AttendanceStatus; note: string }> = {};
    classStudents.forEach((s) => {
      updated[s.id] = {
        status,
        note: studentEntries[s.id]?.note || '',
      };
    });
    setStudentEntries(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) {
      alert('Pilih kelas terlebih dahulu.');
      return;
    }
    if (classStudents.length === 0) {
      alert('Belum ada siswa aktif terdaftar di kelas ini.');
      return;
    }

    setIsSaving(true);
    setSyncStatus(null);

    const currentClass = classes.find((c) => c.id === selectedClassId);
    const currentTeacher = teachers.find((t) => t.id === selectedTeacherId);

    const entries: StudentAttendanceEntry[] = classStudents.map((std) => {
      const entryData = studentEntries[std.id] || { status: 'Hadir', note: '' };
      // ATURAN SPESIFIK USER:
      // Durasi jam hanya berlaku untuk siswa yang hadir saja, tidak hadir di hitung 0 jam
      const hoursAttended = entryData.status === 'Hadir' ? Number(durationHours) : 0;

      return {
        studentId: std.id,
        studentName: std.name,
        status: entryData.status,
        hoursAttended,
        note: entryData.note,
      };
    });

    const newSession: AttendanceSession = {
      id: `ses-${Date.now()}`,
      date: selectedDate,
      time: selectedTime,
      classId: selectedClassId,
      className: currentClass?.name || 'Kelas',
      teacherId: selectedTeacherId,
      teacherName: currentTeacher?.name || 'Guru',
      teacherStatus,
      durationHours: Number(durationHours) || 2,
      topic: topic.trim() || 'Materi Reguler Pertemuan',
      studentEntries: entries,
      createdAt: new Date().toISOString(),
    };

    // Save locally
    onSaveSession(newSession);

    // If Google Apps Script Web App is configured, sync to spreadsheet in real time
    if (settings.gasWebAppUrl && settings.gasWebAppUrl.trim().startsWith('https://script.google.com')) {
      setSyncStatus('Menyimpan ke Google Spreadsheet...');
      const gasRes = await sendDataToGas(settings.gasWebAppUrl, {
        action: 'saveAttendance',
        session: newSession,
      });
      if (gasRes.success) {
        setSyncStatus('✅ Berhasil tersimpan di Aplikasi & Google Spreadsheet!');
      } else {
        setSyncStatus(`⚠️ Tersimpan lokal. Google Sheets: ${gasRes.message}`);
      }
    } else {
      setSyncStatus('✅ Presensi berhasil disimpan di sistem lokal!');
    }

    setIsSaving(false);
    // Reset topic after save
    setTopic('');
  };

  // Quick statistics for current form state
  const entriesList = Object.values(studentEntries) as Array<{ status: AttendanceStatus; note: string }>;
  const currentPresentCount = entriesList.filter((e) => e.status === 'Hadir').length;
  const currentAbsentCount = classStudents.length - currentPresentCount;

  return (
    <div className="space-y-6">
      {/* Tab Switcher: Input Presensi vs Riwayat */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('record')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'record'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Form Pencatatan Absen</span>
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat Sesi Presensi ({sessions.length})</span>
          </button>
        </div>

        {activeSubTab === 'record' && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
            <Info className="w-4 h-4 text-blue-400" />
            <span>Durasi jam otomatis 0 jika siswa Tidak Hadir</span>
          </div>
        )}
      </div>

      {activeSubTab === 'record' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sesi & Informasi Kelas Card */}
          <div className="bg-[#141414] rounded-xl border border-zinc-800/90 p-6 shadow-md">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span>Detail Sesi Pelajaran & Absen Guru</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Date */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  Tanggal Pertemuan *
                </label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 text-zinc-100"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  Jam Pelajaran
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 text-zinc-100"
                />
              </div>

              {/* Class selector */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                  Pilih Pelajaran / Kelas *
                </label>
                <select
                  required
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 font-medium text-white"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id} className="bg-zinc-900 text-zinc-100">
                      {cls.name} ({cls.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Meeting Duration */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Durasi Sesi Belajar (Jam) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="10"
                  required
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-blue-800/60 bg-blue-950/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono font-bold text-blue-300"
                />
                <span className="text-[10px] text-zinc-500 mt-0.5 block">
                  *Hanya berlaku bagi siswa yang Hadir
                </span>
              </div>
            </div>

            {/* Teacher Attendance & Topic Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-zinc-800 text-xs">
              {/* Teacher Selector */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  Guru Pengajar *
                </label>
                <select
                  required
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 text-zinc-100"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id} className="bg-zinc-900 text-zinc-100">
                      {t.name} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher Attendance Status */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Absen Guru (Status Kehadiran) *
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as AttendanceStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTeacherStatus(st)}
                      className={`py-1.5 px-2 rounded-md font-bold text-xs transition-colors cursor-pointer text-center ${
                        teacherStatus === st
                          ? st === 'Hadir'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : st === 'Izin'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : st === 'Sakit'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-rose-600 text-white shadow-xs'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700/80 hover:text-zinc-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic / Materi */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Materi Pelajaran yang Disampaikan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bab 3 - Simple Present & Percakapan"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 text-zinc-100 placeholder:text-zinc-600"
                />
              </div>
            </div>
          </div>

          {/* Student Attendance Section */}
          <div className="bg-[#141414] rounded-xl border border-zinc-800/90 p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>Daftar Siswa di Kelas Ini ({classStudents.length} Siswa)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tandai kehadiran setiap siswa. Siswa yang Hadir mendapat{' '}
                  <strong className="text-white">{durationHours} Jam</strong>, tidak hadir{' '}
                  <strong className="text-rose-400">0 Jam</strong>.
                </p>
              </div>

              {/* Fast action buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 mr-1 hidden sm:inline">Set Cepat:</span>
                <button
                  type="button"
                  onClick={() => markAllStudents('Hadir')}
                  className="px-3 py-1.5 bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/60 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Semua Hadir</span>
                </button>
                <button
                  type="button"
                  onClick={() => markAllStudents('Izin')}
                  className="px-3 py-1.5 bg-amber-950/60 text-amber-300 border border-amber-800/50 hover:bg-amber-900/60 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  <span>Semua Izin</span>
                </button>
              </div>
            </div>

            {classStudents.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-xs">
                Tidak ada siswa aktif di kelas yang dipilih. Silakan tambahkan siswa di menu Daftar
                Siswa.
              </div>
            ) : (
              <div className="space-y-3">
                {classStudents.map((std, idx) => {
                  const entry = studentEntries[std.id] || { status: 'Hadir', note: '' };
                  const isPresent = entry.status === 'Hadir';
                  const countedHours = isPresent ? durationHours : 0;

                  return (
                    <div
                      key={std.id}
                      className={`p-3.5 rounded-xl border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        isPresent
                          ? 'bg-emerald-950/20 border-emerald-900/40'
                          : 'bg-[#18181b] border-zinc-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-zinc-500 w-6 text-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-white">{std.name}</div>
                          <div className="text-[11px] text-zinc-400 font-mono">
                            NIS: {std.nis} • Wali: {std.parentName || '-'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Status Buttons */}
                        <div className="inline-flex rounded-lg p-1 bg-zinc-900/90 border border-zinc-800 shadow-inner">
                          {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as AttendanceStatus[]).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStudentStatusChange(std.id, st)}
                              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                                entry.status === st
                                  ? st === 'Hadir'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : st === 'Izin'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : st === 'Sakit'
                                    ? 'bg-sky-600 text-white shadow-xs'
                                    : 'bg-rose-600 text-white shadow-xs'
                                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>

                        {/* Durasi Jam Dihitung (Ketentuan: Siswa hadir dapat jam, tidak hadir = 0 jam) */}
                        <div
                          className={`px-3 py-1 rounded-lg text-xs font-bold font-mono border ${
                            isPresent
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700/50'
                          }`}
                          title={
                            isPresent
                              ? `Mendapatkan ${countedHours} Jam kehadiran`
                              : 'Tidak hadir: 0 Jam kehadiran'
                          }
                        >
                          {countedHours} Jam
                        </div>

                        {/* Note Input */}
                        <input
                          type="text"
                          placeholder="Catatan (misal: terlambat / izin acara)"
                          value={entry.note}
                          onChange={(e) => handleStudentNoteChange(std.id, e.target.value)}
                          className="text-xs px-2.5 py-1 border border-zinc-700/80 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-zinc-900 text-zinc-200 placeholder:text-zinc-600 w-full sm:w-48"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Actions & Status Feedback */}
            <div className="mt-6 pt-5 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Hadir: <strong className="text-zinc-100">{currentPresentCount} Siswa</strong>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Tidak Hadir: <strong className="text-zinc-100">{currentAbsentCount} Siswa</strong>
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {syncStatus && (
                  <span className="text-xs font-semibold text-zinc-300 animate-fade-in">
                    {syncStatus}
                  </span>
                )}
                <button
                  id="btn-save-attendance"
                  type="submit"
                  disabled={isSaving || classStudents.length === 0}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Presensi Kelas'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Riwayat Sesi Presensi */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#141414] p-4 rounded-xl border border-zinc-800 shadow-md">
            <div>
              <h3 className="font-bold text-white text-base">Riwayat Pertemuan & Presensi</h3>
              <p className="text-xs text-zinc-400">
                Daftar rekaman presensi kelas yang telah dicatat sebelumnya.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              Total {sessions.length} Sesi
            </span>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12 bg-[#141414] rounded-xl border border-zinc-800 p-8">
              <History className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">Belum Ada Riwayat Presensi</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Catat presensi pertama Anda menggunakan tab Form Pencatatan Absen.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((sess) => {
                const presentStudents = sess.studentEntries.filter((e) => e.status === 'Hadir');
                return (
                  <div
                    key={sess.id}
                    className="bg-[#141414] rounded-xl border border-zinc-800 p-5 shadow-md hover:border-zinc-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{sess.className}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/60 text-blue-300 border border-blue-800/40">
                            {sess.durationHours} Jam Pertemuan
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          Tanggal: <strong className="text-zinc-200">{sess.date}</strong> (Pukul{' '}
                          {sess.time || '-'}) • Pengajar:{' '}
                          <strong className="text-zinc-200">{sess.teacherName}</strong> ({sess.teacherStatus})
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/40">
                          {presentStudents.length}/{sess.studentEntries.length} Hadir
                        </span>
                        <button
                          onClick={() => {
                            if (confirm('Hapus riwayat sesi presensi ini?')) {
                              onDeleteSession(sess.id);
                            }
                          }}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Sesi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-zinc-400">
                      <span className="font-semibold text-zinc-300">Materi yang diajarkan:</span>{' '}
                      <span className="italic text-zinc-300">{sess.topic || '-'}</span>
                    </div>

                    {/* Breakdown pill tags of students */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {sess.studentEntries.map((e) => (
                        <span
                          key={e.studentId}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                            e.status === 'Hadir'
                              ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40'
                              : e.status === 'Izin'
                              ? 'bg-amber-950/50 text-amber-300 border-amber-800/40'
                              : e.status === 'Sakit'
                              ? 'bg-sky-950/50 text-sky-300 border-sky-800/40'
                              : 'bg-rose-950/50 text-rose-300 border-rose-800/40'
                          }`}
                        >
                          <span>{e.studentName}</span>
                          <span className="font-bold">({e.status})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
