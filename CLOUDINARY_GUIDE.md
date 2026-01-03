# Guía de Integración de Cloudinary

Esta guía explica cómo configurar y utilizar la funcionalidad de carga de imágenes con Cloudinary en tu backend.

## 1. Configuración Inicial

### Variables de Entorno
Asegúrate de haber configurado las siguientes variables en tu archivo `.env`:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

Puedes obtener estos valores en tu [Dashboard de Cloudinary](https://console.cloudinary.com/).

## 2. Estructura de Archivos

Hemos creado dos archivos principales:

1.  **`src/config/cloudinary.js`**:
    *   Este archivo inicializa la conexión con Cloudinary usando tus credenciales.
    *   Exporta la instancia configurada para ser usada en otras partes de la aplicación.

2.  **`src/middleware/uploadMiddleware.js`**:
    *   Utiliza `multer` y `multer-storage-cloudinary` para manejar la subida de archivos.
    *   Define dónde se guardarán los archivos (carpeta `amir_uploads`) y qué formatos son permitidos (jpg, png, jpeg, webp).
    *   Exporta el middleware `upload` listo para usar en tus rutas.

## 3. Cómo Usar en tus Rutas (Endpoints)

Para permitir la subida de una imagen en un endpoint, debes importar el middleware y usarlo en la definición de la ruta.

### Ejemplo de Implementación

Supongamos que quieres permitir subir una imagen de perfil para un usuario en `src/routers/user.routers.js`.

**Paso 1: Importar el middleware**

```javascript
import upload from '../middleware/uploadMiddleware.js';
// ... otros imports
```

**Paso 2: Agregar el middleware a la ruta**

Usa `upload.single('nombre_del_campo')` si esperas un solo archivo, o `upload.array('nombre_del_campo')` si esperas varios.

```javascript
// Ejemplo para subir una sola imagen con el campo 'avatar'
router.post('/upload-avatar', upload.single('avatar'), (req, res) => {
    // Si la subida es exitosa, Cloudinary devuelve la información del archivo en req.file
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    // req.file.path contiene la URL de la imagen en Cloudinary
    res.status(200).json({
        message: 'Imagen subida con éxito',
        imageUrl: req.file.path,
        fileInfo: req.file
    });
});
```

### Ejemplo en un Controlador Real

Si usas controladores (recomendado), la ruta se vería así:

**En `src/routers/product.routers.js`:**
```javascript
import upload from '../middleware/uploadMiddleware.js';
import { createProduct } from '../controllers/product.controller.js';

// 'image' es el nombre del campo que el frontend debe enviar en el FormData
router.post('/', upload.single('image'), createProduct);
```

**En `src/controllers/product.controller.js`:**
```javascript
export const createProduct = async (req, res) => {
    try {
        const imageUrl = req.file ? req.file.path : null; // Obtener URL de Cloudinary
        const { name, price } = req.body; // Obtener otros datos

        // Crear producto en la base de datos
        // ... lógica de base de datos ...

        res.status(201).json({ success: true, data: { name, price, imageUrl } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

## 4. Pruebas con Postman / Insomnia

1.  Crea una petición **POST**.
2.  Ve a la pestaña **Body**.
3.  Selecciona **form-data**.
4.  Agrega una clave (Key) con el nombre que definiste en `upload.single('...')` (por ejemplo, `image` o `avatar`).
5.  Cambia el tipo de campo de "Text" a **"File"**.
6.  Selecciona una imagen de tu computadora.
7.  Envía la petición.

¡Listo! Tu backend ahora puede recibir imágenes, subirlas automáticamente a Cloudinary y entregarte la URL pública para guardarla en tu base de datos.
