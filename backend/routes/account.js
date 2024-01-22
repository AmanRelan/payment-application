const express = require('express');
const { authMiddleware } = require('../middleware')
const { Account } = require('../db');
const { default: mongoose } = require('mongoose');

const router = express.Router();

router.get('/balance', authMiddleware, async (req, res) => {
    try {
        const account = await Account.findOne({ userId: req.userId });
        if (!account) {
            return res.status(404).json({
                message: "No Account found for the requested User ID."
            });
        }
        res.json({ balance: account.balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.post('/transfer', authMiddleware, async (req, res) => {
    try {
        const mongooseSession = await mongoose.startSession();
        mongooseSession.startTransaction();
        const { amount, to } = req.body;

        const account = await Account.findOne({ userId: req.userId }).session(mongooseSession);
        if (!account) {
            await mongooseSession.abortTransaction();
            return res.status(404).json({
                message: "No User/Account Found"
            });
        }
        if (account.balance < amount) {
            await mongooseSession.abortTransaction();
            return res.status(400).json({
                message: "Insufficient Funds"
            })
        }

        const toAccount = await Account.findOne({ userId: to }).session(mongooseSession);
        if (!toAccount) {
            await mongooseSession.abortTransaction();
            return res.status(400).json({
                message: "Cannot find the user you are trying to send to"
            });
        }

        await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(mongooseSession);
        await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(mongooseSession);

        await mongooseSession.commitTransaction();
        res.json({
            message: "Transfer successful"
        });
    } catch (error) {
        console.error(error);
    }
})
module.exports = router;