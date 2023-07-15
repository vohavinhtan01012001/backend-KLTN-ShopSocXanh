const express = require('express')
const router = express.Router()
const moment = require('moment');
const { DonHang, ChiTietDonHang, TheLoai, GioHang, SanPham, NguoiDung } = require('../../models');
const { validateToken } = require('../../middlewares/AuthMiddleware');
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

//show all orders
router.get('/view-order', validateToken, async (req, res) => {
    const id = req.user.id;
    try {
        if (req.user) {
            const orders = await DonHang.findAll({ where: { NguoiDungId: id } });

            res.json({ status: 200, orders: orders })
        }
        else {
            res.json({ status: 401, message: 'Vui lòng đăng nhập để tiếp tục' })
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})


router.get('/view-order/:id', validateToken, async (req, res) => {
    const id = req.params.id;
    try {
        if (req.user) {
            const orderItems = await ChiTietDonHang.findAll({
                include: [{
                    model: SanPham,
                    include: [TheLoai]
                }], where: { DonHangId: id }
            });
            res.json({ status: 200, orderItems: orderItems })
        }
        else {
            res.json({ status: 401, message: 'Vui lòng đăng nhập để tiếp tục' })
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.put("/sendMail-cancel/:id", async (req, res) => {
    const id = req.params.id;
    const input = req.body.input;
    const order = await DonHang.findOne({ include: [NguoiDung], where: { id: id } })
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

    try {
        if (order) {
            const date = moment(order.createdAt).format('DD/MM/YYYY');
            const dates = moment(order.createdAt, 'YYYY-MM-DD').add(4, 'days').format('DD/MM/YYYY');
            const formatMoney = (value) => {
                return value.toLocaleString('vi-VN') + ' VNĐ';
            };
            const price = formatMoney(order.tongTien)
            const mailOptions = {
                to: ADMIN_EMAIL_ADDRESS, // Gửi đến ai?
                subject: "Hủy đơn hàng", // Tiêu đề email
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
                <div>
                Khách hàng ${order.NguoiDung.hoTen}
                    Mã đơn hàng: ${order.id}<br>
                    Ngày đặt hàng: ${date}<br>
                    Tổng tiền hàng: ${price} (đã bao gồm phí vận chuyển + 30.000 VNĐ) <br>
                    Lý do: ${input}<br>
                    Muốn hủy đơn hàng này. Vui lòng nhấp vào link bên dưới để kiểm tra.<br>
                    <a class="button" href='http://localhost:3000/admin/view-order'>Kiếm tra đơn hàng</a>
               </div>
                </body>
                </html>
               ` // Nội dung email
            }
            res.json({ status: 200, message: 'Xác nhận thành công!', mailOptions: mailOptions });
            await transport.sendMail(mailOptions)
        }
        else {
            res.json({ status: 404, message: 'Không tìm thấy đơn hàng' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
})




module.exports = router;
