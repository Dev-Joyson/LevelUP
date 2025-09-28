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

/**
 * Uploads interview PDF report to Cloudinary.
 * @param {Buffer} pdfBuffer - The PDF file buffer.
 * @param {String} studentId - The student ID.
 * @param {String} sessionId - The interview session ID.
 * @param {String} studentName - Student's name for folder organization.
 */
const uploadInterviewPDFToCloudinary = async (pdfBuffer, studentId, sessionId, studentName = 'student') => {
  try {
    const sanitizedName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
    const publicId = `interview_report_${studentId}_${sessionId}_${Date.now()}`.toLowerCase();

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw', // For PDFs
          folder: `interview-reports/${sanitizedName}`, // Organized by student name
          public_id: publicId,
          format: 'pdf',
          tags: ['interview-report', 'student-document'] // Tags for easy management
        },
        (error, result) => {
          if (error) return reject(new Error(`Cloudinary PDF upload failed: ${error.message}`));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            originalFilename: result.original_filename,
            bytes: result.bytes,
            uploadedAt: new Date()
          });
        }
      );
      stream.end(pdfBuffer);
    });
  } catch (error) {
    throw new Error(`Cloudinary PDF upload failed: ${error.message}`);
  }
};

export { uploadToCloudinary, uploadInterviewPDFToCloudinary };





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