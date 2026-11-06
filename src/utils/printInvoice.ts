import { CourseSettings, StudentRecap } from '../types';

export function openInvoicePrintWindow(recap: StudentRecap, settings: CourseSettings): void {
  const invoiceNumber = `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${recap.student.nis.replace(/[^0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)}`;
  const invoiceDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const ratePerHour = settings.hourlyRate || 75000;
  const totalAmount = recap.totalHours * ratePerHour;

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Invoice Presensi - ${recap.student.name} (${invoiceNumber})</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #0a0a0a;
      color: #1e293b;
      padding: 32px 16px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .invoice-wrapper {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      border: 1px solid #27272a;
    }
    .print-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-bottom: 24px;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }
    .btn-print {
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      transition: background 0.15s;
    }
    .btn-print:hover {
      background: #1d4ed8;
    }
    .btn-close {
      background: #18181b;
      color: #d4d4d8;
      border: 1px solid #3f3f46;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.15s;
    }
    .btn-close:hover {
      background: #27272a;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-img {
      max-height: 70px;
      max-width: 140px;
      object-fit: contain;
      border-radius: 6px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
    }
    .brand-slogan {
      font-size: 13px;
      color: #64748b;
      margin-top: 2px;
    }
    .brand-address {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
      max-width: 280px;
    }
    .invoice-badge-block {
      text-align: right;
    }
    .invoice-title {
      font-size: 26px;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: -0.5px;
    }
    .invoice-number {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }
    .invoice-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .meta-box h4 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 6px;
    }
    .meta-box p {
      font-size: 14px;
      color: #1e293b;
      line-height: 1.5;
    }
    .meta-highlight {
      font-weight: 700;
      color: #0f172a;
    }
    .alert-banner {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-left: 4px solid #2563eb;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 24px;
      font-size: 13px;
      color: #1e40af;
    }
    .table-container {
      margin-bottom: 24px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid #cbd5e1;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    tr:nth-child(even) td {
      background: #fafbfc;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-hadir { background: #dcfce7; color: #15803d; }
    .badge-izin { background: #fef9c3; color: #854d0e; }
    .badge-sakit { background: #e0f2fe; color: #0369a1; }
    .badge-alpa { background: #fee2e2; color: #b91c1c; }
    .summary-card {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }
    .summary-table {
      width: 320px;
    }
    .summary-table td {
      padding: 8px 12px;
      border: none;
    }
    .summary-table .total-row td {
      border-top: 2px solid #cbd5e1;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      background: #f1f5f9;
    }
    .footer-signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      font-size: 13px;
    }
    .sig-box {
      text-align: center;
    }
    .sig-space {
      height: 60px;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .invoice-wrapper { border: none; box-shadow: none; padding: 10px; width: 100%; max-width: 100%; }
      .print-actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="btn-close" onclick="window.close()">Tutup Jendela</button>
    <button class="btn-print" onclick="window.print()">
      🖨️ Cetak / Simpan PDF
    </button>
  </div>

  <div class="invoice-wrapper">
    <div class="header">
      <div class="brand-section">
        ${
          settings.logoUrl
            ? `<img src="${settings.logoUrl}" alt="Logo" class="logo-img">`
            : `<div style="width:48px;height:48px;border-radius:8px;background:#2563eb;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:20px;">PC</div>`
        }
        <div>
          <div class="brand-title">${settings.courseName}</div>
          <div class="brand-slogan">${settings.slogan}</div>
          <div class="brand-address">${settings.address || 'Alamat Belum Disetel'} • Telp: ${settings.phone || '-'}</div>
        </div>
      </div>
      <div class="invoice-badge-block">
        <div class="invoice-title">TAGIHAN / INVOICE</div>
        <div class="invoice-number">${invoiceNumber}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;">Tanggal: ${invoiceDate}</div>
      </div>
    </div>

    <div class="alert-banner">
      <strong>Pemberitahuan Sistem Presensi:</strong> Siswa ini telah menyelesaikan kuota 
      <strong>${recap.totalPresent}x Pertemuan</strong> dengan total akumulasi waktu belajar 
      <strong>${recap.totalHours} Jam</strong>. Sesuai ketentuan, invoice tagihan kursus dapat diterbitkan.
    </div>

    <div class="invoice-meta-grid">
      <div class="meta-box">
        <h4>Data Siswa & Kursus</h4>
        <p><strong class="meta-highlight">${recap.student.name}</strong></p>
        <p>NIS: ${recap.student.nis}</p>
        <p>Kelas / Program: <strong>${recap.className}</strong></p>
        <p>No. Kontak: ${recap.student.phone || '-'}</p>
      </div>
      <div class="meta-box">
        <h4>Data Wali / Penanggung Jawab</h4>
        <p>Nama Ortu / Wali: ${recap.student.parentName || '-'}</p>
        <p>No. WhatsApp Ortu: ${recap.student.parentPhone || '-'}</p>
        <p>Tarif Acuan: Rp ${ratePerHour.toLocaleString('id-ID')} / Jam</p>
        <p>Status Tagihan: <span style="color:#2563eb;font-weight:700;">Siap Ditagihkan</span></p>
      </div>
    </div>

    <div class="table-container">
      <h4 style="font-size:13px;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;color:#475569;">
        Rincian Riwayat Kehadiran & Sesi Pembelajaran
      </h4>
      <table>
        <thead>
          <tr>
            <th style="width: 35px;">No</th>
            <th style="width: 90px;">Tanggal</th>
            <th>Guru Pengajar</th>
            <th>Materi Pelajaran</th>
            <th style="width: 80px;">Status</th>
            <th style="width: 90px;text-align:center;">Durasi Jam</th>
            <th style="width: 110px;text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${
            recap.attendanceHistory.length === 0
              ? `<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:16px;">Belum ada sesi presensi tercatat</td></tr>`
              : recap.attendanceHistory
                  .map((item, idx) => {
                    const itemSubtotal = item.hours * ratePerHour;
                    const badgeClass =
                      item.status === 'Hadir'
                        ? 'badge-hadir'
                        : item.status === 'Izin'
                        ? 'badge-izin'
                        : item.status === 'Sakit'
                        ? 'badge-sakit'
                        : 'badge-alpa';
                    return `
              <tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td>${item.date}</td>
                <td>${item.teacherName}</td>
                <td>${item.topic}</td>
                <td><span class="status-badge ${badgeClass}">${item.status}</span></td>
                <td style="text-align:center;font-weight:600;">${item.hours} Jam</td>
                <td style="text-align:right;font-family:'JetBrains Mono',monospace;">
                  ${item.hours > 0 ? 'Rp ' + itemSubtotal.toLocaleString('id-ID') : 'Rp 0'}
                </td>
              </tr>
            `;
                  })
                  .join('')
          }
        </tbody>
      </table>
    </div>

    <div class="summary-card">
      <table class="summary-table">
        <tr>
          <td>Total Pertemuan Hadir:</td>
          <td style="text-align:right;font-weight:600;">${recap.totalPresent}x Pertemuan</td>
        </tr>
        <tr>
          <td>Akumulasi Jam Hadir:</td>
          <td style="text-align:right;font-weight:600;">${recap.totalHours} Jam Belajar</td>
        </tr>
        <tr>
          <td>Tarif Per Jam:</td>
          <td style="text-align:right;font-family:'JetBrains Mono',monospace;">Rp ${ratePerHour.toLocaleString('id-ID')}</td>
        </tr>
        <tr class="total-row">
          <td>TOTAL TAGIHAN:</td>
          <td style="text-align:right;font-family:'JetBrains Mono',monospace;color:#1e3a8a;">
            Rp ${totalAmount.toLocaleString('id-ID')}
          </td>
        </tr>
      </table>
    </div>

    <div style="margin-top:28px;padding:14px;background:#f8fafc;border-radius:8px;font-size:12px;color:#64748b;line-height:1.6;">
      <strong>Catatan Pembayaran:</strong><br>
      • Durasi jam hanya berlaku dan dihitung untuk siswa yang berstatus <strong>Hadir</strong> (Izin/Sakit/Alpa = 0 Jam).<br>
      • Pembayaran tagihan dapat ditransfer ke rekening kursus atau diserahkan langsung ke bagian administrasi.<br>
      • Terima kasih atas kepercayaan Anda mempercayakan proses belajar kepada ${settings.courseName}.
    </div>

    <div class="footer-signatures">
      <div class="sig-box">
        <p>Orang Tua / Wali Siswa</p>
        <div class="sig-space"></div>
        <p><strong>(${recap.student.parentName || '......................................'})</strong></p>
      </div>
      <div class="sig-box">
        <p>Bagian Keuangan & Administrasi</p>
        <div class="sig-space"></div>
        <p><strong>(${settings.courseName})</strong></p>
      </div>
    </div>
  </div>

  <script>
    // Auto focus for easy print
  </script>
</body>
</html>
  `;

  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.open();
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  } else {
    alert('Popup diblokir oleh browser. Izinkan popup untuk mencetak invoice di tab baru.');
  }
}
