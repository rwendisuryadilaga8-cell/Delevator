import React, { useState, useRef } from 'react';
import { CourseClass, CourseSettings, Student, Teacher, AttendanceSession } from '../types';
import {
  Settings,
  Upload,
  Image as ImageIcon,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Link,
  RotateCcw,
  Download,
  FileJson,
  Building2,
  CloudDownload,
  RefreshCw,
  FolderUp,
} from 'lucide-react';
import { sendDataToGas, fetchDataFromGas } from '../utils/gasConnector';
import {
  resetToDemoData,
  saveClasses,
  saveStudents,
  saveTeachers,
  saveSettings,
  saveSessions,
} from '../utils/storage';

interface SettingsViewProps {
  settings: CourseSettings;
  classes: CourseClass[];
  students: Student[];
  teachers: Teacher[];
  sessions: AttendanceSession[];
  onSaveSettings: (settings: CourseSettings) => void;
  onReloadAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  classes,
  students,
  teachers,
  sessions,
  onSaveSettings,
  onReloadAllData,
}) => {
  const [formData, setFormData] = useState<CourseSettings>(settings);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });
  const [pullStatus, setPullStatus] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            logoUrl: event.target?.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logoUrl: '',
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestGasConnection = async () => {
    if (!formData.gasWebAppUrl) {
      setTestResult({
        status: 'error',
        message: 'Masukkan URL Google Apps Script Web App terlebih dahulu.',
      });
      return;
    }

    setTestResult({ status: 'loading', message: 'Menghubungkan ke Google Apps Script...' });
    const res = await sendDataToGas(formData.gasWebAppUrl, {
      action: 'syncAll',
      data: {
        settings: formData,
        classes,
        students,
        teachers,
        sessions,
      },
    });

    if (res.success) {
      setTestResult({
        status: 'success',
        message: 'Koneksi Berhasil! Seluruh data telah disinkronkan ke Google Spreadsheet.',
      });
    } else {
      setTestResult({
        status: 'error',
        message: res.message,
      });
    }
  };

  const handlePullFromGas = async () => {
    if (!formData.gasWebAppUrl) {
      setPullStatus({
        status: 'error',
        message: 'Masukkan URL Google Apps Script Web App terlebih dahulu.',
      });
      return;
    }

    setPullStatus({ status: 'loading', message: 'Mengunduh database dari Google Spreadsheet...' });
    const res = await fetchDataFromGas(formData.gasWebAppUrl);

    if (res.success && res.data) {
      const { classes: remoteClasses, students: remoteStudents, teachers: remoteTeachers, settings: remoteSettings } = res.data;

      // Update settings if available
      let updatedSettings = { ...formData };
      if (remoteSettings && typeof remoteSettings === 'object') {
        updatedSettings = {
          ...updatedSettings,
          courseName: remoteSettings.courseName || updatedSettings.courseName,
          slogan: remoteSettings.slogan || updatedSettings.slogan,
          hourlyRate: Number(remoteSettings.hourlyRate) || updatedSettings.hourlyRate,
          address: remoteSettings.address || updatedSettings.address,
          phone: remoteSettings.phone || updatedSettings.phone,
        };
        setFormData(updatedSettings);
        saveSettings(updatedSettings);
        onSaveSettings(updatedSettings);
      }

      // Update classes if available
      if (Array.isArray(remoteClasses) && remoteClasses.length > 0) {
        const mappedClasses: CourseClass[] = remoteClasses.map((rc: any, idx: number) => ({
          id: rc.ID_Kelas || rc.id || `cls-${idx + 1}`,
          name: rc.Nama_Kelas || rc.name || `Kelas ${idx + 1}`,
          code: rc.Kode || rc.code || `KLS-${idx + 1}`,
          defaultDurationHours: Number(rc.Durasi_Default_Jam || rc.defaultDurationHours) || 2,
          defaultTeacherId: rc.ID_Guru_Default || rc.defaultTeacherId || '',
          feePerSession: Number(rc.Fee_Per_Sesi || rc.feePerSession) || 50000,
          description: rc.Deskripsi || rc.description || '',
        }));
        saveClasses(mappedClasses);
      }

      // Update students if available
      if (Array.isArray(remoteStudents) && remoteStudents.length > 0) {
        const mappedStudents: Student[] = remoteStudents.map((rs: any, idx: number) => ({
          id: rs.ID_Siswa || rs.id || `std-${idx + 1}`,
          nis: rs.NIS || rs.nis || `NIS-${idx + 1}`,
          name: rs.Nama_Siswa || rs.name || `Siswa ${idx + 1}`,
          classId: rs.ID_Kelas || rs.classId || '',
          phone: rs.No_HP || rs.phone || '',
          parentName: rs.Nama_Ortu || rs.parentName || '',
          parentPhone: rs.No_HP_Ortu || rs.parentPhone || '',
          status: (rs.Status === 'nonaktif' || rs.status === 'inactive') ? 'inactive' : 'active',
          joinedDate: rs.Tanggal_Daftar || rs.joinedDate || rs.registeredAt || new Date().toISOString().split('T')[0],
          cycleStartDate: rs.Tanggal_Siklus_Mulai || rs.cycleStartDate || new Date().toISOString(),
        }));
        saveStudents(mappedStudents);
      }

      // Update teachers if available
      if (Array.isArray(remoteTeachers) && remoteTeachers.length > 0) {
        const mappedTeachers: Teacher[] = remoteTeachers.map((rt: any, idx: number) => ({
          id: rt.ID_Guru || rt.id || `tch-${idx + 1}`,
          nip: rt.NIP || rt.nip || `NIP-${idx + 1}`,
          name: rt.Nama_Guru || rt.name || `Guru ${idx + 1}`,
          subject: rt.Spesialisasi || rt.subject || 'Pengajar',
          phone: rt.No_HP || rt.phone || '',
          status: (rt.Status === 'nonaktif' || rt.status === 'inactive') ? 'inactive' : 'active',
        }));
        saveTeachers(mappedTeachers);
      }

      onReloadAllData();
      setPullStatus({
        status: 'success',
        message: `Database berhasil diimpor dari Spreadsheet! (${remoteStudents?.length || 0} siswa, ${remoteClasses?.length || 0} kelas, ${remoteTeachers?.length || 0} guru)`,
      });
    } else {
      setPullStatus({
        status: 'error',
        message: res.message || 'Gagal menarik data dari Google Spreadsheet.',
      });
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.settings) {
          saveSettings(parsed.settings);
          setFormData(parsed.settings);
          onSaveSettings(parsed.settings);
        }
        if (Array.isArray(parsed.classes)) saveClasses(parsed.classes);
        if (Array.isArray(parsed.students)) saveStudents(parsed.students);
        if (Array.isArray(parsed.teachers)) saveTeachers(parsed.teachers);
        if (Array.isArray(parsed.sessions)) saveSessions(parsed.sessions);

        onReloadAllData();
        alert('Database dari file JSON berhasil dipulihkan!');
      } catch (err) {
        alert('Format file JSON tidak valid atau rusak.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportDataJson = () => {
    const backupData = {
      settings: formData,
      classes,
      students,
      teachers,
      sessions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_presensi_kursus_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (
      confirm(
        'Kembalikan ke data demo awal? Semua penambahan kelas, siswa, dan presensi akan di-reset.'
      )
    ) {
      resetToDemoData();
      onReloadAllData();
      alert('Data berhasil di-reset ke data demo.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#141414] p-5 rounded-xl border border-zinc-800/90 shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <span>Pengaturan Kursus & Google Spreadsheet</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Konfigurasi identitas lembaga kursus, unggah logo, tarif standar, dan koneksi Google
            Apps Script.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas Lembaga Kursus & Upload Logo */}
        <div className="bg-[#141414] rounded-xl border border-zinc-800/90 p-6 shadow-md space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span>Identitas Kursus & Logo Lembaga</span>
          </h3>

          {/* Logo Upload Section */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              Logo Kursus (Ditampilkan pada Aplikasi & Invoice Cetak)
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-28 h-28 rounded-xl border-2 border-dashed border-zinc-700 flex items-center justify-center bg-zinc-900/60 overflow-hidden relative group">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Logo Kursus"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="text-center p-2 text-zinc-500">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-60" />
                    <span className="text-[10px] block leading-tight">Belum ada logo</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload-input"
                />
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="logo-upload-input"
                    className="px-3.5 py-2 bg-blue-950/60 text-blue-300 hover:bg-blue-900/60 border border-blue-800/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo Baru</span>
                  </label>
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3 py-2 text-rose-400 hover:bg-rose-950/50 border border-rose-800/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Logo</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500">
                  Format disarankan: PNG atau JPG transparan, maks. 2MB.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Nama Kursus / Bimbel *</label>
              <input
                type="text"
                required
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 text-white placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Slogan / Keterangan</label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-zinc-300 mb-1">Alamat Lembaga</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-zinc-900 text-white placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">No. Kontak / WhatsApp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono bg-zinc-900 text-white placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Tarif Acuan per Jam (Rp)</label>
              <input
                type="number"
                step="5000"
                min="0"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono bg-zinc-900 text-white"
              />
              <span className="text-[10px] text-zinc-500 mt-0.5 block">
                Digunakan untuk estimasi kalkulasi nominal invoice saat dicetak
              </span>
            </div>
          </div>
        </div>

        {/* Google Apps Script Web App Integration */}
        <div className="bg-[#141414] rounded-xl border border-zinc-800/90 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Link className="w-5 h-5 text-blue-400" />
              <span>Integrasi Google Apps Script (Spreadsheet)</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950/60 text-blue-300 font-semibold border border-blue-800/50">
              Web App API
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            Data tersimpan otomatis di Google Spreadsheet Anda menggunakan URL Web App Google Apps
            Script. Jika belum memiliki URL Web App, lihat kode <strong>Code.gs</strong> dan panduan
            lengkap pada menu <strong>Code.gs & Sheet</strong>.
          </p>

          <div className="text-xs space-y-2">
            <label className="block font-semibold text-zinc-300">
              Google Apps Script Web App URL (Deploy As Web App)
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={formData.gasWebAppUrl}
              onChange={(e) => setFormData({ ...formData, gasWebAppUrl: e.target.value })}
              className="w-full px-3 py-2.5 border border-zinc-700/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono text-xs bg-zinc-900 text-white placeholder:text-zinc-500"
            />
            <span className="text-[11px] text-zinc-500 block">
              Pastikan deployment Google Apps Script diatur dengan akses &quot;Anyone&quot; (Siapa
              saja).
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handlePullFromGas}
              disabled={pullStatus.status === 'loading'}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:bg-emerald-800 disabled:text-emerald-300 shadow-sm"
              title="Mengambil data Kelas, Siswa, Guru, dan Pengaturan dari Google Spreadsheet"
            >
              <CloudDownload className="w-3.5 h-3.5" />
              <span>
                {pullStatus.status === 'loading'
                  ? 'Sedang Mengunduh Database...'
                  : 'Tarik / Impor Database dari Spreadsheet'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleTestGasConnection}
              disabled={testResult.status === 'loading'}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:bg-zinc-800/50 disabled:text-zinc-600 border border-zinc-700"
              title="Kirim dan sinkronkan seluruh data aplikasi ke Google Spreadsheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testResult.status === 'loading' ? 'animate-spin' : ''}`} />
              <span>
                {testResult.status === 'loading'
                  ? 'Sedang Sinkronisasi...'
                  : 'Kirim / Sinkronkan Data ke Spreadsheet'}
              </span>
            </button>
          </div>

          {pullStatus.status === 'success' && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/50 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{pullStatus.message}</span>
            </div>
          )}

          {pullStatus.status === 'error' && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/50 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{pullStatus.message}</span>
            </div>
          )}

          {testResult.status === 'success' && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/50 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{testResult.message}</span>
            </div>
          )}

          {testResult.status === 'error' && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/50 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Action Save Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2.5">
            <input
              type="file"
              ref={jsonFileInputRef}
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => jsonFileInputRef.current?.click()}
              className="px-3.5 py-2 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Pulihkan database dari file backup .json"
            >
              <FolderUp className="w-3.5 h-3.5" />
              <span>Impor Backup JSON</span>
            </button>
            <button
              type="button"
              onClick={handleExportDataJson}
              className="px-3.5 py-2 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Unduh cadangan data ke file .json"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup JSON</span>
            </button>
            <button
              type="button"
              onClick={handleResetData}
              className="px-3.5 py-2 border border-rose-900/60 text-rose-400 hover:bg-rose-950/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Demo</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pengaturan berhasil disimpan!</span>
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
