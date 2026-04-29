import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) return res.status(401).send("No token");

    try {
        const decoded = jwt.verify(token, "secret");
        req.user = decoded;
        next();
    } catch {
        res.status(401).send("Invalid token");
    }
};