import mongoose from "mongoose";

export const USAGE_TYPES = ["dataMB", "minutes", "sms"];

const usageSchema = new mongoose.Schema(
  {
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true },
    type: {
      type: String,
      required: true,
      enum: { values: USAGE_TYPES, message: "type must be one of: dataMB, minutes, sms" },
    },
    amount: { type: Number, required: true, min: [1, "Amount must be at least 1"] },
  },
  { timestamps: true }
);

usageSchema.index({ subscription: 1, createdAt: -1 });

const Usage = mongoose.model("Usage", usageSchema);
export default Usage;
