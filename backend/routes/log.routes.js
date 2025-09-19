import express from "express";
import { toggleItemStatus } from "../controllers/log.controller.js";

import { verifyAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// Toggle IN/OUT status
router.patch("/:assetId/status",verifyAdmin, toggleItemStatus);

export default router;