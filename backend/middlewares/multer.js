import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage(); // Use memory storage for Cloudinary

const fileFilter = (req, file, callback) => {
  const filetypes = /pdf/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return callback(null, true);
  }
  callback(new Error('Only PDF files are allowed!'), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

export default upload;










// import multer from 'multer'

// const storage = multer.diskStorage({
//     filename: function(req,file,callback){
//         callback(null,file.originalname)
//     }
// })

// const upload = multer({storage})

// export default upload