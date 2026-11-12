import Plan from "../models/plan.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createPlan = asyncHandler(async (req, res) => {
  const plan = await Plan.create(req.body);
  res.status(201).json(plan);
});

// GET /api/plans?isActive=true&maxPrice=200&page=1&limit=10
export const getPlans = asyncHandler(async (req, res) => {
  const { isActive, maxPrice, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (maxPrice) filter.price = { $lte: Number(maxPrice) };

  const skip = (Number(page) - 1) * Number(limit);
  const plans = await Plan.find(filter).sort({ price: 1 }).skip(skip).limit(Number(limit));
  res.json({ count: plans.length, plans });
});

export const getPlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) throw new AppError("Plan not found", 404);
  res.json(plan);
});

// Uses find + save so optimistic concurrency (__v) is checked
export const updatePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) throw new AppError("Plan not found", 404);
  plan.set(req.body);
  await plan.save();
  res.json(plan);
});

export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findByIdAndDelete(req.params.id);
  if (!plan) throw new AppError("Plan not found", 404);
  res.json({ message: "Plan deleted" });
});
