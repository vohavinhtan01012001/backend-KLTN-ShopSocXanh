const { verify } = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
    const accessToken = req.header('accessToken');
    if (!accessToken) {
        return res.json({ status: 401, message: "Vui lòng đăng nhập để tiếp tục!" });
    }
    try {
        const validToken = verify(accessToken, "importantsecret");
        req.user = validToken;
        console.log(validToken)
        if(req.user.phanQuyen === 0){
            return res.json({ status: 401, message: "Bạn không phải quản trị viên!" });
        }

        if (req.user.phanQuyen === 2 || req.user.phanQuyen === 1) {
            return next();
        }
    }
    catch (err) {
        return res.json({ error: err });
    }
};

module.exports = { adminAuth }