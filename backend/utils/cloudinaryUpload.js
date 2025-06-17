import cloudinary from '../config/cloudinary.js';

const uploadToCloudinary = async (file, userId, companyName) => {
  try {
    const publicId = `company_${userId}_${companyName.replace(/\s+/g, '_')}_${Date.now()}`.toLowerCase(); // Unique ID
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw', // For PDFs
          folder: 'company_pdfs', // Specified folder
          public_id: publicId, // Custom public ID
          format: 'pdf', // Explicitly set the format to PDF
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