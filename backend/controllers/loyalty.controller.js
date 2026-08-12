import * as LoyaltyModel from "../models/loyalty.model.js";
import { sendOtpEmail } from "../lib/email.js";

export const getBalance = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "email is required" });
    const data = await LoyaltyModel.getBalance(email);
    res.json(data);
  } catch (err) {
    console.error("Error fetching balance:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const listActiveRewards = async (req, res) => {
  try {
    const data = await LoyaltyModel.getActiveRewards();
    res.json(data);
  } catch (err) {
    console.error("Error fetching rewards:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const listAllRewards = async (req, res) => {
  try {
    const data = await LoyaltyModel.getAllRewards();
    res.json(data);
  } catch (err) {
    console.error("Error fetching rewards:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createReward = async (req, res) => {
  try {
    const { item_name, point_cost, stock_count } = req.body || {};
    if (!item_name || !point_cost) {
      return res.status(400).json({ error: "item_name and point_cost are required" });
    }
    const newId = await LoyaltyModel.createReward(req.body);
    res.status(201).json({ reward_id: newId });
  } catch (err) {
    console.error("Error creating reward:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateReward = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid reward id" });
    const success = await LoyaltyModel.updateReward(id, req.body);
    res.json({ success });
  } catch (err) {
    console.error("Error updating reward:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const archiveReward = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid reward id" });
    const success = await LoyaltyModel.archiveReward(id);
    res.json({ success });
  } catch (err) {
    console.error("Error archiving reward:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Simple rate-limit guard: track last-sent timestamp per email in memory,
// just enough to stop someone spamming the send button. Resets on server
// restart — fine for this scale, wouldn't be sufficient for a high-traffic
// production system, which would want this in Redis/DB instead.
const lastSentAt = new Map();

export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "email is required" });

    const last = lastSentAt.get(email);
    if (last && Date.now() - last < 30_000) {
      return res.status(429).json({ error: "Please wait before requesting another code." });
    }

    const code = await LoyaltyModel.createOtp(email);
    const sent = await sendOtpEmail(email, code);
    lastSentAt.set(email, Date.now());

    if (!sent) {
      return res.status(500).json({ error: "Failed to send verification email." });
    }

    res.json({ sent: true });
  } catch (err) {
    console.error("Error requesting OTP:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) return res.status(400).json({ error: "email and code are required" });

    const success = await LoyaltyModel.verifyOtp(email, code);
    if (!success) {
      return res.status(400).json({ error: "Invalid or expired code." });
    }
    res.json({ verified: true });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const redeem = async (req, res) => {
  try {
    const { email, reward_id, order_id } = req.body || {};
    if (!email || !reward_id || !order_id) {
      return res.status(400).json({ error: "email, reward_id, and order_id are required" });
    }
    const result = await LoyaltyModel.redeemReward(email, reward_id, order_id);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (err) {
    console.error("Error redeeming reward:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};