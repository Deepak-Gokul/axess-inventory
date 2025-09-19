import fs from "fs";
import multer from "multer";
import path from "path";

// Save uploaded PDFs in uploads/certificates
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/certificates");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const uploadCertificate = multer({
  storage: pdfStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// Save uploaded Excels in uploads/excels
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/excels");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const uploadExcelFile = multer({
  storage: excelStorage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files are allowed"));
    }
  },
});

// Helper function to delete a file asynchronously
export function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Failed to delete file at ${filePath}:`, err);
    }
  });
}