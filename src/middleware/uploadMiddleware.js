import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configuración del almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'amir_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], 
  
  },
});

const upload = multer({ storage: storage });

export default upload;
