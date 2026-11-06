import { AttendanceSession, CourseClass, CourseSettings, Student, StudentRecap, Teacher, TeacherRecap } from '../types';
import { initialClasses, initialSettings, initialStudents, initialTeachers, initialSessions } from '../data/initialData';

const STORAGE_KEYS = {
  SETTINGS: 'presensi_kursus_settings_v1',
  CLASSES: 'presensi_kursus_classes_v1',
  STUDENTS: 'presensi_kursus_students_v1',
  TEACHERS: 'presensi_kursus_teachers_v1',
  SESSIONS: 'presensi_kursus_sessions_v1',
};

export function loadSettings(): CourseSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveSettings(initialSettings);
      return initialSettings;
    }
    return { ...initialSettings, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings from storage', e);
    return initialSettings;
  }
}

export function saveSettings(settings: CourseSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function loadClasses(): CourseClass[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    if (!raw) {
      saveClasses(initialClasses);
      return initialClasses;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load classes', e);
    return initialClasses;
  }
}

export function saveClasses(classes: CourseClass[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  } catch (e) {
    console.error('Failed to save classes', e);
  }
}

export function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      saveStudents(initialStudents);
      return initialStudents;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load students', e);
    return initialStudents;
  }
}

export function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students', e);
  }
}

export function loadTeachers(): Teacher[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (!raw) {
      saveTeachers(initialTeachers);
      return initialTeachers;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load teachers', e);
    return initialTeachers;
  }
}

export function saveTeachers(teachers: Teacher[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  } catch (e) {
    console.error('Failed to save teachers', e);
  }
}

export function loadSessions(): AttendanceSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      saveSessions(initialSessions);
      return initialSessions;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load sessions', e);
    return initialSessions;
  }
}

export function saveSessions(sessions: AttendanceSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions', e);
  }
}

/**
 * Hitung Rekap Siswa secara akurat:
 * - Durasi jam HANYA dihitung untuk siswa yang hadir, tidak hadir = 0 jam
 * - Status Invoice jika total kehadiran >= 4 pertemuan ATAU total jam >= 8 jam
 */
export function calculateStudentRecaps(
  students: Student[],
  classes: CourseClass[],
  sessions: AttendanceSession[]
): StudentRecap[] {
  const classMap = new Map<string, string>();
  classes.forEach((c) => classMap.set(c.id, c.name));

  // Sort sessions ascending by date
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return students.map((student) => {
    let totalPresent = 0;
    let totalPermission = 0;
    let totalSick = 0;
    let totalAbsent = 0;
    let totalHours = 0;
    let totalSessions = 0;

    const history: StudentRecap['attendanceHistory'] = [];

    // Filter sessions if student has cycleStartDate (for invoice cycle reset)
    const cycleStart = student.cycleStartDate ? new Date(student.cycleStartDate).getTime() : 0;

    sortedSessions.forEach((sess) => {
      const sessionTime = new Date(sess.date).getTime();
      if (cycleStart && sessionTime < cycleStart) {
        return;
      }

      const entry = sess.studentEntries.find((e) => e.studentId === student.id);
      if (entry) {
        totalSessions += 1;
        // ATURAN SPESIFIK:
        // Durasi jam hanya berlaku untuk siswa yang hadir saja, tidak hadir di hitung 0 jam
        const validHours = entry.status === 'Hadir' ? Number(sess.durationHours) || 0 : 0;

        if (entry.status === 'Hadir') {
          totalPresent += 1;
          totalHours += validHours;
        } else if (entry.status === 'Izin') {
          totalPermission += 1;
        } else if (entry.status === 'Sakit') {
          totalSick += 1;
        } else if (entry.status === 'Alpa') {
          totalAbsent += 1;
        }

        history.push({
          date: sess.date,
          topic: sess.topic || 'Materi Reguler',
          teacherName: sess.teacherName,
          status: entry.status,
          hours: validHours,
          note: entry.note,
        });
      }
    });

    // AMBANG INVOICE:
    // setiap siswa dengan jumlah kehadiran sudah 8 Jam pertemuan atau 4x pertemuan ada pemberitahuan invoice
    const isInvoiceReady = totalPresent >= 4 || totalHours >= 8;
    let invoiceThresholdReason = '';
    if (totalPresent >= 4 && totalHours >= 8) {
      invoiceThresholdReason = 'Tercapai 4x Pertemuan & 8 Jam Belajar';
    } else if (totalPresent >= 4) {
      invoiceThresholdReason = 'Tercapai 4x Pertemuan';
    } else if (totalHours >= 8) {
      invoiceThresholdReason = 'Tercapai 8 Jam Belajar';
    }

    return {
      student,
      className: classMap.get(student.classId) || 'Kelas Tidak Diketahui',
      totalPresent,
      totalPermission,
      totalSick,
      totalAbsent,
      totalHours,
      totalSessions,
      isInvoiceReady,
      invoiceThresholdReason,
      attendanceHistory: history.reverse(), // most recent first for preview
    };
  });
}

/**
 * Hitung Rekap Guru
 */
export function calculateTeacherRecaps(
  teachers: Teacher[],
  sessions: AttendanceSession[]
): TeacherRecap[] {
  return teachers.map((teacher) => {
    let totalSessionsPresent = 0;
    let totalHoursTaught = 0;
    let totalSessionsScheduled = 0;

    sessions.forEach((sess) => {
      if (sess.teacherId === teacher.id) {
        totalSessionsScheduled += 1;
        if (sess.teacherStatus === 'Hadir') {
          totalSessionsPresent += 1;
          totalHoursTaught += Number(sess.durationHours) || 0;
        }
      }
    });

    return {
      teacher,
      totalSessionsPresent,
      totalHoursTaught,
      totalSessionsScheduled,
    };
  });
}

/**
 * Reset all local storage to demo state
 */
export function resetToDemoData() {
  saveSettings(initialSettings);
  saveClasses(initialClasses);
  saveStudents(initialStudents);
  saveTeachers(initialTeachers);
  saveSessions(initialSessions);
}
