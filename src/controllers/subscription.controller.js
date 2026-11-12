import Subscription from "../models/subscription.model.js";
import Customer from "../models/customer.model.js";
import Plan from "../models/plan.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

// POST /api/subscriptions  { customerId, planId }
export const subscribe = asyncHandler(async (req, res) => {
  const { customerId, planId } = req.body;

  const customer = await Customer.findById(customerId);
  if (!customer) throw new AppError("Customer not found", 404);
  if (customer.status !== "active") throw new AppError("Customer is suspended", 400);

  const plan = await Plan.findById(planId);
  if (!plan || !plan.isActive) throw new AppError("Plan not found or not active", 404);

  const alreadyActive = await Subscription.findOne({ customer: customerId, status: "active" });
  if (alreadyActive) throw new AppError("Customer already has an active subscription", 409);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plan.validityDays);

  const subscription = await Subscription.create({
    customer: customerId,
    plan: planId,
    endDate,
    remaining: { dataMB: plan.dataMB, minutes: plan.minutes, sms: plan.sms },
  });

  res.status(201).json(subscription);
});

// GET /api/subscriptions?customer=<id>&status=active
export const getSubscriptions = asyncHandler(async (req, res) => {
  const { customer, status } = req.query;
  const filter = {};
  if (customer) filter.customer = customer;
  if (status) filter.status = status;

  const subscriptions = await Subscription.find(filter)
    .populate("customer", "name phone")
    .populate("plan", "name price");
  res.json({ count: subscriptions.length, subscriptions });
});

export const getSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id)
    .populate("customer", "name phone email")
    .populate("plan");
  if (!subscription) throw new AppError("Subscription not found", 404);
  res.json(subscription);
});

// PATCH /api/subscriptions/:id/cancel
export const cancelSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOneAndUpdate(
    { _id: req.params.id, status: "active" },
    { $set: { status: "cancelled" } },
    { new: true }
  );
  if (!subscription) throw new AppError("Active subscription not found", 404);
  res.json(subscription);
});
