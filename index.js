import "dotenv/config";
import express from "express";
import connectDB from "./src/config/db.js";
import plansRouter from "./src/routes/plan.routes.js";
import customersRouter from "./src/routes/customer.routes.js";
import subscriptionsRouter from "./src/routes/subscription.routes.js";
import notFound from "./src/middlewares/notFound.js";
import errorHandler from "./src/middlewares/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Telecom Usage API is running" });
});

app.use("/api/plans", plansRouter);
app.use("/api/customers", customersRouter);
app.use("/api/subscriptions", subscriptionsRouter);

app.use(notFound);
app.use(errorHandler);

await connectDB();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
