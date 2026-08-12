import incomeModel from "../models/incomeModel.js";
import expenseModel from "../models/expenseModel.js";

export const getDashboardData = async (req, res) => {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    try {
        const Income = await incomeModel.find({
            userId,
            date: { $gte: startOfMonth, $lte: now }
        }).lean();

        const Expense = await expenseModel.find({
            userId,
            date: { $gte: startOfMonth, $lte: now }
        }).lean();

        const monthlyIncome = Income.reduce((total, income) => total + Number(income.amount || 0), 0);
        const monthlyExpense = Expense.reduce((total, expense) => total + Number(expense.amount || 0), 0);
        const savings = monthlyIncome - monthlyExpense;
        const savingsRate = monthlyIncome === 0 ? 0 : Math.round((savings / monthlyIncome) * 100);

        // to get the recent transactions, we can combine both income and expense and sort them by date
        const recentTransactions = [
            ...Income.map((i) => ({ ...i, type: "income" })),
            ...Expense.map((e) => ({ ...e, type: "expense" })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // to calculate the total amount spent in each category
        const spendByCategory = {};
        for (const exp of Expense) {
            const cat = exp.category || "Other";
            spendByCategory[cat] = (spendByCategory[cat] || 0) + Number(exp.amount || 0);
        }

        // to calculate the percentage of each category in total expenses 
        const expenseDistribution = Object.entries(spendByCategory).map(([category, amount]) => ({ 
            category,
            amount,
            percent: monthlyExpense === 0 ? 0 : Math.round((amount / monthlyExpense) * 100),
        }));
        return res.status(200).json({
            success: true,
            data: {
                monthlyIncome,
                monthlyExpense,
                savings,
                savingsRate,
                recentTransactions,
                expenseDistribution,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}