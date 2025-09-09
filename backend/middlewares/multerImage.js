import multer from 'multer';
import path from 'path';

const imageStorage = multer.memoryStorage();

const imageFilter = (req, file, callback) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype.toLowerCase());
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) return callback(null, true);
  callback(new Error('Only image files (jpeg, jpg, png) are allowed!'), false);
};

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter,
});

export default imageUpload;
