import jwt from "jsonwebtoken"

export const auth = (req, res, next) => {
    const token = req.header("x-auth-token");

    if (!token) return res.status(401).send({ message: "Access Denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);      //verifying jwt by getting token from request header
        req.user = decoded.accountId;                                        //assigning user containing user.accountId to req.user
        next()
    }
    catch (err) {
        res.status(401).send({ message: err })
    }
}