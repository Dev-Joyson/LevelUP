import cloudinary from '../config/cloudinary.js';

/**
 * Uploads a file (PDF or image) to Cloudinary.
 * @param {Object} file - Multer file object with a buffer.
 * @param {String} userId - The user ID (used in folder/publicId).
 * @param {String} label - Name like student name or company name.
 * @param {Object} options - Optional: { folder, resourceType, format }
 */
const uploadToCloudinary = async (file, userId, label, options = {}) => {
  const {
    folder = 'uploads', // Default folder
    resourceType = 'raw', // raw = PDFs, image = profile pic
    format = resourceType === 'image' ? undefined : 'pdf', // Don't force format for image
  } = options;

  try {
    const publicId = `${resourceType}_${userId}_${label.replace(/\s+/g, '_')}_${Date.now()}`.toLowerCase();

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder,
          public_id: publicId,
          format,
        },
        (error, result) => {
          if (error) return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      stream.end(file.buffer);
    });
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

export { uploadToCloudinary };





// import cloudinary from '../config/cloudinary.js';

// const uploadToCloudinary = async (file, userId, companyName) => {
//   try {
//     const publicId = `company_${userId}_${companyName.replace(/\s+/g, '_')}_${Date.now()}`.toLowerCase(); // Unique ID
//     return new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         {
//           resource_type: 'raw', // For PDFs
//           folder: 'company_pdfs', // Specified folder
//           public_id: publicId, // Custom public ID
//           format: 'pdf', // Explicitly set the format to PDF
//         },
//         (error, result) => {
//           if (error) return reject(new Error(`Cloudinary upload failed: ${error.message}`));
//           resolve({
//             url: result.secure_url,
//             publicId: result.public_id,
//           });
//         }
//       );
//       stream.end(file.buffer);
//     });
//   } catch (error) {
//     throw new Error(`Cloudinary upload failed: ${error.message}`);
//   }
// };

// export { uploadToCloudinary };