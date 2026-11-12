import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      unique: true,
      trim: true,
      minlength: [3, "Plan name must be at least 3 characters"],
      maxlength: 50,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    dataMB: { type: Number, required: true, min: 0 },
    minutes: { type: Number, required: true, min: 0 },
    sms: { type: Number, required: true, min: 0 },
    validityDays: {
      type: Number,
      required: true,
      min: [1, "Validity must be at least 1 day"],
      default: 30,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: price per day (not stored in the DB)
planSchema.virtual("pricePerDay").get(function () {
  return Number((this.price / this.validityDays).toFixed(2));
});

const Plan = mongoose.model("Plan", planSchema);
export default Plan;
