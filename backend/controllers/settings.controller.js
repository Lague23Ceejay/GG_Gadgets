import * as SettingsModel from "../models/settings.model.js";

export const getPublic = async (req, res) => {
  try {
    const data = await SettingsModel.getPublicSettings();
    res.json(data);
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const update = async (req, res) => {
  try {
    const { key, value } = req.body || {};
    if (!key || value === undefined) {
      return res.status(400).json({ error: "key and value are required" });
    }
    const success = await SettingsModel.updateSetting(key, value);
    res.json({ success });
  } catch (err) {
    console.error("Error updating setting:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }
    const data = await SettingsModel.getCustomerOrderHistory(email);
    if (!data) {
      return res.status(404).json({ error: "No orders found for that email." });
    }
    res.json(data);
  } catch (err) {
    console.error("Error fetching order history:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};