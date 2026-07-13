# 🎮 POLYBIUS VIDEOGAMES - Sistema de Reparaciones

Sistema web para gestión de reparaciones y consulta de clientes.

## 📁 Estructura del Proyecto

```
reparaciones-app/
├── index.html      # Portal del cliente (consulta)
├── admin.html      # Panel de administración
├── styles.css      # Estilos de la aplicación
├── app.js          # Lógica principal
├── config.js       # Configuración (⚠️ EDITAR)
└── README.md       # Este archivo
```

## 🚀 Configuración Rápida

### Paso 1: Configurar tu hoja de cálculo

1. Abrí tu hoja de Google Sheets
2. Andá a **Archivo → Compartir → Compartir**
3. En "Acceso general", seleccioná: **"Cualquier persona con el enlace"**
4. Elegí el permiso: **"Lector"**
5. Copiá el **ID de la hoja** de la URL:
   ```
   https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
   ```

### Paso 2: Editar la configuración

Abrí el archivo `config.js` y completá:

```javascript
const CONFIG = {
    // Pegá el ID de tu hoja acá
    SHEET_ID: 'TU_ID_DE_AQUI',
    
    // Si tenés varias pestañas, indicá cuál usar (0 = primera)
    SHEET_GID: 0,
    
    // Tu API key (opcional si la hoja es pública)
    API_KEY: '',
    
    // Datos de tu negocio
    EMPRESA: 'POLYBIUS VIDEOGAMES',
    SUBTITULO: 'SERVICIO TÉCNICO',
    TELEFONO: '11-6467-3729',
    
    // Orden de las columnas en tu hoja
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
    }
};
```

### Paso 3: Abrir la aplicación

Simplemente abrí `index.html` en tu navegador. ¡No necesitás instalar nada!

## 📋 Uso del Sistema

### Para vos (Administrador):

1. Abrí `admin.html` en tu navegador
2. Vas a ver un dashboard con estadísticas
3. Usá la barra de búsqueda para encontrar reparaciones
4. Filtrá por estado usando las pestañas
5. Hacé clic en una reparación para editarla

### Para tus clientes:

1. Compartí este link: `index.html?orden=NÚMERO_DE_ORDEN`
   - Ejemplo: `index.html?orden=11361`
2. El cliente ingresa su número de orden
3. Ve el estado, precio, y si está listo para retirar

## 📊 Estados de Reparación

| Estado | Descripción |
|--------|-------------|
| 📥 Recibido | Equipo recibido, esperando revisión |
| 💰 En presupuesto | Siendo evaluado, pendiente de costo |
| 📦 Esperando repuesto | Se necesita un repuesto |
| 🔧 En reparación | Siendo reparado |
| ✅ Listo para retirar | Reparado, esperando al cliente |
| 📦 Entregado | Cliente retiró el equipo |
| ❌ Cancelado | Reparación cancelada |

## 🔧 Solución de Problemas

### "No se encontraron reparaciones"

1. Verificá que el `SHEET_ID` en `config.js` sea correcto
2. Asegurate de que tu hoja esté compartida como "Cualquier persona con el enlace"
3. Revisá que el `SHEET_GID` sea el número correcto de la pestaña

### "Error al cargar los datos"

1. Abrí la consola del navegador (F12) para ver el error exacto
2. Verificá la URL de tu hoja en el navegador
3. Asegurate de tener conexión a internet

### Los datos no coinciden

1. Revisá el orden de las columnas en `config.js`
2. Verificá que los números de columna empiecen desde 0

## 🚀 Opciones de Hosting (Opcional)

Si querés tener la aplicación online para que tus clientes la usen desde el celular:

### GitHub Pages (Gratis)

1. Creá una cuenta en [GitHub](https://github.com)
2. Subí los archivos a un repositorio nuevo
3. Andá a Settings → Pages → Source → Main branch
4. Tu sitio estará en `https://tuusuario.github.io/nombre-repo/`

### Netlify (Gratis)

1. Andá a [Netlify](https://netlify.com)
2. Arrastrá la carpeta `reparaciones-app`
3. ¡Listo! Te da un link online

## 📝 Estructura de la Hoja de Cálculo

Tu hoja debe tener este orden de columnas:

| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Fecha | Nº Orden | Cliente | Teléfono | Consola | N. Serie | Falla | Reparación | Estado | Precio | Confirmado | Listo | Obs. |

**Importante:** Las primeras 3 filas son el título/subtítulo. Los datos empiezan en la fila 4.

## 🔄 Actualizar Datos

Los datos se cargan automáticamente desde Google Sheets cada vez que:
- Se abre la página
- Se hace clic en "Actualizar"
- Se busca una reparación

Para que los cambios aparezcan, editá directamente la hoja de Google Sheets.

## 💡 Tips

- **Para clientes**: Mandá el link `index.html?orden=XXXXX` por WhatsApp
- **Para buscar rápido**: En el admin, usá la barra de búsqueda (funciona con nombre, teléfono, consola, etc.)
- **Para exportar**: Hacé clic en "Exportar CSV" para descargar todos los datos

---

**Desarrollado para POLYBIUS VIDEOGAMES** 🎮
