const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const resourceRoutes = require("./routes/resourceRoutes");
const resourceRequestRoutes = require("./routes/resourceRequestRoutes");
const resourceIssueRoutes = require("./routes/resourceIssueRoutes");
const resourceNotificationRoutes = require("./routes/resourceNotificationRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Resource Management API is running successfully",
  });
});

app.use("/api/v1/resources", resourceRoutes);
app.use("/api/v1/resource-requests", resourceRequestRoutes);
app.use("/api/v1/resource-issues", resourceIssueRoutes);
app.use("/api/v1/notifications", resourceNotificationRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });