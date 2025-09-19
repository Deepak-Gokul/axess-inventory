import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import itemRoutes from "./routes/item.route.js";
import logRoutes from "./routes/log.routes.js";
import dashboardRoutes from "./routes/admin.routes.js"
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();
app.use(cors({
    credentials: true,
    origin:  process.env.CLIENT_URL,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(cookieParser());

app.use("/api/items", itemRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/dashboard",dashboardRoutes)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));