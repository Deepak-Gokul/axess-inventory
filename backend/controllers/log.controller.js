import { PrismaClient } from "../prisma/generated/prisma/index.js";

const prisma = new PrismaClient();

// Toggle IN/OUT status and create a log
export const toggleItemStatus = async (req, res) => {
  try {
    const { assetId } = req.params;
    const body = req.body && typeof req.body === "object" ? req.body : {};

    // === Normalize location/project ===
    let location = null;
    let project = null;

    if (typeof body.location === "string" && body.location.trim() !== "") {
      location = body.location;
    } else if (body.location && typeof body.location === "object") {
      location = body.location.location ?? null;
      project =
        body.location.project ??
        body.location.assignedProject ??
        null;
    }

    project = project ?? body.project ?? body.assignedProject ?? null;

    // Find current item
    const item = await prisma.item.findFirst({ where: { id:assetId } });
    if (!item) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }

    // Toggle status
    const newStatus = item.status === "IN" ? "OUT" : "IN";

    // Update item status only
    await prisma.item.update({
      where: { id:assetId },
      data: { status: newStatus ,received: false},
     // Always reset received on status change
    });

    // Create a log record
    const log = await prisma.log.create({
      data: {
        action: newStatus,
        timestamp: new Date(),
        location: newStatus === "OUT" ? (typeof location === "string" ? location : null) : null,
        project: newStatus === "OUT" ? (typeof project === "string" ? project : null) : null,
        item: {
          connect: { id:assetId },
        },
      },
    });

    res.json({ success: true, id: item.id, newStatus, log });
  } catch (err) {
    console.error("toggleItemStatus error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};