// =====================================================
// GOOGLE APPS SCRIPT - POLYBIUS VIDEOGAMES
// =====================================================
// Este código va en: Extensiones → Apps Script
// Permite guardar reparaciones desde el panel web
// =====================================================

// ID de tu hoja de cálculo
const SPREADSHEET_ID = '1h9kh8c6G8gYHncoM8JFEiYiTdeKYqPRiIIyXCKOmKc4';

// Hoja donde se guardan los datos
const SHEET_NAME = 'Reparaciones';

// Headers de las columnas (fila 1)
const HEADERS = [
  'Fecha', 'Nº Orden', 'Teléfono', 'Consola', 'N.º de Serie',
  'Falla Reportada', 'Observaciones', 'Técnico', 'Tipo de Reparación',
  'Costo Técnico', 'Confirma', 'Precio de reparación', 'Entrega local', 'Fecha retiro'
];

// =====================================================
// GET - Consultar reparaciones
// =====================================================
function doGet(e) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  // Si pide una orden específica
  if (e && e.parameter && e.parameter.orden) {
    const orden = e.parameter.orden;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][1]) === orden) {
        const repair = {};
        HEADERS.forEach((header, idx) => {
          repair[header] = data[i][idx];
        });
        return ContentService
          .createTextOutput(JSON.stringify({ success: true, data: repair }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Orden no encontrada' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Devolver todas las reparaciones
  const repairs = [];
  for (let i = 1; i < data.length; i++) {
    if (!data[i][1] || isNaN(data[i][1])) continue; // Skip empty/non-order rows
    const repair = {};
    HEADERS.forEach((header, idx) => {
      repair[header] = data[i][idx];
    });
    repairs.push(repair);
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, data: repairs }))
    .setMimeType(ContentService.MimeType.JSON);
}

// =====================================================
// POST - Guardar nueva reparación
// =====================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    // Preparar fila
    const row = [
      data.fecha || '',
      data.orden || '',
      data.telefono || '',
      data.consola || '',
      data.serie || '',
      data.falla || '',
      data.observaciones || '',
      data.tecnico || '',
      data.reparacion || '',
      data.costoTecnico || '',
      data.confirma || '',
      data.precio || '',
      data.entrega || '',
      data.fechaRetiro || ''
    ];
    
    // Buscar si ya existe la orden
    const existingData = sheet.getDataRange().getValues();
    let existingRow = -1;
    
    for (let i = 1; i < existingData.length; i++) {
      if (String(existingData[i][1]) === String(data.orden)) {
        existingRow = i + 1; // +1 because getValues is 0-indexed, but rows are 1-indexed
        break;
      }
    }
    
    if (existingRow > 0) {
      // Actualizar fila existente
      sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, action: 'updated', orden: data.orden }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      // Insertar nueva fila
      sheet.appendRow(row);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, action: 'created', orden: data.orden }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =====================================================
// PUT - Actualizar reparación existente
// =====================================================
function doPut(e) {
  return doPost(e); // Misma lógica: busca por orden y actualiza
}

// =====================================================
// Test function (para probar desde el editor)
// =====================================================
function testGet() {
  const result = doGet({ parameter: {} });
  Logger.log(result.getContent());
}

function testPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        fecha: '13/7/2026',
        orden: '99999',
        telefono: '1112345678',
        consola: 'PS5 Test',
        serie: 'TEST123',
        falla: 'No enciende',
        observaciones: 'Test',
        tecnico: 'Dario',
        reparacion: 'Cambio de fuente',
        costoTecnico: '$50.000',
        confirma: 'Si',
        precio: '$100.000',
        entrega: '14/7',
        fechaRetiro: ''
      })
    }
  };
  
  const result = doPost(testData);
  Logger.log(result.getContent());
}
