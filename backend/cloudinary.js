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

    let res;

    if (Buffer.isBuffer(localFilePath)) {
      // Detect type: PDF or image
      const isPDF = localFilePath.slice(0, 4).toString() === '%PDF';
      const mimeType = isPDF ? 'application/pdf' : 'image/png'; // you can default to PNG
      const base64String = localFilePath.toString("base64");
      res = await cloudinary.uploader.upload(`data:${mimeType};base64,${base64String}`, {
        resource_type: "auto",
        ...options
      });
    } else if (typeof localFilePath === "string") {
      res = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
        ...options
      });
      fs.unlinkSync(localFilePath); // remove temp file
    } else {
      return null;
    }

    return res;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    if (typeof localFilePath === "string") fs.unlinkSync(localFilePath);
    return null;
  }
};

export default cloudinary
