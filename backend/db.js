const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://amanrelan1734:DFgyuhNEfedWiDl5@cluster0.yrigu8b.mongodb.net/paytm")

const userSchema = mongoose.Schema({
    username: String,
    password_hash: {
        type: String,
        required: true,
    },
    firstName: String,
    lastName: String,
})
UserSchema.methods.createHash = async function (plainTextPassword) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(plainTextPassword, salt);
};

UserSchema.methods.validatePassword = async function (candidatePassword) {
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