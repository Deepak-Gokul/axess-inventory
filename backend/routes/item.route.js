import express from "express";
import {getItemById,downloadCertificate} from "../controllers/item.controller.js";

const router = express.Router();

// Create item (optional PDF upload)


// Get single item (for QR scan)
router.get("/:assetId", getItemById);
router.get('/download-certificate/:assetId', downloadCertificate);


export default router;