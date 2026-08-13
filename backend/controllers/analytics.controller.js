import * as AnalyticsModel from "../models/analytics.model.js";

export const getOverview = async (req, res) => {
  try {
    const [kpis, categoryBreakdown, productTable, rewardsTable] = await Promise.all([
      AnalyticsModel.getKpis(),
      AnalyticsModel.getCategoryBreakdown(),
      AnalyticsModel.getProductSalesTable(),
      AnalyticsModel.getRewardsAnalyticsTable(),
    ]);
    res.json({ kpis, category_breakdown: categoryBreakdown, product_table: productTable, rewards_table: rewardsTable });
  } catch (err) {
    console.error("Error fetching analytics overview:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCategoryDetail = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid category id" });
    const data = await AnalyticsModel.getCategoryDetail(id);
    res.json(data);
  } catch (err) {
    console.error("Error fetching category detail:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};