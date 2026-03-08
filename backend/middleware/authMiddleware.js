const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log("[AUTH DEBUG] No token provided in request");
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    console.log("[AUTH DEBUG] Secret starts with:", process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 3) + "..." : "UNDEFINED");

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        console.error("[AUTH DEBUG] Token Verification Failed:", err.message);
        res.status(401).json({ message: "Session expired or invalid. Please login again." });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Forbidden: Admin access required" });
    }
};

module.exports = { verifyToken, isAdmin };
