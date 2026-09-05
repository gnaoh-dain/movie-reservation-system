import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { env } from './env';

fs.mkdirSync(env.upload.dir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, env.upload.dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path
      .extname(file.originalname)
      .toLowerCase()
      .replace(/[^.a-z0-9]/g, '');
    const _filename = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, _filename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: env.upload.maxFileSize },
  fileFilter: function (req, file, cb) {
    if (!env.upload.allowedFileTypes.includes(file.mimetype)) {
      const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname);
      error.message = 'Only the following file types are allowed: ' + env.upload.allowedFileTypes.join(', ');
      return cb(error);
    }
    cb(null, true);
  },
});

export const publicUri = (filename: string) => `image/${filename}`;

export { upload };
