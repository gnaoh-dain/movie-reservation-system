import multer from 'multer';
import { env } from './env';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, env.upload.dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: env.upload.maxFileSize },
  fileFilter: function (req, file, cb) {
    if (!env.upload.allowedFileTypes.includes(file.mimetype)) {
      return cb(new Error('Only the following file types are allowed: ' + env.upload.allowedFileTypes.join(', ')));
    }
    cb(null, true);
  },
});

export { upload };
