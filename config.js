// =====================================================
// CONFIGURACIÓN - POLYBIUS VIDEOGAMES - SERVICIO TÉCNICO
// =====================================================
// Instrucciones:
// 1. Crear una cuenta de Google Cloud (https://console.cloud.google.com)
// 2. Crear un proyecto nuevo
// 3. Habilitar Google Sheets API
// 4. Crear credenciales (API Key)
// 5. Compartir tu hoja de cálculo con el email del Service Account
//    O configurar la API Key para acceso público de lectura
// =====================================================

const CONFIG = {
    // ID de tu hoja de cálculo (está en la URL)
    SHEET_ID: '1h9kh8c6G8gYHncoM8JFEiYiTdeKYqPRiIIyXCKOmKc4',

    // GID de la hoja "Reparaciones" (donde se guardan los datos)
    SHEET_GID: 1702892376,

    // API Key de Google Cloud (opcional si la hoja es pública)
    API_KEY: '',

    // Google Apps Script URL para escritura (ver README)
    // Si lo dejás vacío, solo lectura. Creá un Apps Script para habilitar escritura.
    SCRIPT_URL: '',

    // Datos del negocio
    EMPRESA: 'POLYBIUS VIDEOGAMES',
    SUBTITULO: 'SERVICIO TÉCNICO',
    TELEFONO: '11-6467-3729',
    DIRECCION: '',

    // Columnas de la hoja "Reparaciones" (empezando desde 0)
    COLUMNAS: {
        FECHA: 0,           // A - Fecha
        ORDEN: 1,           // B - Nº Orden
        TELEFONO: 2,        // C - Teléfono
        CONSOLA: 3,         // D - Consola
        SERIE: 4,           // E - N.º de Serie
        FALLA: 5,           // F - Falla Reportada
        OBSERVACIONES: 6,   // G - Observaciones
        TECNICO: 7,         // H - Técnico
        REPARACION: 8,      // I - Tipo de Reparación
        COSTO_TECNICO: 9,   // J - Costo Técnico
        CONFIRMA: 10,       // K - Confirma
        PRECIO: 11,         // L - Precio de reparación
        ENTREGA: 12,        // M - Entrega local
        FECHA_RETIRO: 13    // N - Fecha retiro
    },

    // Estados derivados de los datos
    // Se calculan automáticamente basándose en los campos
    ESTADOS: {
        RECIBIDO: 'Recibido',
        EN_PRESUPUESTO: 'En presupuesto',
        ESPERANDO_REPUESTO: 'Esperando repuesto',
        EN_REPARACION: 'En reparación',
        LISTO: 'Listo para retirar',
        ENTREGADO: 'Entregado',
        CANCELADO: 'Cancelado'
    },

    // Técnicos disponibles
    TECNICOS: ['Dario', 'Gabriel', 'local']
};

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
