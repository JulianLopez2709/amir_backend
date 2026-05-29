import multer from "multer";

const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png"]);

const storage = multer.memoryStorage();

const factusLogoUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes png, jpg o jpeg"));
    }
  },
});

export default factusLogoUpload;
