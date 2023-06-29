const express = require('express')
const router = express.Router()
const { NguoiDung, VaiTro } = require('../../models');
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

//đăng kí khách hàng
router.post('/register', async (req, res) => {
    console.log(req.body);
    const { hoTen, matKhau, email, diaChi, sdt } = req.body;
    const user = await NguoiDung.findOne({ where: { email: email } });
    try {
        if (user) {
            res.json({ status: 400, message: 'Tài Khoản này đã tồn tại!' });
            return;
        }
        //xet randomId bị trùng
        let id = 'US' + randomId;
        const showId = await NguoiDung.findOne({ where: { id: 'US' + randomId } })
        if (showId) {
            const idNguoiDung = generateRandomId(10)
            id = "US" + idNguoiDung;
        }
        bcrypt.hash(matKhau, 10).then((hash) => {
            NguoiDung.create({
                id: id,
                hoTen: hoTen,
                matKhau: hash,
                email: email,
                diaChi: diaChi,
                sdt: sdt,
                phanQuyen: 0,
                trangThai: 1,
            });
            res.json({ status: 200, message: "Đăng ký thành công!" });
        })
    }
    catch (error) {
        console.error(err);
        res.json({ status: 500, message: 'Internal server error' });
    }
});

//đăng kí nhân viên
router.post('/register-staff', async (req, res) => {
    console.log(req.body);
    const { hoTen, matKhau, email, diaChi, sdt } = req.body;
    const user = await NguoiDung.findOne({ where: { email: email } });
    try {
        if (user) {
            res.json({ status: 400, message: 'Tài Khoản này đã tồn tại!' });
            return;
        }
        //xet randomId bị trùng
        let id = 'US' + randomId;
        const showId = await NguoiDung.findOne({ where: { id: 'US' + randomId } })
        if (showId) {
            const idNguoiDung = generateRandomId(10)
            id = "US" + idNguoiDung;
        }
        bcrypt.hash(matKhau, 10).then((hash) => {
            NguoiDung.create({
                id: id,
                hoTen: hoTen,
                matKhau: hash,
                email: email,
                diaChi: diaChi,
                sdt: sdt,
                phanQuyen: 2,
                trangThai: 1,
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
            return;
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
                    phanQuyen: user.phanQuyen,
                    VaiTroId: user.VaiTroId
                }, "importantsecret" /* expiresIn */);
                res.json({ status: 200, accessToken: accessToken, message: "Đăng nhập thành công!" });
            }
        })
    }
    catch (error) {
        res.json({ status: 500, message: 'Internal server error' });
    }
});

router.get('/auth', validateToken, (req, res) => {
    res.json(req.user);
})


//show all user
router.get('/show-all', async (req, res) => {
    const users = await NguoiDung.findAll({ where: { phanQuyen: 0 } });
    try {
        res.status(200).json({ users: users })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//Phân trang
router.get("/user", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    try {
        const users = await NguoiDung.findAndCountAll({
            offset,
            limit
            , where: { phanQuyen: 0 }
        });
        const totalPages = Math.ceil(users.count / limit);
        res.status(200).json({
            totalPages,
            users: users.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})



//Phân trang staff
router.get("/user-staff", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    try {
        const users = await NguoiDung.findAndCountAll({
            offset,
            limit,
            include: [VaiTro]
            , where: { phanQuyen: 2 }
        });
        const totalPages = Math.ceil(users.count / limit);
        res.status(200).json({
            totalPages,
            users: users.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})


//show all user staff
router.get('/show-all-staff', async (req, res) => {
    const users = await NguoiDung.findAll({ where: { phanQuyen: 2 } });
    try {
        res.status(200).json({ users: users })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//update status user staff 
router.put('/upload-status/:id', async (req, res) => {
    try {
        const id = req.params.id
        const { trangThai } = req.body;
        // Create a new user in the database
        await NguoiDung.update({
            trangThai: trangThai,
        }, { where: { id: id } });
        res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

//delete  user
router.delete('/delete-user/:id', (req, res) => {
    try {
        const id = req.params.id;
        NguoiDung.destroy({ where: { id: id } });
        res.status(200).json({ message: 'Success' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
})

module.exports = router;
