export const CODE_GS_SCRIPT = `/**
 * ==============================================================================
 * SISTEM DAFTAR HADIR KURSUS - GOOGLE APPS SCRIPT (Code.gs)
 * ==============================================================================
 * Petunjuk Instalasi:
 * 1. Buka Google Sheets baru: https://sheets.new
 * 2. Klik menu "Extensions" (Ekstensi) > "Apps Script"
 * 3. Hapus kode default di Code.gs, lalu paste seluruh isi skrip ini.
 * 4. Buat file HTML baru dengan nama "Index.html", lalu paste kode Index.html yang disediakan.
 * 5. Pilih fungsi "setupDatabase" di dropdown toolbar atas, lalu klik tombol "Run" (Jalankan).
 *    (Beri izin akses saat popup otorisasi muncul).
 * 6. Klik tombol "Deploy" (Terapkan) > "New deployment" (Penerapan baru) > Jenis "Web app":
 *    - Execute as: "Me" (Saya)
 *    - Who has access: "Anyone" (Siapa saja)
 * 7. Salin URL Web App yang dihasilkan dan tempelkan ke menu Pengaturan di Web App Presensi.
 * ==============================================================================
 */

// Konstanta Nama Sheet Database
var SHEET_SETTINGS = "Settings";
var SHEET_KELAS = "Kelas";
var SHEET_SISWA = "Siswa";
var SHEET_GURU = "Guru";
var SHEET_PRESENSI_SISWA = "PresensiSiswa";
var SHEET_PRESENSI_GURU = "PresensiGuru";
var SHEET_REKAP_INVOICE = "RekapInvoice";

/**
 * Setup otomatis seluruh sheet database beserta header, format, dan rumus
 */
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sheet Settings
  var sheetSettings = getOrCreateSheet(ss, SHEET_SETTINGS);
  formatHeader(sheetSettings, ["Kunci", "Nilai", "Terakhir_Diperbarui"]);
  if (sheetSettings.getLastRow() <= 1) {
    sheetSettings.appendRow(["courseName", "Delevator", new Date()]);
    sheetSettings.appendRow(["slogan", "Your English Master", new Date()]);
    sheetSettings.appendRow(["hourlyRate", "25000", new Date()]);
    sheetSettings.appendRow(["address", "Cipanas Cianjur", new Date()]);
    sheetSettings.appendRow(["phone", "0821-1844-4414", new Date()]);
  }

  // 2. Sheet Kelas
  var sheetKelas = getOrCreateSheet(ss, SHEET_KELAS);
  formatHeader(sheetKelas, ["ID_Kelas", "Nama_Kelas", "Kode", "Durasi_Default_Jam", "Fee_Per_Sesi", "ID_Guru_Default", "Deskripsi"]);

  // 3. Sheet Siswa
  var sheetSiswa = getOrCreateSheet(ss, SHEET_SISWA);
  formatHeader(sheetSiswa, ["ID_Siswa", "NIS", "Nama_Siswa", "ID_Kelas", "No_HP", "Nama_Ortu", "No_HP_Ortu", "Status", "Tanggal_Daftar", "Tanggal_Siklus_Mulai"]);

  // 4. Sheet Guru
  var sheetGuru = getOrCreateSheet(ss, SHEET_GURU);
  formatHeader(sheetGuru, ["ID_Guru", "NIP", "Nama_Guru", "Spesialisasi", "No_HP", "Status"]);

  // 5. Sheet Presensi Siswa (Durasi jam hanya dihitung jika Hadir)
  var sheetPresensiSiswa = getOrCreateSheet(ss, SHEET_PRESENSI_SISWA);
  formatHeader(sheetPresensiSiswa, [
    "ID_Sesi", "Tanggal", "Jam", "ID_Kelas", "Nama_Kelas", 
    "ID_Guru", "Nama_Guru", "ID_Siswa", "Nama_Siswa", 
    "Status_Kehadiran", "Durasi_Jam_Dihitung", "Catatan", "Timestamp"
  ]);

  // 6. Sheet Presensi Guru
  var sheetPresensiGuru = getOrCreateSheet(ss, SHEET_PRESENSI_GURU);
  formatHeader(sheetPresensiGuru, [
    "ID_Sesi", "Tanggal", "Jam", "ID_Kelas", "Nama_Kelas", 
    "ID_Guru", "Nama_Guru", "Status_Guru", "Durasi_Jam_Mengajar", 
    "Materi_Pelajaran", "Timestamp"
  ]);

  // 7. Sheet Rekap & Invoice Otomatis
  var sheetRekap = getOrCreateSheet(ss, SHEET_REKAP_INVOICE);
  formatHeader(sheetRekap, [
    "ID_Siswa", "Nama_Siswa", "ID_Kelas", "Total_Hadir_Pertemuan", 
    "Total_Jam_Kehadiran", "Status_Invoice", "Ambang_Invoice", "Keterangan"
  ]);

  SpreadsheetApp.flush();
  Logger.log("Database berhasil disetup otomatis!");
  return "Database berhasil disetup otomatis!";
}

/**
 * Helper untuk membuat atau mengambil sheet
 */
function getOrCreateSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * Helper styling header sheet
 */
function formatHeader(sheet, headers) {
  var existingData = sheet.getDataRange().getValues();
  if (existingData.length === 0 || existingData[0].length === 0 || existingData[0][0] === "") {
    sheet.clear();
    sheet.appendRow(headers);
  } else {
    // Pastikan baris 1 adalah header
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#1e293b"); // Slate 800
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  
  for (var i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
}

/**
 * Menangani HTTP GET request (Web App & JSON API)
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "webapp";
  
  if (action === "webapp") {
    return HtmlService.createHtmlOutputFromFile("Index")
      .setTitle("Sistem Daftar Hadir & Presensi Kursus")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  if (action === "getData") {
    return createJsonResponse(getAllData());
  }
  
  if (action === "setup") {
    var res = setupDatabase();
    return createJsonResponse({ status: "success", message: res });
  }

  return createJsonResponse({ status: "ok", message: "Google Apps Script Presensi API Aktif" });
}

/**
 * Menangani HTTP POST request untuk sinkronisasi data dari Web App
 */
function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "saveAttendance") {
      var session = postData.session;
      saveAttendanceSession(ss, session);
      updateRekapInvoice(ss);
      return createJsonResponse({ status: "success", message: "Presensi berhasil disimpan ke Spreadsheet!" });
    }

    if (action === "syncAll") {
      // Sinkronisasi data menyeluruh
      syncAllData(ss, postData.data);
      return createJsonResponse({ status: "success", message: "Sinkronisasi data ke Spreadsheet selesai!" });
    }

    if (action === "setup") {
      setupDatabase();
      return createJsonResponse({ status: "success", message: "Setup database berhasil" });
    }

    return createJsonResponse({ status: "error", message: "Action tidak dikenali: " + action });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * Simpan satu sesi presensi guru dan siswa
 */
function saveAttendanceSession(ss, session) {
  var sheetPresensiSiswa = getOrCreateSheet(ss, SHEET_PRESENSI_SISWA);
  var sheetPresensiGuru = getOrCreateSheet(ss, SHEET_PRESENSI_GURU);
  var now = new Date();

  // 1. Simpan Presensi Guru
  sheetPresensiGuru.appendRow([
    session.id,
    session.date,
    session.time || "-",
    session.classId,
    session.className,
    session.teacherId,
    session.teacherName,
    session.teacherStatus,
    session.teacherStatus === "Hadir" ? session.durationHours : 0,
    session.topic || "-",
    now
  ]);

  // 2. Simpan Presensi Tiap Siswa
  if (session.studentEntries && session.studentEntries.length > 0) {
    var rows = [];
    for (var i = 0; i < session.studentEntries.length; i++) {
      var entry = session.studentEntries[i];
      // Aturan penting: durasi jam hanya berlaku jika siswa Hadir, jika tidak hadir dihitung 0
      var jamDihitung = (entry.status === "Hadir") ? session.durationHours : 0;
      rows.push([
        session.id,
        session.date,
        session.time || "-",
        session.classId,
        session.className,
        session.teacherId,
        session.teacherName,
        entry.studentId,
        entry.studentName,
        entry.status,
        jamDihitung,
        entry.note || "-",
        now
      ]);
    }
    if (rows.length > 0) {
      var lastRow = sheetPresensiSiswa.getLastRow();
      sheetPresensiSiswa.getRange(lastRow + 1, 1, rows.length, rows[0].length).setValues(rows);
    }
  }
}

/**
 * Perbarui Sheet RekapInvoice berdasarkan akumulasi data di PresensiSiswa
 * Kriteria: Kehadiran >= 4x pertemuan ATAU >= 8 Jam
 */
function updateRekapInvoice(ss) {
  var sheetPresensi = ss.getSheetByName(SHEET_PRESENSI_SISWA);
  var sheetRekap = getOrCreateSheet(ss, SHEET_REKAP_INVOICE);
  
  if (!sheetPresensi || sheetPresensi.getLastRow() <= 1) return;

  var presensiData = sheetPresensi.getRange(2, 1, sheetPresensi.getLastRow() - 1, 13).getValues();
  var studentMap = {};

  for (var i = 0; i < presensiData.length; i++) {
    var row = presensiData[i];
    var studentId = row[7];
    var studentName = row[8];
    var classId = row[3];
    var status = row[9];
    var hours = Number(row[10]) || 0;

    if (!studentMap[studentId]) {
      studentMap[studentId] = {
        studentId: studentId,
        studentName: studentName,
        classId: classId,
        totalPresent: 0,
        totalHours: 0
      };
    }

    if (status === "Hadir") {
      studentMap[studentId].totalPresent += 1;
      studentMap[studentId].totalHours += hours;
    }
  }

  // Format baris rekap
  var rekapRows = [];
  for (var sId in studentMap) {
    var item = studentMap[sId];
    var isInvoiceReady = (item.totalPresent >= 4 || item.totalHours >= 8);
    var statusInvoice = isInvoiceReady ? "SIAP TAGIH (INVOICE)" : "Berjalan";
    var ambang = "";
    if (item.totalPresent >= 4 && item.totalHours >= 8) {
      ambang = "4x Pertemuan & 8 Jam Tercapai";
    } else if (item.totalPresent >= 4) {
      ambang = "4x Pertemuan Tercapai";
    } else if (item.totalHours >= 8) {
      ambang = "8 Jam Tercapai";
    } else {
      ambang = item.totalPresent + "/4 Sesi (" + item.totalHours + "/8 Jam)";
    }

    rekapRows.push([
      item.studentId,
      item.studentName,
      item.classId,
      item.totalPresent,
      item.totalHours,
      statusInvoice,
      ambang,
      isInvoiceReady ? "Segera buatkan invoice pembayaran" : "Belum mencapai kuota"
    ]);
  }

  // Tulis ulang rekap
  sheetRekap.getRange(2, 1, Math.max(sheetRekap.getLastRow() - 1, 1), 8).clearContent();
  if (rekapRows.length > 0) {
    sheetRekap.getRange(2, 1, rekapRows.length, rekapRows[0].length).setValues(rekapRows);
  }
}

/**
 * Ambil seluruh data dari Google Spreadsheet untuk dikembalikan ke Web App
 */
function getAllData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    classes: getSheetObjects(ss.getSheetByName(SHEET_KELAS)),
    students: getSheetObjects(ss.getSheetByName(SHEET_SISWA)),
    teachers: getSheetObjects(ss.getSheetByName(SHEET_GURU)),
    settings: getSettingsMap(ss.getSheetByName(SHEET_SETTINGS))
  };
}

function getSettingsMap(sheet) {
  if (!sheet || sheet.getLastRow() <= 1) return {};
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  var map = {};
  for (var i = 0; i < data.length; i++) {
    map[data[i][0]] = data[i][1];
  }
  return map;
}

function getSheetObjects(sheet) {
  if (!sheet || sheet.getLastRow() <= 1) return [];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  var list = [];
  for (var r = 0; r < rows.length; r++) {
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      obj[headers[c]] = rows[r][c];
    }
    list.push(obj);
  }
  return list;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export const INDEX_HTML_SCRIPT = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portal Sistem Presensi Kursus</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #f8fafc;
      color: #1e293b;
      padding: 32px 16px;
      display: flex;
      justify-content: center;
      min-height: 100vh;
    }
    .container {
      max-width: 680px;
      width: 100%;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 20px -2px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
      padding: 32px;
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      background: #ecfdf5;
      color: #059669;
      margin-bottom: 12px;
    }
    h1 { font-size: 22px; color: #0f172a; margin-bottom: 8px; }
    p { font-size: 14px; color: #64748b; line-height: 1.6; }
    .card {
      background: #f1f5f9;
      border-radius: 12px;
      padding: 16px;
      margin: 20px 0;
      border-left: 4px solid #3b82f6;
    }
    .card h3 { font-size: 15px; color: #1e293b; margin-bottom: 6px; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 12px 20px;
      border-radius: 10px;
      background: #2563eb;
      color: #ffffff;
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }
    .btn:hover { background: #1d4ed8; }
    .btn-secondary {
      background: #f8fafc;
      color: #334155;
      border: 1px solid #cbd5e1;
      margin-top: 10px;
    }
    .btn-secondary:hover { background: #e2e8f0; }
    .status-box {
      margin-top: 16px;
      padding: 12px;
      border-radius: 8px;
      font-size: 13px;
      display: none;
    }
    .status-success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Google Apps Script Web App Aktif</span>
      <h1>Portal Database Presensi Kursus</h1>
      <p>Layanan backend Google Apps Script telah terhubung ke Google Spreadsheet ini untuk menyimpan rekaman presensi kelas, data siswa, guru, dan kalkulasi invoice otomatis.</p>
    </div>

    <div class="card">
      <h3>Pengaturan Database Otomatis</h3>
      <p>Klik tombol di bawah untuk memeriksa atau menginisialisasi ulang seluruh sheet (Kelas, Siswa, Guru, PresensiSiswa, PresensiGuru, RekapInvoice).</p>
    </div>

    <button id="btnSetup" class="btn" onclick="runSetup()">⚡ Jalankan Setup Database Sheet Sekarang</button>
    <div id="statusBox" class="status-box status-success"></div>

    <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
      Sistem Presensi Kursus • Google Spreadsheet API Connector
    </div>
  </div>

  <script>
    function runSetup() {
      var btn = document.getElementById('btnSetup');
      var statusBox = document.getElementById('statusBox');
      btn.disabled = true;
      btn.innerText = 'Sedang menyiapkan sheet...';
      
      google.script.run
        .withSuccessHandler(function(result) {
          btn.disabled = false;
          btn.innerText = '⚡ Jalankan Setup Database Sheet Sekarang';
          statusBox.style.display = 'block';
          statusBox.innerText = 'Berhasil: ' + result;
        })
        .withFailureHandler(function(error) {
          btn.disabled = false;
          btn.innerText = '⚡ Coba Lagi Setup';
          statusBox.style.display = 'block';
          statusBox.className = 'status-box';
          statusBox.style.background = '#fef2f2';
          statusBox.style.color = '#991b1b';
          statusBox.innerText = 'Gagal: ' + error.message;
        })
        .setupDatabase();
    }
  </script>
</body>
</html>
`;
