
// Auth Middlewares.

module.exports.verifyTokenAndUser = (req, res, next) => {
    const token = req.headers['authorization'];
    const id = req.headers['id'];

    if (!token || !id) {
        return res.status(400).json({
            err: "Token and UserID are required in headers"
        });
    }
    // You might want to add token validation logic here, e.g., JWT verification

    next();
};

module.exports.adminAuthentication = (req, res, next) => {
    if (req.user.role !== "Admin") {
        return res.status(401).json({
            err: "Access Denied"
        })
    }
    next()
}
module.exports.studentAuthentication = (req, res, next) => {
    if (req.user.role !== "Student") {
        return res.status(401).json({
            err: "Access Denied"
        })
    }
    next()
}
module.exports.teacherAuthentication = (req, res, next) => {
    if (req.user.role !== "Teacher") {
        return res.status(401).json({
            err: "Access Denied"
        })
    }
    next()
}
