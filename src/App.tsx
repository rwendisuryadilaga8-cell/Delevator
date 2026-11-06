import React, { useState, useEffect, useMemo } from 'react';
import {
  AttendanceSession,
  CourseClass,
  CourseSettings,
  Student,
  Teacher,
} from './types';
import {
  calculateStudentRecaps,
  calculateTeacherRecaps,
  loadClasses,
  loadSessions,
  loadSettings,
  loadStudents,
  loadTeachers,
  saveClasses,
  saveSessions,
  saveSettings,
  saveStudents,
  saveTeachers,
} from './utils/storage';
import { Navbar, NavTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { AttendanceForm } from './components/AttendanceForm';
import { AttendanceRecap } from './components/AttendanceRecap';
import { ClassList } from './components/ClassList';
import { StudentList } from './components/StudentList';
import { TeacherList } from './components/TeacherList';
import { SettingsView } from './components/SettingsView';
import { GasIntegrationView } from './components/GasIntegrationView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Core application data loaded from storage
  const [settings, setSettings] = useState<CourseSettings>(loadSettings);
  const [classes, setClasses] = useState<CourseClass[]>(loadClasses);
  const [students, setStudents] = useState<Student[]>(loadStudents);
  const [teachers, setTeachers] = useState<Teacher[]>(loadTeachers);
  const [sessions, setSessions] = useState<AttendanceSession[]>(loadSessions);

  // Synchronize state changes to local storage
  const handleSaveSettings = (newSettings: CourseSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleSaveClass = (cls: CourseClass) => {
    const exists = classes.some((c) => c.id === cls.id);
    const updated = exists ? classes.map((c) => (c.id === cls.id ? cls : c)) : [...classes, cls];
    setClasses(updated);
    saveClasses(updated);
  };

  const handleDeleteClass = (classId: string) => {
    const updated = classes.filter((c) => c.id !== classId);
    setClasses(updated);
    saveClasses(updated);
  };

  const handleSaveStudent = (std: Student) => {
    const exists = students.some((s) => s.id === std.id);
    const updated = exists
      ? students.map((s) => (s.id === std.id ? std : s))
      : [...students, std];
    setStudents(updated);
    saveStudents(updated);
  };

  // Specific requirement: "Tambahkan Hapus pada Menu Daftar siswa"
  const handleDeleteStudent = (studentId: string) => {
    const updated = students.filter((s) => s.id !== studentId);
    setStudents(updated);
    saveStudents(updated);
  };

  const handleSaveTeacher = (tch: Teacher) => {
    const exists = teachers.some((t) => t.id === tch.id);
    const updated = exists
      ? teachers.map((t) => (t.id === tch.id ? tch : t))
      : [...teachers, tch];
    setTeachers(updated);
    saveTeachers(updated);
  };

  const handleDeleteTeacher = (teacherId: string) => {
    const updated = teachers.filter((t) => t.id !== teacherId);
    setTeachers(updated);
    saveTeachers(updated);
  };

  const handleSaveSession = (session: AttendanceSession) => {
    const updated = [session, ...sessions];
    setSessions(updated);
    saveSessions(updated);
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    saveSessions(updated);
  };

  // Reset siklus tagihan siswa (misal setelah invoice diterbitkan & dilunasi)
  const handleResetStudentCycle = (studentId: string) => {
    const nowStr = new Date().toISOString();
    const updated = students.map((s) =>
      s.id === studentId ? { ...s, cycleStartDate: nowStr } : s
    );
    setStudents(updated);
    saveStudents(updated);
  };

  const reloadAllData = () => {
    setSettings(loadSettings());
    setClasses(loadClasses());
    setStudents(loadStudents());
    setTeachers(loadTeachers());
    setSessions(loadSessions());
  };

  // Calculate live recaps
  // Aturan:
  // 1. Durasi jam hanya berlaku untuk siswa yang hadir, tidak hadir = 0 jam
  // 2. Pemberitahuan invoice jika siswa hadir >= 4x pertemuan ATAU >= 8 jam
  const studentRecaps = useMemo(
    () => calculateStudentRecaps(students, classes, sessions),
    [students, classes, sessions]
  );

  const teacherRecaps = useMemo(
    () => calculateTeacherRecaps(teachers, sessions),
    [teachers, sessions]
  );

  const invoiceAlertCount = useMemo(
    () => studentRecaps.filter((r) => r.isInvoiceReady).length,
    [studentRecaps]
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navbar with brand, status, and navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        settings={settings}
        invoiceAlertCount={invoiceAlertCount}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <Dashboard
            students={students}
            teachers={teachers}
            classes={classes}
            sessions={sessions}
            recaps={studentRecaps}
            settings={settings}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'attendance' && (
          <AttendanceForm
            classes={classes}
            students={students}
            teachers={teachers}
            sessions={sessions}
            settings={settings}
            onSaveSession={handleSaveSession}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {currentTab === 'recap' && (
          <AttendanceRecap
            recaps={studentRecaps}
            teacherRecaps={teacherRecaps}
            classes={classes}
            settings={settings}
            onResetStudentCycle={handleResetStudentCycle}
          />
        )}

        {currentTab === 'classes' && (
          <ClassList
            classes={classes}
            students={students}
            teachers={teachers}
            onSaveClass={handleSaveClass}
            onDeleteClass={handleDeleteClass}
          />
        )}

        {currentTab === 'students' && (
          <StudentList
            students={students}
            classes={classes}
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        )}

        {currentTab === 'teachers' && (
          <TeacherList
            teachers={teachers}
            onSaveTeacher={handleSaveTeacher}
            onDeleteTeacher={handleDeleteTeacher}
          />
        )}

        {currentTab === 'gas' && <GasIntegrationView settings={settings} />}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            classes={classes}
            students={students}
            teachers={teachers}
            sessions={sessions}
            onSaveSettings={handleSaveSettings}
            onReloadAllData={reloadAllData}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#0d0d0d] py-6 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-200">{settings.courseName}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">Sistem Presensi & Google Apps Script</span>
          </div>
          <div className="text-zinc-500">
            Durasi jam hanya untuk siswa hadir • Notifikasi invoice otomatis pada 4x pertemuan / 8 jam
          </div>
        </div>
      </footer>
    </div>
  );
}
