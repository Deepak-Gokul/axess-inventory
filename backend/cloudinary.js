import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

// Configure using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath, options = {}) => {
  try {
    if (!localFilePath) return null;
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // detects pdf/png automatically
      ...options
    });
    fs.unlinkSync(localFilePath); // remove temp file
    return res; // contains res.secure_url
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    fs.unlinkSync(localFilePath); // remove temp file even if failed
    return null;
  }
};

export default cloudinary
