// =====================================================
// GOOGLE APPS SCRIPT - POLYBIUS VIDEOGAMES
// =====================================================
// Usa doGet para todo (lectura y escritura)
// para evitar problemas de CORS desde GitHub Pages
// =====================================================

const SPREADSHEET_ID = '1h9kh8c6G8gYHncoM8JFEiYiTdeKYqPRiIIyXCKOmKc4';
const SHEET_NAME = 'Reparaciones';

function doGet(e) {
  try {
    const params = e.parameter;
    const action = params.action || 'list';

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

    // LISTAR / BUSCAR
    if (action === 'list' || action === 'get') {
      const data = sheet.getDataRange().getValues();

      if (action === 'get' && params.orden) {
        for (let i = 1; i < data.length; i++) {
          if (String(data[i][1]) === String(params.orden)) {
            return jsonResponse({ success: true, row: i + 1, data: rowToObject(data[i]) });
          }
        }
        return jsonResponse({ success: false, error: 'Orden no encontrada' });
      }

      const repairs = [];
      for (let i = 1; i < data.length; i++) {
        if (!data[i][1] && !data[i][0]) continue;
        const obj = rowToObject(data[i]);
        obj._row = i + 1;
        repairs.push(obj);
      }
      return jsonResponse({ success: true, data: repairs });
    }

    // CREAR / ACTUALIZAR
    if (action === 'save') {
      const row = [
        params.fecha || '',
        params.orden || '',
        params.telefono || '',
        params.consola || '',
        params.serie || '',
        params.falla || '',
        params.observaciones || '',
        params.tecnico || '',
        params.reparacion || '',
        params.costoTecnico || '',
        params.confirma || '',
        params.precio || '',
        params.entrega || '',
        params.fechaRetiro || '',
        params.nombre || ''
      ];

      const existing = sheet.getDataRange().getValues();
      let targetRow = -1;

      for (let i = 1; i < existing.length; i++) {
        if (String(existing[i][1]) === String(params.orden)) {
          targetRow = i + 1;
          break;
        }
      }

      if (targetRow > 0) {
        sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
        return jsonResponse({ success: true, action: 'updated', orden: params.orden });
      } else {
        sheet.insertRowBefore(2);
        sheet.getRange(2, 1, 1, row.length).setValues([row]);
        return jsonResponse({ success: true, action: 'created', orden: params.orden });
      }
    }

    // CONFIRMAR / CANCELAR PRESUPUESTO (desde portal cliente)
    if (action === 'confirm') {
      const orden = params.orden;
      const valor = params.confirma;

      if (!orden || !valor) {
        return jsonResponse({ success: false, error: 'Falta orden o valor de confirmación' });
      }

      const existing = sheet.getDataRange().getValues();
      for (let i = 1; i < existing.length; i++) {
        if (String(existing[i][1]) === String(orden)) {
          sheet.getRange(i + 1, 11).setValue(valor);
          return jsonResponse({ success: true, action: 'confirmed', orden: orden, confirma: valor });
        }
      }
      return jsonResponse({ success: false, error: 'Orden no encontrada' });
    }

    return jsonResponse({ success: false, error: 'Acción no válida' });

  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

function doPost(e) {
  return doGet(e);
}

function formatDate(val) {
  if (val instanceof Date) {
    const d = val.getDate();
    const m = val.getMonth() + 1;
    const y = val.getFullYear();
    return d + '/' + m + '/' + y;
  }
  return String(val || '');
}

function rowToObject(row) {
  return {
    fecha: formatDate(row[0]),
    orden: String(row[1] || ''),
    telefono: String(row[2] || ''),
    consola: String(row[3] || ''),
    serie: String(row[4] || ''),
    falla: String(row[5] || ''),
    observaciones: String(row[6] || ''),
    tecnico: String(row[7] || ''),
    reparacion: String(row[8] || ''),
    costoTecnico: String(row[9] || ''),
    confirma: String(row[10] || ''),
    precio: String(row[11] || ''),
    entrega: formatDate(row[12]),
    fechaRetiro: formatDate(row[13]),
    nombre: String(row[14] || '')
  };
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
