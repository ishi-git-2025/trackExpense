import express from "express";

import { addIncome, getIncome, updateIncome, deleteIncome, downloadIncomeData, getIncomeOverview } from "../controllers/incomeController.js";
import authMiddleware from "../middleware/auth.js";

const incomeRouter = express.Router();

incomeRouter.post("/add", authMiddleware, addIncome);
incomeRouter.get("/get", authMiddleware, getIncome);
incomeRouter.put("/update/:id", authMiddleware, updateIncome);
incomeRouter.get("/downloadexcel", authMiddleware, downloadIncomeData);
incomeRouter.delete("/delete/:id", authMiddleware, deleteIncome);
incomeRouter.get("/overview", authMiddleware, getIncomeOverview);

export default incomeRouter;

