import React, { useState } from 'react';
import { CODE_GS_SCRIPT, INDEX_HTML_SCRIPT } from '../utils/gasCode';
import {
  Code2,
  Copy,
  Check,
  Download,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { CourseSettings } from '../types';
import { sendDataToGas } from '../utils/gasConnector';

interface GasIntegrationViewProps {
  settings: CourseSettings;
}

export const GasIntegrationView: React.FC<GasIntegrationViewProps> = ({ settings }) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'codegs' | 'indexhtml' | 'guide'>('codegs');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupFeedback, setSetupFeedback] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTriggerRemoteSetup = async () => {
    if (!settings.gasWebAppUrl) {
      alert('Isi Google Apps Script Web App URL di menu Pengaturan terlebih dahulu.');
      return;
    }
    setIsSettingUp(true);
    setSetupFeedback(null);
    const res = await sendDataToGas(settings.gasWebAppUrl, { action: 'setup' });
    setIsSettingUp(false);
    if (res.success) {
      setSetupFeedback('✅ Berhasil menjalankan setupDatabase() di Google Spreadsheet!');
    } else {
      setSetupFeedback(`⚠️ ${res.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#141414] p-6 rounded-2xl border border-zinc-800/90 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-800/50">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Apps Script & Spreadsheet Generator</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Kode Google Apps Script (Code.gs) & Index.html
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Semua data tersimpan otomatis di Google Spreadsheet dan dapat dipublish sebagai Google
            Apps Script Web App. Fungsi <code>setupDatabase()</code> akan secara otomatis membuat
            dan memformat seluruh sheet yang dibutuhkan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://sheets.new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Buka Google Sheets Baru</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {settings.gasWebAppUrl && (
            <button
              onClick={handleTriggerRemoteSetup}
              disabled={isSettingUp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:bg-zinc-800/50 disabled:text-zinc-600 border border-zinc-700"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isSettingUp ? 'Menyiapkan...' : 'Jalankan setupDatabase()'}</span>
            </button>
          )}
        </div>
      </div>

      {setupFeedback && (
        <div className="p-3.5 bg-blue-950/60 border border-blue-800/50 rounded-xl text-xs text-blue-200 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{setupFeedback}</span>
        </div>
      )}

      {/* Tabs Switcher: Code.gs, Index.html, Panduan */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveCodeTab('codegs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeCodeTab === 'codegs'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Code.gs (Backend & setupDatabase)</span>
          </button>
          <button
            onClick={() => setActiveCodeTab('indexhtml')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeCodeTab === 'indexhtml'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Index.html (Web App View)</span>
          </button>
          <button
            onClick={() => setActiveCodeTab('guide')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeCodeTab === 'guide'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Panduan Setup Database Sheet</span>
          </button>
        </div>
      </div>

      {/* Content for Code.gs */}
      {activeCodeTab === 'codegs' && (
        <div className="bg-[#0f0f11] rounded-2xl border border-zinc-800 shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#141414] border-b border-zinc-800 text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-mono font-medium">
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span>Code.gs (Google Apps Script)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadFile('Code.gs', CODE_GS_SCRIPT)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border border-zinc-700"
                title="Unduh file Code.gs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File</span>
              </button>
              <button
                onClick={() => handleCopy(CODE_GS_SCRIPT, 'codegs')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                {copiedCode === 'codegs' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Seluruh Kode</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="p-5 max-h-[600px] overflow-y-auto font-mono text-xs text-zinc-300 leading-relaxed select-all">
            <pre className="whitespace-pre-wrap">{CODE_GS_SCRIPT}</pre>
          </div>
        </div>
      )}

      {/* Content for Index.html */}
      {activeCodeTab === 'indexhtml' && (
        <div className="bg-[#0f0f11] rounded-2xl border border-zinc-800 shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#141414] border-b border-zinc-800 text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-mono font-medium">
              <span className="w-3 h-3 rounded-full bg-blue-500/80 inline-block" />
              <span>Index.html (Google Apps Script Web App Template)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadFile('Index.html', INDEX_HTML_SCRIPT)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border border-zinc-700"
                title="Unduh file Index.html"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File</span>
              </button>
              <button
                onClick={() => handleCopy(INDEX_HTML_SCRIPT, 'indexhtml')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                {copiedCode === 'indexhtml' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode HTML</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="p-5 max-h-[600px] overflow-y-auto font-mono text-xs text-zinc-300 leading-relaxed select-all">
            <pre className="whitespace-pre-wrap">{INDEX_HTML_SCRIPT}</pre>
          </div>
        </div>
      )}

      {/* Guide Tab */}
      {activeCodeTab === 'guide' && (
        <div className="bg-[#141414] rounded-2xl border border-zinc-800/90 p-6 shadow-md space-y-6">
          <h3 className="text-base font-bold text-white pb-3 border-b border-zinc-800">
            Panduan Menghubungkan ke Google Spreadsheet & Google Apps Script
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-300 leading-relaxed">
            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold inline-flex items-center justify-center text-xs">
                1
              </span>
              <h4 className="font-bold text-white text-sm">Buka Spreadsheet & Apps Script</h4>
              <p>
                Buka tab baru dan ketik <strong>sheets.new</strong> atau buat file Google
                Spreadsheet baru. Beri judul spreadsheet Anda, misalnya <em>&quot;Database Presensi
                Kursus&quot;</em>.
              </p>
              <p>
                Klik menu <strong>Extensions (Ekstensi)</strong> &gt;{' '}
                <strong>Apps Script</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold inline-flex items-center justify-center text-xs">
                2
              </span>
              <h4 className="font-bold text-white text-sm">Tempelkan Kode Code.gs & Index.html</h4>
              <p>
                Pada file <strong>Code.gs</strong>, hapus kode lama dan paste seluruh kode dari tab{' '}
                <strong>Code.gs</strong> di atas.
              </p>
              <p>
                Klik ikon <strong>+ (Tambah File)</strong> &gt; pilih <strong>HTML</strong> &gt; beri
                nama <strong>Index</strong> (akan otomatis menjadi Index.html), lalu paste kode dari
                tab <strong>Index.html</strong>. Simpan dengan <code>Ctrl+S</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold inline-flex items-center justify-center text-xs">
                3
              </span>
              <h4 className="font-bold text-white text-sm">Jalankan setupDatabase() Otomatis</h4>
              <p>
                Pada toolbar atas Apps Script, pilih dropdown fungsi <strong>setupDatabase</strong>,
                lalu klik tombol <strong>Run (Jalankan)</strong>.
              </p>
              <p>
                Google akan meminta izin otorisasi akses pertama kali (Review Permissions &gt; Pilih
                Akun Google Anda &gt; Advanced &gt; Go to... (unsafe) &gt; Allow).
              </p>
              <p className="text-emerald-400 font-semibold">
                Selesai! Seluruh sheet (Settings, Kelas, Siswa, Guru, PresensiSiswa, PresensiGuru,
                RekapInvoice) akan otomatis terbuat lengkap dengan header rapi dan rumus!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold inline-flex items-center justify-center text-xs">
                4
              </span>
              <h4 className="font-bold text-white text-sm">Deploy Web App & Sambungkan</h4>
              <p>
                Klik tombol biru <strong>Deploy (Terapkan)</strong> &gt;{' '}
                <strong>New deployment</strong>.
              </p>
              <p>
                Pilih jenis <strong>Web app</strong>:<br />
                • Execute as: <strong>Me (Saya)</strong><br />
                • Who has access: <strong>Anyone (Siapa saja)</strong>
              </p>
              <p>
                Salin <strong>Web App URL</strong> yang dihasilkan (berawalan{' '}
                <code>https://script.google.com/macros/s/.../exec</code>), lalu buka menu{' '}
                <strong>Pengaturan</strong> di web app ini dan tempelkan URL tersebut!
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-950/30 border border-blue-900/60 rounded-xl text-xs text-zinc-300 space-y-2">
            <h4 className="font-bold text-sm text-blue-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Struktur Sheet yang Dibuat Otomatis:</span>
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-zinc-300">
              <li>
                <strong>Settings:</strong> Menyimpan nama kursus, slogan, tarif acuan, alamat, dan
                kontak.
              </li>
              <li>
                <strong>Kelas:</strong> ID Kelas, Nama Kelas, Kode, Durasi Default Jam, Biaya per
                Sesi, Guru Pengampu.
              </li>
              <li>
                <strong>Siswa:</strong> ID Siswa, NIS, Nama Siswa, Kelas Terdaftar, Kontak Ortu,
                Status.
              </li>
              <li>
                <strong>Guru:</strong> ID Guru, NIP, Nama Guru, Spesialisasi, No Telepon, Status.
              </li>
              <li>
                <strong>PresensiSiswa:</strong> Log detail setiap siswa hadir per sesi (Durasi jam
                hanya dihitung jika Hadir, Tidak Hadir = 0 Jam).
              </li>
              <li>
                <strong>PresensiGuru:</strong> Rekap jam mengajar dan status kehadiran guru pengajar.
              </li>
              <li>
                <strong>RekapInvoice:</strong> Tabel kalkulasi otomatis yang menandai status{' '}
                <em>&quot;SIAP TAGIH (INVOICE)&quot;</em> jika siswa mencapai 4x pertemuan atau 8 jam.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
