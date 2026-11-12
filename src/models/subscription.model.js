import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    // remaining balance, copied from the plan when subscribing
    remaining: {
      dataMB: { type: Number, required: true, min: 0 },
      minutes: { type: Number, required: true, min: 0 },
      sms: { type: Number, required: true, min: 0 },
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
