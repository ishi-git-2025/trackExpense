import incomeModel from "../models/incomeModel.js";
import XLSX from "xlsx";
import getDateRange from "../utils/dateFilter.js";

//add income
export const addIncome = async (req, res) => {

    const userId = req.user._id;
    const { description, amount, category, date } = req.body;

    try {
        if (!description || !amount || !category || !date) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const newIncome = new incomeModel({
            userId,
            description,
            amount,
            category,
            date: new Date(date)
        });
        await newIncome.save();
        return res.status(201).json({ success: true, message: "Income added successfully", data: newIncome });

    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }

}

//get all income
export const getIncome = async (req, res) => {
    const userId = req.user._id;
    try {
        const income = await incomeModel.find({ userId }).sort({ date: -1 });
        return res.status(200).json({ success: true, data: income });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

//update income
export const updateIncome = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { description, amount } = req.body;

    try {
        const updatedIncome = await incomeModel.findOneAndUpdate(
            { _id: id, userId },
            { description, amount },
            { returnDocument: "after" }
        );
        if (!updatedIncome) {
            return res.status(404).json({ success: false, message: "Income not found" });
        }
        return res.status(200).json({ success: true, message: "Income updated successfully", data: updatedIncome });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

//delete income
export const deleteIncome = async (req, res) => {
    try {
        const deletedIncome = await incomeModel.findByIdAndDelete({ _id: req.params.id });
        if (!deletedIncome) {
            return res.status(404).json({ success: false, message: "Income not found" });
        }
        return res.status(200).json({ success: true, message: "Income deleted successfully", data: deletedIncome });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// to download income data as an excel sheet
export const downloadIncomeData = async (req, res) => {
    const userId = req.user._id;
    try {
        const incomeData = await incomeModel.find({ userId }).sort({ date: -1 });

        if (!incomeData || incomeData.length === 0) {
            return res.status(404).json({ success: false, message: "No income data found" });
        }

        const excelData = incomeData.map(income => ({
            Description: income.description,
            Amount: income.amount,
            Category: income.category,
            Date: income.date.toLocaleDateString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        // XLSX.utils.book_append_sheet(workbook, worksheet, "incomeModel");
        // XLSX.writeFile(workbook, "incomeData.xlsx");
        // res.download("incomeData.xlsx");

        XLSX.utils.book_append_sheet(workbook, worksheet, "Income");

        // Generate buffer instead of writing to file
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Set headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename=incomeData.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // Send the buffer directly
        return res.send(buffer);

    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// to get income overview 
export const getIncomeOverview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { range = "monthly" } = req.query; // default to monthly if no range is provided
        const { start, end } = getDateRange(range);
        const incomeData = await incomeModel.find({
            userId,
            date: { $gte: start, $lte: end }
        }).sort({ date: -1 });

        const totalIncome = incomeData.reduce((total, income) => total + income.amount, 0);
        const averageIncome = incomeData.length > 0 ? totalIncome / incomeData.length : 0;
        const numberOfTransactions = incomeData.length;
        const recentTransactions = incomeData.slice(0, 5); // Get the 5 most recent transactions

        return res.status(200).json({
            success: true,
            data: {
                totalIncome,
                averageIncome,
                numberOfTransactions,
                recentTransactions,
                range
            }
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

