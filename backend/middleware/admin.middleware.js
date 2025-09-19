import jwt from 'jsonwebtoken';

export const verifyAdmin = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // store decoded info if needed
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

export const verifySuperAdmin = (req, res, next) => {
  if (req.admin?.role !== "superadmin") {
    return res.status(403).json({ success: false, error: "Super admin access required" });
  }
  next();
};