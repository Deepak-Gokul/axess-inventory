import { PrismaClient } from "../prisma/generated/prisma/index.js";
import QRCode from 'qrcode'
import { uploadOnCloudinary } from "../cloudinary.js";
import cloudinary from "../cloudinary.js";
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();
import axios from 'axios';
import * as XLSX from 'xlsx';
import fs from 'fs';


// Download QR code
export const downloadQr = async (req, res) => {
  try {
    const { assetId } = req.params;
    const item = await prisma.item.findUnique({ where: { id: assetId } });
    if (!item || !item.qrCode) return res.status(404).send("QR code not found");

    const response = await axios.get(item.qrCode, { responseType: 'arraybuffer' });
    res.setHeader('Content-Disposition', `attachment; filename=Item-${item.id}-${item.name}.png`);
    res.setHeader('Content-Type', 'image/png');
    res.send(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error downloading QR code');
  }
};

// Download certificate


export const adminLogin = (req, res) => {
  const { email, password } = req.body;

  let role = null;
  if (email === process.env.SUPER_ADMIN_EMAIL && password === process.env.SUPER_ADMIN_PASSWORD) {
    role = "superadmin";
  } else if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    role = "admin";
  } else {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const token = jwt.sign({ email, role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 60 * 60 * 1000,
  });

  res.json({ success: true, role });
};

export const updateItem = async (req, res) => {
  try {
    const { assetId } = req.params;
    const {
      serialNo,
      name,
      category,
      subCategory,
      description,
      model,
      manufacturer,
      hsCode,
      warehouse,
      unitPrice,
      calibrationType,
      calibrationStart,
      calibrationExpiry,
      assignedProject,
    } = req.body;

    const item = await prisma.item.findUnique({ where: { id: assetId } });
    if (!item) return res.status(404).json({ success: false, error: "Item not found" });

    let updateData = { 
      serialNo,
      name,
      category,
      subCategory,
      description,
      model,
      manufacturer,
      hsCode: hsCode ? String(hsCode) : null,
      warehouse,
      unitPrice: unitPrice ? parseFloat(unitPrice) : null,
      calibrationType,
      calibrationStart: calibrationStart ? new Date(calibrationStart) : null,
      calibrationExpiry: calibrationExpiry ? new Date(calibrationExpiry) : null,
    };

    // Only update assignedProject if provided
    let projectChanged = false;
    if (typeof assignedProject !== "undefined" && assignedProject !== item.assignedProject) {
      updateData.assignedProject = assignedProject;
      projectChanged = true;
    }

    if (req.file) {
      const uploadRes = await uploadOnCloudinary(req.file.path);
      if (uploadRes) updateData.certificate = uploadRes.secure_url;
    }

    const updatedItem = await prisma.item.update({
      where: { id: assetId },
      data: updateData,
    });

    // If assignedProject changed, create a new log entry
    if (projectChanged) {
      await prisma.log.create({
        data: {
          itemId: assetId,
          action: item.status, // Log current status as action
          timestamp: new Date(),
          project: assignedProject,
          location: null,
        },
      });
    }

    res.json({ success: true, item: updatedItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export const deleteItem = async (req, res) => {
  try {
    const { assetId } = req.params;
    if (!assetId) return res.status(400).json({ success: false, error: "Missing assetId parameter" });

    const item = await prisma.item.findUnique({ where: { id: assetId } });
    if (!item) return res.status(404).json({ success: false, error: "Item not found" });

    await prisma.log.deleteMany({ where: { itemId: item.id } });

    if (item.qrCode) {
      try {
        const qrPublicId = `qrcodes/${item.id}`;
        await cloudinary.uploader.destroy(qrPublicId, { resource_type: 'image' });
      } catch (err) {
        console.error(`Error deleting QR code for item ${item.id}:`, err);
      }
    }

    if (item.certificate) {
      try {
        const certPublicId = `certificates/${item.id}.pdf`;
        await cloudinary.uploader.destroy(certPublicId, { resource_type: 'raw', format:'pdf' });
      } catch (err) {
        console.error(`Error deleting certificate for item ${item.id}:`, err);
      }
    }

    await prisma.item.delete({ where: { id: assetId } });

    res.json({ success: true, message: `Item ${assetId} deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getAllItems = async (req, res) => {
  try {
    const [items, totalItems] = await Promise.all([
      prisma.item.findMany({
        orderBy: { id: 'asc' },
      }),
      prisma.item.count(),
    ]);

    const logs = await prisma.log.findMany({
      where: { itemId: { in: items.map(i => i.id) } },
      orderBy: { timestamp: 'desc' },
    });

    const itemsWithAssignedProject = items.map(item => {
      const latestLog = logs.find(log => log.itemId === item.id);
      return {
        ...item,
        assignedProject: item.status === 'OUT' && latestLog ? latestLog.project : null,
      };
    });

    res.json({ success: true, items: itemsWithAssignedProject, total: totalItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
import sharp from 'sharp';


// Helper function to create QR with text labels
const createQRWithText = async (qrData, assetId, itemName, outputPath) => {
  try {
    // Generate QR code to buffer
    const qrBuffer = await QRCode.toBuffer(qrData, {
      width: 300,
      margin: 0,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Create text labels
    const topText = `Asset ID: ${assetId}`;
    const bottomText = itemName;

    // Create SVG for top text
    const topTextSvg = `
      <svg width="400" height="40">
        <text x="200" y="25" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="black">
          ${topText}
        </text>
      </svg>`;

    // Create SVG for bottom text
    const bottomTextSvg = `
      <svg width="400" height="40">
        <text x="200" y="25" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="black">
          ${bottomText.length > 40 ? bottomText.substring(0, 37) + '...' : bottomText}
        </text>
      </svg>`;

    // Create the final image composition
    const finalImage = await sharp({
      create: {
        width: 400,
        height: 380,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
    .composite([
      // Top text
      {
        input: Buffer.from(topTextSvg),
        top: 10,
        left: 0
      },
      // QR Code in the middle
      {
        input: qrBuffer,
        top: 50,
        left: 50
      },
      // Bottom text
      {
        input: Buffer.from(bottomTextSvg),
        top: 350,
        left: 0
      }
    ])
    .png()
    .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error('Error creating QR with text:', error);
    throw error;
  }
};

export const createItem = async (req, res) => {
  try {
    const {
      serialNo,
      name,
      category,
      subCategory,
      description,
      id,
      model,
      manufacturer,
      hsCode,
      warehouse,
      unitPrice,
      calibrationType,
      calibrationStart,
      calibrationExpiry,
    } = req.body;

    // Check if item with same id exists
    const existingItem = await prisma.item.findUnique({ where: { id } });
    if (existingItem) {
      return res.status(400).json({ success: false, error: "Item with this id already exists" });
    }

    let certificateUrl = null;
    if (req.file) {
      const uploadRes = await uploadOnCloudinary(req.file.path, { 
        resource_type: 'raw', 
        type: 'upload', 
        public_id: `certificates/${id}.pdf` 
      });
      if (uploadRes) certificateUrl = uploadRes.secure_url;
    }

    // Create item
    const item = await prisma.item.create({
      data: {
        id,
        serialNo: serialNo ? String(serialNo).trim() : null,
        name,
        category,
        subCategory,
        description,
        model,
        manufacturer,
        hsCode,
        warehouse,
        unitPrice: unitPrice ? parseFloat(unitPrice) : null,
        calibrationType,
        calibrationStart: calibrationStart ? new Date(calibrationStart) : null,
        calibrationExpiry: calibrationExpiry ? new Date(calibrationExpiry) : null,
        status: "IN",
        certificate: req.file ? certificateUrl : null
      }
    });

    // Generate QR Code with text labels
    const qrTempPath = `./uploads/qrcodes/item-${id}.png`;
    const qrUrlString = `${process.env.CLIENT_URL || 'http://localhost:5175'}/item-view/${id}`;
    
    // Create QR with Asset ID and Item Name
    await createQRWithText(qrUrlString, id, name, qrTempPath);
    
    // Upload to Cloudinary
    const qrUploadRes = await uploadOnCloudinary(qrTempPath, { 
      public_id: `qrcodes/${id}`,
      resource_type: 'image'
    });
    const qrUrl = qrUploadRes ? qrUploadRes.secure_url : null;

    // Update item with QR code URL
    const updatedItem = await prisma.item.update({
      where: { id },
      data: { qrCode: qrUrl }
    });
    
    res.status(201).json({ success: true, item: updatedItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Define mapping of Excel headers to DB fields
const headerMap = {
  "Equipment Serial No.": "serialNo",
  "Axess Asset No.": "id",
  "Equipment Type": "name",
  "Equipment Category": "category",
  "Equipment Sub Category": "subCategory",
  "Equipment Description": "description",
  "Model": "model",
  "Manufacturer / Brand": "manufacturer",
  "HS Code": "hsCode",
  "Unit Price\r\nAED": "unitPrice",
  "Calibration / Inspection": "calibrationType",
};

// Function to normalize row keys
const normalizeRow = (row) => {
  const normalized = {};
  for (const key in row) {
    const mappedKey = headerMap[key] || key; // fallback: keep original if not mapped
    normalized[mappedKey] = row[key];
  }
  return normalized;
};

export const bulkCreateItems = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    // const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets["Master Sheet"];
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
const headers = rawData[1]; // first row
const dataRows = rawData.slice(1);

const rows = dataRows.map((row) => {
  const obj = {};
  row.forEach((cell, idx) => {
    const key = headers[idx] || `col_${idx}`;
    obj[key] = cell;
  });
  return normalizeRow(obj); // still map to DB fields
});
    // console.log(headers)
    

    const itemsCreated = [];

    for (const row of rows) {
      const {
        serialNo,
        name,
        category,
        subCategory,
        description,
        id,
        model,
        manufacturer,
        hsCode,
        unitPrice,
        calibrationType,
      } = row;

      if (!id) continue;

      const existingItem = await prisma.item.findUnique({ where: { id } });
      if (existingItem) continue;

      const item = await prisma.item.create({
        data: {
          id,        // primary key
    serialNo: serialNo ? String(serialNo).trim() : "", // old serial number
          name,
          category:category?String(category):"",
          subCategory:subCategory?String(subCategory):"",
          description:description?String(description):"",
          model:model?String(model):"",
          manufacturer:manufacturer?String(manufacturer):"",
          hsCode:hsCode ? String(hsCode) : "",
          unitPrice: unitPrice ? parseFloat(unitPrice) : null,
          calibrationType,
          status: "IN",
          certificate: null
        }
      });

      const qrTempPath = `./uploads/qrcodes/item-${id}.png`;
  const qrUrlString = `${process.env.CLIENT_URL || 'http://localhost:5175'}/item-view/${id}`;
  
  // Use the helper to create QR with assetId and name
  await createQRWithText(qrUrlString, id, name, qrTempPath);

  const qrUploadRes = await uploadOnCloudinary(qrTempPath, { 
    public_id: `qrcodes/${id}`,
    resource_type: 'image'
  });
  const qrUrl = qrUploadRes ? qrUploadRes.secure_url : null;

  await prisma.item.update({
    where: { id },
    data: { qrCode: qrUrl }
  });

  itemsCreated.push(item);
    }

    fs.unlinkSync(req.file.path);

    res.json({ success: true, created: itemsCreated.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};


// Get logs for a specific item
export const getItemLogs = async (req, res) => {
  try {
    const { assetId } = req.params;
    const item = await prisma.item.findUnique({ where: { id: assetId } });
    if (!item) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }
    const logs = await prisma.log.findMany({
      where: { itemId: item.id },
      orderBy: { timestamp: "desc" },
    });
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteAllItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany();

    for (const item of items) {
      // Delete associated logs
      await prisma.log.deleteMany({ where: { itemId: item.id } });

      // Delete QR code from Cloudinary
      if (item.qrCode) {
        try {
          const qrPublicId = `qrcodes/${item.id}`;
          await cloudinary.uploader.destroy(qrPublicId, { resource_type: 'image' });
        } catch (err) {
          console.error(`Error deleting QR code for item ${item.id}:`, err);
        }
      }

      // Delete certificate from Cloudinary
      if (item.certificate) {
        try {
          const certPublicId = `certificates/${item.id}.pdf`;
          await cloudinary.uploader.destroy(certPublicId, { resource_type: 'raw', format: 'pdf' });
        } catch (err) {
          console.error(`Error deleting certificate for item ${item.id}:`, err);
        }
      }
    }

    // Delete all items from database
    await prisma.item.deleteMany();

    res.json({ success: true, message: `Deleted ${items.length} items` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Mark item as received only if status is OUT
export const markItemReceived = async (req, res) => {
  try {
    const { assetId } = req.params;
    // Accept received value from body, default to true if not provided
    const { received = true } = req.body || {};

    const item = await prisma.item.findUnique({ where: { id: assetId } });
    if (!item) return res.status(404).json({ success: false, error: "Item not found" });

    const updatedItem = await prisma.item.update({
      where: { id: assetId },
      data: { received },
    });

    res.json({ success: true, item: updatedItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
