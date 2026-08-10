import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import promoEventsRoutes from "./routes/promoEvents.routes.js";
import activityLogRoutes from "./routes/activityLog.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1/promo-events", promoEventsRoutes);
console.log("✅ Mounted routes: /api/v1/promo-events");
app.use("/api/v1/activity-logs", activityLogRoutes);
console.log("✅ Mounted routes: /api/v1/activity-logs");
app.use("/api/v1/settings", settingsRoutes);
console.log("✅ Mounted routes: /api/v1/settings");

// Health check
app.get("/", (req, res) => res.json({ status: "ok" }));
  
let initialized = false;

export async function initApp() {
  if (initialized) return app;
  initialized = true;

  // Helper to mount routes dynamically
  const mount = async (path, modulePath) => {
    try {
      const mod = await import(modulePath);
      const router = mod.default;

      if (!router) {
        console.warn(`⚠️ No default export found in ${modulePath}`);
        return;
      }

      app.use(path, router);
      console.log(`✅ Mounted routes: ${path}`);
    } catch (err) {
      console.error(`❌ Failed to load routes from ${modulePath}:`, err.message || err);
      console.error(err.stack || err);
    }
  };

  // Mount all route modules
  await mount("/api/v1/products", "./routes/products.routes.js");
  await mount("/api/v1/customers", "./routes/customers.routes.js");
  await mount("/api/v1/categories", "./routes/categories.routes.js");
  await mount("/api/v1/orders", "./routes/orders.routes.js");
  await mount("/api/v1/users", "./routes/users.routes.js");
  await mount("/api/v1/inventory", "./routes/inventory.routes.js");

  return app;
}

export default app;
