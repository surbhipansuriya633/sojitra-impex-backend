import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
    const bearer = req.headers.authorization || "";
    const token = bearer.startsWith("Bearer ") ? bearer.slice(7) : null;
    if (!token) return res.status(401).json({ msg: "No token" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (e) { return res.status(401).json({ msg: "Invalid/expired token" }); }
}
