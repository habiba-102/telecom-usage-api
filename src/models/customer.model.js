import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: 60,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      unique: true,
      match: [/^01[0125][0-9]{8}$/, "Phone must be a valid Egyptian mobile number"],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email is not valid"],
    },
    status: {
      type: String,
      enum: { values: ["active", "suspended"], message: "{VALUE} is not a valid status" },
      default: "active",
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
