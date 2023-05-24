const express = require('express')
const router = express.Router()
const { NguoiDung } = require('../../models');
const bcrypt = require('bcrypt');

const { sign } = require('jsonwebtoken');
const { validateToken } = require('../../middlewares/AuthMiddleware');


// Hàm tạo ID ngẫu nhiên
function generateRandomId(length) {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
const randomId = generateRandomId(10);

router.post('/register', async (req, res) => {
    console.log(req.body);
    const { hoTen, matKhau, email, diaChi, sdt } = req.body;
    const user = await NguoiDung.findOne({ where: { email: email } });
    try {
        if (user) {
            res.json({ status: 400, message: 'Tài Khoản này đã tồn tại!' });
        }
        bcrypt.hash(matKhau, 10).then((hash) => {
            NguoiDung.create({
                id: 'US' + randomId,
                hoTen: hoTen,
                matKhau: hash,
                email: email,
                diaChi: diaChi,
                sdt: sdt,
                phanQuyen: 0
            });
            res.json({ status: 200, message: "Đăng ký thành công!" });
        })
    }
    catch (error) {
        console.error(err);
        res.json({ status: 500, message: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, matKhau } = req.body;
    const user = await NguoiDung.findOne({ where: { email: email } });
    try {
        if (!user) {
            res.json({ status: 400, message: "Tài khoản chưa được đăng kí" });
        }
        bcrypt.compare(matKhau, user.matKhau).then((match) => {
            if (!match) {
                res.json({ status: 400, message: "Mật khẩu không đúng!" });
            }
            else {
                /* const expiresIn = '30m'; */
                const accessToken = sign({ 
                    email: user.email, 
                    id: user.id, 
                    hoTen: user.hoTen, 
                    diaChi: user.diaChi, 
                    sdt: user.sdt, 
                    phanQuyen: user.phanQuyen 
                }, "importantsecret" /* expiresIn */);
                res.json({ status: 200, accessToken: accessToken, message: "Đăng nhập thành công!" });
            }
        })
    }
    catch (error) {
        console.error(err);
        res.json({ status: 500, message: 'Internal server error' });
    }
});

router.get('/auth', validateToken, (req, res) => {
    res.json(req.user);
})


module.exports = router;
