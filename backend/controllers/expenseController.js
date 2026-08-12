import expenseModel from "../models/expenseModel.js";
import XLSX from "xlsx";
import getDateRange from "../utils/dateFilter.js";

// add expense
export const addExpense = async (req, res) => {
    const userId = req.user._id;
    const { description, amount, category, date } = req.body;
    try {
        if (!description || !amount || !category || !date) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const newExpense = new expenseModel({
            userId,
            description,
            amount,
            category,
            date: new Date(date)
        });
        await newExpense.save();
        return res.status(201).json({ success: true, message: "Expense added successfully", data: newExpense });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// get all expense
export const getExpense = async (req, res) => {
    const userId = req.user._id;
    try {
        const expense = await expenseModel.find({ userId }).sort({ date: -1 });
        return res.status(200).json({ success: true, data: expense });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// update expense
export const updateExpense = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { description, amount } = req.body;
    try {
        const updatedExpense = await expenseModel.findOneAndUpdate(
            { _id: id, userId },
            { description, amount },
            { returnDocument: "after" }
        );
        if (!updatedExpense) {
            return res.status(404).json({ success: false, message: "Expense not found" });
        }
        return res.status(200).json({ success: true, message: "Expense updated successfully", data: updatedExpense });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// delete expense
export const deleteExpense = async (req, res) => {

    try {
        const deletedExpense = await expenseModel.findByIdAndDelete({ _id: req.params.id });
        if (!deletedExpense) {
            return res.status(404).json({ success: false, message: "Expense not found" });
        }
        return res.status(200).json({ success: true, message: "Expense deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// download expense
export const downloadExpense = async (req, res) => {
    const userId = req.user._id;
    try {
        const expenses = await expenseModel.find({ userId }).sort({ date: -1 });

        if (!expenses || expenses.length === 0) {
            return res.status(404).json({ success: false, message: "No expenses found" });
        }

        const excelData = expenses.map(expense => ({
            Description: expense.description,
            Amount: expense.amount,
            Category: expense.category,
            Date: expense.date.toLocaleDateString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

        // Generate buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Set headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename=expenseData.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // Send the buffer directly
        return res.send(buffer);

    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// to get overview of expenses
export const getExpenseOverview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { range = "monthly" } = req.query; // Get the range from query parameters
        const { start, end } = getDateRange(range);
        const expenses = await expenseModel.find({
            userId,
            date: { $gte: start, $lte: end }
        }).sort({ date: -1 });

        const totalExpense = expenses.reduce((total, expense) => total + expense.amount, 0);
        const averageExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;
        const numberOfExpenses = expenses.length;
        const recentTransactions = expenses.slice(0, 5); // Get the 5 most recent expenses

        return res.status(200).json({
            success: true,
            data: {
                totalExpense,
                averageExpense,
                numberOfExpenses,
                recentTransactions,
                range,
            }
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}