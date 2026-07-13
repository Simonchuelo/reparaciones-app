// =====================================================
// CONFIGURACIÓN - POLYBIUS VIDEOGAMES - SERVICIO TÉCNICO
// =====================================================

const CONFIG = {
    // ID de tu hoja de cálculo (está en la URL)
    SHEET_ID: '1h9kh8c6G8gYHncoM8JFEiYiTdeKYqPRiIIyXCKOmKc4',

    // GID de la hoja "Reparaciones" (donde se guardan los datos)
    SHEET_GID: 1702892376,

    // Google Apps Script URL para escritura
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyxEBo6NxMuQ5DbvzSQzX4xioNm_csLduVR08a5x4PjmJ_xwWYDnpokZFFYEiDBCWo/exec',

    // Datos del negocio
    EMPRESA: 'POLYBIUS VIDEOGAMES',
    SUBTITULO: 'SERVICIO TÉCNICO',
    TELEFONO: '11-6467-3729',
    WHATSAPP: '5491164673729',
    DIRECCION: '',

    // Columnas de la hoja "Reparaciones" (empezando desde 0)
    COLUMNAS: {
        FECHA: 0,
        ORDEN: 1,
        TELEFONO: 2,
        CONSOLA: 3,
        SERIE: 4,
        FALLA: 5,
        OBSERVACIONES: 6,
        TECNICO: 7,
        REPARACION: 8,
        COSTO_TECNICO: 9,
        CONFIRMA: 10,
        PRECIO: 11,
        ENTREGA: 12,
        FECHA_RETIRO: 13,
        NOMBRE: 14
    },

    // Estados derivados de los datos
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
    TECNICOS: ['Dario', 'Gabriel', 'local'],

    // Contraseña del panel admin (base64)
    ADMIN_PASS: 'NDA0MTAwcXdlMDA='
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
