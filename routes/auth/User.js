const express = require('express')
const router = express.Router()
const { NguoiDung, VaiTro } = require('../../models');
const bcrypt = require('bcrypt');
const { sign } = require('jsonwebtoken');
const { validateToken } = require('../../middlewares/AuthMiddleware');
const { adminAuth } = require('../../middlewares/AuthAdmin');
const { OAuth2Client } = require('google-auth-library')
const nodemailer = require('nodemailer');
const GOOGLE_MAILER_CLIENT_ID = '258347555663-0m8j8ugaitn4e9d01saaln5f1v0iugb5.apps.googleusercontent.com'
const GOOGLE_MAILER_CLIENT_SECRET = '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'
const GOOGLE_MAILER_REFRESH_TOKEN =
    '1//04IWIOA6diZFDCgYIARAAGAQSNwF-L9Irbq1ljrI7ktBkvcO9O7eQTFqDOtTWjc4oWDOM_OUEOE91-_e-4Iq6NgW0-o_rBAtYN3c'
const ADMIN_EMAIL_ADDRESS = 'vinhtan129@gmail.com';

const myOAuth2Client = new OAuth2Client(
    GOOGLE_MAILER_CLIENT_ID,
    GOOGLE_MAILER_CLIENT_SECRET
)

myOAuth2Client.setCredentials({
    refresh_token: GOOGLE_MAILER_REFRESH_TOKEN
})

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
router.post('/register-staff', adminAuth, async (req, res) => {
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
                }, "importantsecret");
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
router.get('/show-all', adminAuth, async (req, res) => {
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
router.get("/user", adminAuth, async (req, res) => {
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
router.get("/user-staff", adminAuth, async (req, res) => {
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
router.get('/show-all-staff', adminAuth, async (req, res) => {
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
router.put('/upload-status/:id', adminAuth, async (req, res) => {
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
router.delete('/delete-user/:id', adminAuth, (req, res) => {
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

router.post('/reset-password', async (req, res) => {
    const { email } = req.body;
    try {
        const checkMail = await NguoiDung.findOne({
            where: {
                email: email
            }
        })
        if (checkMail) {
            const myAccessTokenObject = await myOAuth2Client.getAccessToken()
            const myAccessToken = myAccessTokenObject?.token
            const transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: ADMIN_EMAIL_ADDRESS,
                    clientId: GOOGLE_MAILER_CLIENT_ID,
                    clientSecret: GOOGLE_MAILER_CLIENT_SECRET,
                    refresh_token: GOOGLE_MAILER_REFRESH_TOKEN,
                    accessToken: myAccessToken
                }
            })
            const modifiedHash = checkMail.matKhau.replace(/\//g, '-');
            console.log(modifiedHash)
            const mailOptions = {
                to: email, // Gửi đến ai?
                subject: "Đổi mật khẩu trang shopsocxanh", // Tiêu đề email
                html: `<html>
                <head>
                    <style>
                        .button {
                            display: inline-block;
                            font-size: 16px;
                            font-weight: bold;
                            padding: 10px 20px;
                            text-align: center;
                            text-decoration: none;
                            background-color: #4CAF50;
                            color: white;
                            border-radius: 4px;
                            border: none;
                            cursor: pointer;
                        }
                        a{
                            color: white
                        }
                    </style>
                </head>
                <body>
                    <p>Xin chào!</p>
                    <p>Bạn có thể nhấn vào nút bên dưới để đổi mật khẩu:</p>
                    <a class="button" href="http://localhost:3000/reset/${modifiedHash}">Đổi mật khẩu</a>
                </body>
                </html>` // Nội dung email
            }
            await transport.sendMail(mailOptions)
            return res.json({ status: 200 })
        }
        else {
            return res.json({ status: 400 })

        }

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
})


router.post('/new-password', async (req, res) => {
    const { slug, password } = req.body;
    const modifiedHash = slug.replace(/-/g, '/')
    console.log(slug)
    console.log(modifiedHash)
    try {
        const user = await NguoiDung.findOne({ where: { matKhau: modifiedHash } });
        if (user) {
            bcrypt.hash(password, 10).then((hash) => {
                NguoiDung.update({
                    matKhau: hash,
                }, { where: { id: user.id } });
                return res.json({ status: 200, message: "Đổi mật khẩu thành công!" });
            })
        }
        else {
            return res.json({ status: 404, message: "Không tìm thấy tài khoản" })
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
})

module.exports = router;
