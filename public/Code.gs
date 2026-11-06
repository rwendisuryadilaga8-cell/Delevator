/**
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
    sheetSettings.appendRow(["slogan", "Your Englsih Master", new Date()]);
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

function saveAttendanceSession(ss, session) {
  var sheetPresensiSiswa = getOrCreateSheet(ss, SHEET_PRESENSI_SISWA);
  var sheetPresensiGuru = getOrCreateSheet(ss, SHEET_PRESENSI_GURU);
  var now = new Date();

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

  if (session.studentEntries && session.studentEntries.length > 0) {
    var rows = [];
    for (var i = 0; i < session.studentEntries.length; i++) {
      var entry = session.studentEntries[i];
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

  sheetRekap.getRange(2, 1, Math.max(sheetRekap.getLastRow() - 1, 1), 8).clearContent();
  if (rekapRows.length > 0) {
    sheetRekap.getRange(2, 1, rekapRows.length, rekapRows[0].length).setValues(rekapRows);
  }
}

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
