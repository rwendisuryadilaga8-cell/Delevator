import { AttendanceSession, CourseClass, CourseSettings, Student, Teacher } from '../types';

export interface GasSyncPayload {
  action: 'syncAll' | 'saveAttendance' | 'setup';
  data?: {
    settings: CourseSettings;
    classes: CourseClass[];
    students: Student[];
    teachers: Teacher[];
    sessions: AttendanceSession[];
  };
  session?: AttendanceSession;
}

export async function sendDataToGas(
  gasWebAppUrl: string,
  payload: GasSyncPayload
): Promise<{ success: boolean; message: string }> {
  if (!gasWebAppUrl || !gasWebAppUrl.trim().startsWith('https://script.google.com')) {
    return {
      success: false,
      message: 'URL Google Apps Script belum disetel atau tidak valid. Silakan isi di menu Pengaturan.',
    };
  }

  try {
    // Standard CORS POST with text/plain prevents preflight block in Google Apps Script Web App
    const response = await fetch(gasWebAppUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let json: any = {};
    try {
      json = JSON.parse(text);
    } catch {
      // Sometimes GAS returns HTML redirect or text
      if (response.ok) {
        return { success: true, message: 'Data terkirim ke Google Apps Script!' };
      }
    }

    if (json.status === 'success' || response.ok) {
      return {
        success: true,
        message: json.message || 'Sinkronisasi dengan Google Spreadsheet berhasil!',
      };
    } else {
      return {
        success: false,
        message: json.message || 'Respon Google Apps Script gagal.',
      };
    }
  } catch (error: any) {
    console.error('GAS sync error:', error);
    return {
      success: false,
      message: `Gagal menghubungkan ke Google Apps Script: ${error.message || error}`,
    };
  }
}

export interface GasFetchedData {
  settings?: Record<string, any>;
  classes?: any[];
  students?: any[];
  teachers?: any[];
}

export async function fetchDataFromGas(
  gasWebAppUrl: string
): Promise<{ success: boolean; data?: GasFetchedData; message: string }> {
  if (!gasWebAppUrl || !gasWebAppUrl.trim().startsWith('https://script.google.com')) {
    return {
      success: false,
      message: 'URL Google Apps Script belum disetel atau tidak valid. Isi di menu Pengaturan.',
    };
  }

  try {
    const fetchUrl = `${gasWebAppUrl.trim()}${gasWebAppUrl.includes('?') ? '&' : '?'}action=getData`;
    const response = await fetch(fetchUrl, {
      method: 'GET',
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Gagal mengambil data dari Google Apps Script (Status: ${response.status})`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
      message: 'Berhasil mengambil database dari Google Spreadsheet!',
    };
  } catch (error: any) {
    console.error('GAS fetch error:', error);
    return {
      success: false,
      message: `Gagal menarik data: ${error.message || error}. Pastikan deployment disetel "Anyone".`,
    };
  }
}
