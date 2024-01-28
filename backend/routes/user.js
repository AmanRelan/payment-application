const express = require('express');
const { User, Account } = require('../db')
const zod = require('zod');
const { JWT_SECRET } = require('../config')
const { authMiddleware } = require('../middleware')
const jwt = require('jsonwebtoken');

const router = express.Router();

const userSchema = zod.string({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string().min(6)
});
router.post('/signup', async (req, res) => {
    const isUserValidated = userSchema.safeParse(req.body);
    if (!isUserValidated) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }
    const isUserAlreadyPresent = await User.findOne({
        username: req.body.username
    })
    if (isUserAlreadyPresent) {
        return res.status(411).json({
            message: "Email Already Present"
        })
    }
    const newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });
    const salt = 'Creating Hashed password';
    const hashedPassword = await newUser.createHash(req.body.password, salt);
    newUser.password_hash = hashedPassword;
    await newUser.save();

    const userId = newUser._id;
    const token = jwt.sign({
        userId
    }, JWT_SECRET)

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })
    return res.status(200).json({
        message: "User created successfully",
        token: token
    });
})

router.post('/signin', async (req, res) => {
    let user = await User.findOne({ username: req.body.email });
    if (user === null) {
        return res.status(404).json({
            message: "User not found.",
        });
    } else {
        if (await user.validatePassword(req.body.password)) {
            const userId = user._id;
            const token = jwt.sign({ userId }, JWT_SECRET)
            return res.status(200).json({
                message: "User Successfully Logged In",
                token: token
            });
        } else {
            return res.status(411).json({
                message: "Error while logging in"
            });
        }
    }
})
const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.put("/", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

    await User.updateOne(req.body, {
        id: req.userId,
    })

    res.json({
        message: "Updated successfully"
    })
})

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})


module.exports = router;