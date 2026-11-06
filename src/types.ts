export interface CourseSettings {
  courseName: string;
  slogan: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  hourlyRate: number; // Biaya per jam atau per pertemuan untuk perhitungan invoice
  gasWebAppUrl: string; // Google Apps Script published web app URL
}

export interface CourseClass {
  id: string;
  name: string;
  code: string;
  defaultDurationHours: number; // misal 1.5 atau 2 jam
  defaultTeacherId?: string;
  feePerSession?: number;
  description?: string;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  classId: string;
  phone: string;
  parentName?: string;
  parentPhone?: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  cycleStartDate?: string; // Tanggal awal siklus tagihan saat ini
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  subject: string;
  phone: string;
  status: 'active' | 'inactive';
}

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';

export interface StudentAttendanceEntry {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  hoursAttended: number; // Durasi jam yang diperoleh (Hanya berlaku untuk siswa yang hadir, jika izin/sakit/alpa = 0)
  note?: string;
}

export interface AttendanceSession {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  teacherStatus: AttendanceStatus;
  durationHours: number; // Durasi sesi (misal: 2 jam)
  topic: string; // Materi pelajaran
  studentEntries: StudentAttendanceEntry[];
  createdAt: string;
}

export interface StudentRecap {
  student: Student;
  className: string;
  totalPresent: number; // Jumlah pertemuan hadir
  totalPermission: number; // Izin
  totalSick: number; // Sakit
  totalAbsent: number; // Alpa
  totalHours: number; // Total jam hadir
  totalSessions: number; // Total sesi terdaftar
  isInvoiceReady: boolean; // True jika totalPresent >= 4 ATAU totalHours >= 8
  invoiceThresholdReason?: string;
  attendanceHistory: Array<{
    date: string;
    topic: string;
    teacherName: string;
    status: AttendanceStatus;
    hours: number;
    note?: string;
  }>;
}

export interface TeacherRecap {
  teacher: Teacher;
  totalSessionsPresent: number;
  totalHoursTaught: number;
  totalSessionsScheduled: number;
}
