import * as EventModel from "../models/promoEvents.model.js";
import { logActivity } from "../models/activityLog.model.js";

export const getActive = async (req, res) => {
  try {
    const data = await EventModel.getActiveEvents();
    res.json(data);
  } catch (err) {
    console.error("Error fetching active promo events:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAll = async (req, res) => {
  try {
    const data = await EventModel.getAllEvents();
    res.json(data);
  } catch (err) {
    console.error("Error fetching promo events:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const create = async (req, res) => {
  try {
    const { title, image_url } = req.body || {};
    if (!title || !image_url) {
      return res.status(400).json({ error: "title and image_url are required" });
    }
    const newId = await EventModel.createEvent(req.body);
    res.status(201).json({ event_id: newId });
  } catch (err) {
    console.error("Error creating promo event:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const update = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid event id" });
    }
    const success = await EventModel.updateEvent(id, req.body);
    res.json({ success });
  } catch (err) {
    console.error("Error updating promo event:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const archive = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid event id" });
    }
    const success = await EventModel.archiveEvent(id);
    res.json({ success });
  } catch (err) {
    console.error("Error archiving promo event:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const setProduct = async (req, res) => {
  try {
    const eventId = Number.parseInt(req.params.id, 10);
    const { product_id, discount_percent } = req.body || {};
    if (Number.isNaN(eventId) || !product_id || !discount_percent) {
      return res.status(400).json({ error: "event id, product_id, and discount_percent are required" });
    }
    const success = await EventModel.setEventProduct(eventId, product_id, discount_percent);
    res.json({ success });
  } catch (err) {
    console.error("Error setting event product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeProduct = async (req, res) => {
  try {
    const eventId = Number.parseInt(req.params.id, 10);
    const productId = Number.parseInt(req.params.productId, 10);
    if (Number.isNaN(eventId) || Number.isNaN(productId)) {
      return res.status(400).json({ error: "Invalid event or product id" });
    }
    const success = await EventModel.removeEventProduct(eventId, productId);
    res.json({ success });
  } catch (err) {
    console.error("Error removing event product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};