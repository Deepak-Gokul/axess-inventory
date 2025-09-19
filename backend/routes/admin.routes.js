import express from "express";
import { getAllItems, getItemLogs,updateItem,bulkCreateItems,deleteAllItems,markItemReceived } from "../controllers/admin.controller.js";
import { createItem,deleteItem } from "../controllers/admin.controller.js";
import { uploadCertificate,uploadExcelFile } from "../middleware/upload.middleware.js";
import { adminLogin,downloadQr } from "../controllers/admin.controller.js";
import { verifyAdmin,verifySuperAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

router.post('/login', adminLogin);

// Get all items
router.get("/items",verifyAdmin,verifySuperAdmin, getAllItems);

router.post("/bulk-create-items",uploadExcelFile.single("sheet"),verifyAdmin,verifySuperAdmin,bulkCreateItems)

router.get('/verify', verifyAdmin, (req, res) => {
  res.json({ success: true, role: req.role });
});

router.get('/download-qr/:assetId',verifyAdmin,verifySuperAdmin, downloadQr);


router.put("/:assetId",verifyAdmin,verifySuperAdmin, uploadCertificate.single("certificate"), updateItem);

// Create item (optional PDF upload)
router.post("/item",verifyAdmin,verifySuperAdmin, uploadCertificate.single("certificate"), createItem);

// Get logs for a single item
router.get("/item/:assetId/logs",verifyAdmin,verifySuperAdmin, getItemLogs);

router.delete("/:assetId",verifyAdmin,verifySuperAdmin, deleteItem);
 
router.delete("/all-items",verifyAdmin,verifySuperAdmin,deleteAllItems)

router.patch('/:assetId/mark-received', verifyAdmin, markItemReceived);

export default router;