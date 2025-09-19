import { PrismaClient } from "../prisma/generated/prisma/index.js";


const prisma = new PrismaClient()

export const getItemById = async (req, res) => {
  try {
    const { assetId } = req.params;
    // Fetch item
    const item = await prisma.item.findUnique({
      where: { id: assetId },
    });
    if (!item) return res.status(404).json({ success: false, error: "Item not found" });

    // Fetch latest log for assignedProject
    const latestLog = await prisma.log.findFirst({
      where: { itemId: assetId },
      orderBy: { timestamp: 'desc' },
    });

    // If item status is OUT, include assignedProject from latest log
    const assignedProject = item.status === 'OUT' && latestLog ? latestLog.project : null;
    const location = item.status === 'OUT' && latestLog ? latestLog.location : null;

    res.json({ success: true, item: { ...item, assignedProject,location } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const downloadCertificate = async (req, res) => {
  try {
    const { assetId } = req.params;
    const item = await prisma.item.findFirst({ where: { assetId } });
    if (!item || !item.certificate) return res.status(404).send("Certificate not found");

    const response = await axios.get(item.certificate, { responseType: 'arraybuffer' });
    res.setHeader('Content-Disposition', `attachment; filename=Certificate-${item.id}-${item.name}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error downloading certificate');
  }
};