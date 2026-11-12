import mongoose from "mongoose";
import Subscription from "../models/subscription.model.js";
import Usage, { USAGE_TYPES } from "../models/usage.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

// POST /api/subscriptions/:id/usage  { type: "dataMB" | "minutes" | "sms", amount }
export const recordUsage = asyncHandler(async (req, res) => {
  const { type, amount } = req.body;

  if (!USAGE_TYPES.includes(type)) {
    throw new AppError("type must be one of: dataMB, minutes, sms", 400);
  }
  if (typeof amount !== "number" || amount < 1) {
    throw new AppError("amount must be a number >= 1", 400);
  }

  // One atomic update: the balance is deducted only if it is enough,
  // so two parallel requests can never push the balance below zero.
  const subscription = await Subscription.findOneAndUpdate(
    {
      _id: req.params.id,
      status: "active",
      endDate: { $gt: new Date() },
      [`remaining.${type}`]: { $gte: amount },
    },
    { $inc: { [`remaining.${type}`]: -amount } },
    { new: true },
  );

  if (!subscription) {
    throw new AppError(
      "Subscription not found, not active, expired, or balance is not enough",
      400,
    );
  }

  const usage = await Usage.create({
    subscription: subscription._id,
    type,
    amount,
  });
  res.status(201).json({ usage, remaining: subscription.remaining });
});

// GET /api/subscriptions/:id/usage?type=dataMB
export const getUsage = asyncHandler(async (req, res) => {
  const filter = { subscription: req.params.id };
  if (req.query.type) filter.type = req.query.type;

  const records = await Usage.find(filter).sort({ createdAt: -1 });
  res.json({ count: records.length, records });
});

// GET /api/subscriptions/:id/usage/summary?month=2026-11
// Total usage per type for a month, using an aggregation pipeline
export const getUsageSummary = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError("Invalid subscription id", 400);
  }
  const { month } = req.query;
  const now = new Date();
  const [year, mon] = month
    ? month.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];

  if (!year || !mon || mon < 1 || mon > 12) {
    throw new AppError("month must be in the format YYYY-MM", 400);
  }

  const from = new Date(Date.UTC(year, mon - 1, 1));
  const to = new Date(Date.UTC(year, mon, 1));

  const summary = await Usage.aggregate([
    {
      $match: {
        subscription: new mongoose.Types.ObjectId(req.params.id),
        createdAt: { $gte: from, $lt: to },
      },
    },
    {
      $group: {
        _id: "$type",
        totalAmount: { $sum: "$amount" },
        records: { $sum: 1 },
      },
    },
    { $project: { _id: 0, type: "$_id", totalAmount: 1, records: 1 } },
    { $sort: { type: 1 } },
  ]);

  res.json({ month: `${year}-${String(mon).padStart(2, "0")}`, summary });
});
