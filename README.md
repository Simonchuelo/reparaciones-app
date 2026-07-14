# 🎮 POLYBIUS VIDEOGAMES - Sistema de Reparaciones

Sistema web para gestión de reparaciones y consulta de clientes. Conecta con tu hoja de Google Sheets "Reparaciones".

## 📁 Estructura

```
reparaciones-app/
├── index.html      # Portal del cliente (consulta)
├── admin.html      # Panel de administración
├── styles.css      # Estilos
├── app.js          # Lógica principal
├── config.js       # Configuración (⚠️ EDITAR)
├── apps-script.js  # Google Apps Script (para escritura)
└── README.md       # Este archivo
```

## 🚀 Configuración

### 1. Compartir la hoja como pública

1. Abrí tu hoja de Google Sheets
2. **Archivo → Compartir → Compartir**
3. "Acceso general" → **"Cualquier persona con el enlace"**
4. Permiso: **"Lector"**

### 2. Editar config.js

```javascript
const CONFIG = {
    SHEET_ID: '1h9kh8c6G8gYHncoM8JFEiYiTdeKYqPRiIIyXCKOmKc4',
    SHEET_GID: 1702892376,  // Hoja "Reparaciones"
    SCRIPT_URL: '',         // URL del Apps Script (ver paso 3)
    // ...
};
```

### 3. Configurar Google Apps Script (para guardar datos)

Para poder **cargar reparaciones desde el panel web**, necesitás crear un Google Apps Script:

1. En tu hoja de Google Sheets, andá a **Extensiones → Apps Script**
2. Pegá el código que está en `apps-script.js`
3. Hacé clic en **"Implementar" → "Nueva implementación"**
4. Elegí **"Aplicación web"**
5. Configuralo:
   - Descripción: "API Reparaciones"
   - Ejecutar como: **Yo (tu cuenta)**
   - Quién tiene acceso: **Cualquier persona**
6. Hacé clic en **"Implementar"**
7. **Copiá la URL** que te da
8. Pegá esa URL en `config.js` en el campo `SCRIPT_URL`

### 4. Abrir la aplicación

- **Portal cliente**: Abrí `index.html` en tu navegador
- **Panel admin**: Abrí `admin.html`

O usá el sitio online: https://simonchuelo.github.io/reparaciones-app/

## 📋 Uso

### Panel Admin (admin.html)

- **Buscar**: Escribí en la barra de búsqueda (funciona con orden, teléfono, consola, serie, falla)
- **Filtrar**: Hacé clic en las pestañas de estado
- **Nueva reparación**: Hacé clic en "+ Nueva Reparación"
- **Editar**: Hacé clic en el icono ✏️ de cualquier fila
- **Imprimir**: Hacé clic en 🖨️ para generar un comprobante
- **Exportar**: Hací clic en "Exportar CSV" para descargar datos

### Portal Cliente (index.html)

1. Compartí el link: `index.html?orden=NÚMERO`
   - Ejemplo: `https://simonchuelo.github.io/reparaciones-app/index.html?orden=11360`
2. El cliente ve: consola, falla, reparación, precio, estado, fecha de retiro

## 📊 Estados (calculados automáticamente)

| Estado | Cómo se determina |
|--------|-------------------|
| 📥 Recibido | Sin entrega, sin fecha retiro, sin reparación |
| 💰 Presupuesto confirmado | Confirma = "Si", sin reparación aún |
| 🔧 En reparación | Tiene tipo de reparación asignado |
| ✅ Listo para retirar | Tiene fecha de entrega en local |
| 📦 Entregado | Tiene fecha de retiro |
| ❌ No aceptado | Confirma = "No" |

## 📝 Estructura de la hoja "Reparaciones"

| Col | Campo |
|-----|-------|
| A | Fecha |
| B | Nº Orden |
| C | Teléfono |
| D | Consola |
| E | N.º de Serie |
| F | Falla Reportada |
| G | Observaciones |
| H | Técnico |
| I | Tipo de Reparación |
| J | Costo Técnico |
| K | Confirma |
| L | Precio de reparación |
| M | Entrega local |
| N | Fecha retiro |

---

**POLYBIUS VIDEOGAMES** 🎮
