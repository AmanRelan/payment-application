const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: "Authorization header is missing or invalid" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (!decoded.userId) {
            return res.status(403).json({ message: "userId is missing in JWT payload" });
        }

        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid token" });
    }
};

module.exports = {
    authMiddleware
}
