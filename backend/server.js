import "dotenv/config";
import { initApp } from "./app.js";
import authRoutes from "./routes/auth.routes.js";

const PORT = process.env.PORT || 3000;

initApp()
  .then((app) => {
    app.use("/api/v1/auth", authRoutes);

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to initialize app:", err);
    process.exit(1);
  });
