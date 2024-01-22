const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

mongoose.connect("<Mongo URL>")

const userSchema = mongoose.Schema({
    username: String,
    password_hash: {
        type: String,
        required: true,
    },
    firstName: String,
    lastName: String,
})
userSchema.methods.createHash = async function (plainTextPassword) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(plainTextPassword, salt);
};

userSchema.methods.validatePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
};

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to User model
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});

const User = mongoose.model("User", userSchema)
const Account = mongoose.model('Account', accountSchema);

module.exports = {
    User,
    Account
}