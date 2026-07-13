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
    // Ejemplo: https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
    SHEET_ID: '1h9kh8c6G8gYHncoM8JFEiYiTdeKYqPRiIIyXCKOmKc4',

    // Número de la hoja (pestaña) donde están los datos
    // 0 = primera hoja, 1 = segunda hoja, etc.
    SHEET_GID: 0,

    // API Key de Google Cloud (opcional si la hoja es pública)
    // Si tu hoja está compartida como "Cualquier persona con el enlace puede ver"
    // no necesitas API Key
    API_KEY: '',

    // Nombre de la empresa (aparece en el header)
    EMPRESA: 'POLYBIUS VIDEOGAMES',
    SUBTITULO: 'SERVICIO TÉCNICO',
    TELEFONO: '11-6467-3729',

    // Columnas de la hoja (empezando desde 0)
    // Ajustá estos números según el orden de tus columnas
    COLUMNAS: {
        FECHA: 0,           // Columna A
        ORDEN: 1,           // Columna B
        CLIENTE: 2,         // Columna C
        TELEFONO: 3,        // Columna D
        CONSOLA: 4,         // Columna E
        SERIE: 5,           // Columna F
        FALLA: 6,           // Columna G
        REPARACION: 7,      // Columna H
        ESTADO: 8,          // Columna I
        PRECIO: 9,          // Columna J
        CONFIRMADO: 10,     // Columna K
        LISTO_RETIRAR: 11,  // Columna L
        OBSERVACIONES: 12   // Columna M
    },

    // Estados posibles de una reparación
    ESTADOS: {
        RECIBIDO: 'Recibido',
        EN_PRESUPUESTO: 'En presupuesto',
        ESPERANDO_REPUESTO: 'Esperando repuesto',
        EN_REPARACION: 'En reparación',
        LISTO: 'Listo para retirar',
        ENTREGADO: 'Entregado',
        CANCELADO: 'Cancelado'
    },

    // Colores para cada estado (para el dashboard)
    COLORES_ESTADO: {
        'Recibido': '#3b82f6',
        'En presupuesto': '#f59e0b',
        'Esperando repuesto': '#8b5cf6',
        'En reparación': '#f97316',
        'Listo para retirar': '#10b981',
        'Entregado': '#6b7280',
        'Cancelado': '#ef4444'
    }
};

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
