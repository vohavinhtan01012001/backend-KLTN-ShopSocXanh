
const express = require('express')
const router = express.Router()
const moment = require('moment');
const { DonHang, ChiTietDonHang, GioHang, SanPham, NguoiDung } = require('../../models');
const { validateToken } = require('../../middlewares/AuthMiddleware');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const { adminAuth } = require('../../middlewares/AuthAdmin');

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
router.get('/show-all',adminAuth, async (req, res) => {
    const orders = await DonHang.findAll();
    try {
        res.status(200).json({ orders: orders })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.get('/show/order/:id',adminAuth, async (req, res) => {
    const id = req.params.id;
    const order = await DonHang.findOne({ where: { id: id } });
    try {
        res.status(200).json({ order: order })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//Phân trang
router.get("/order",adminAuth, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    try {
        const orders = await DonHang.findAndCountAll({
            offset,
            limit,
            include: [{
                model: NguoiDung
            }]
        });
        const totalPages = Math.ceil(orders.count / limit);
        res.status(200).json({
            totalPages,
            orders: orders.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})


router.post('/place-order', validateToken, async (req, res) => {
    const { hoTen, diaChi, sdt, ghiChu } = req.body;
    try {
        if (req.user) {
            const userId = req.user.id;

            const cart = await GioHang.findAll({
                include: [
                    {
                        model: NguoiDung
                    },
                    {
                        model: SanPham,
                    }
                ], where: { NguoiDungId: userId }
            })
            let orderItems = [];
            let sumPriceOrder = 0;
            for (const item of cart) {
                console.log(item);
                const { SanPhamId, soLuongSP, kichThuoc, SanPham } = item;
                let sumPrice;
                if (kichThuoc === 'M') {
                    sumPrice = SanPham.giaGiam * soLuongSP

                    await SanPham.update({
                        soLuongM: SanPham.soLuongM - soLuongSP,
                    });
                } else if (kichThuoc === 'L') {
                    sumPrice = SanPham.giaGiam * soLuongSP

                    await SanPham.update({
                        soLuongL: SanPham.soLuongL - soLuongSP,
                    });
                } else if (kichThuoc === 'XL') {
                    sumPrice = SanPham.giaGiam * soLuongSP
                    await SanPham.update({
                        soLuongXL: SanPham.soLuongXL - soLuongSP,
                    });
                }
                sumPriceOrder += sumPrice;
                orderItems.push({
                    SanPhamId,
                    [`soLuong${kichThuoc}`]: soLuongSP,
                    giaTien: SanPham.giaGiam,
                    tongTien: sumPrice,
                });
            }
            sumPriceOrder += 30000;
            const order = await DonHang.create({
                NguoiDungId: userId,
                hoTen: hoTen,
                sdt: sdt,
                diaChi: diaChi,
                ghiChu: ghiChu,
                tongTien: sumPriceOrder,
            })

            await ChiTietDonHang.bulkCreate(orderItems.map(item => ({ DonHangId: order.id, ...item })));

            await GioHang.destroy({
                where: {
                    NguoiDungId: userId,
                },
            });

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

            const mailOptions = {
                to: ADMIN_EMAIL_ADDRESS, // Gửi đến ai?
                subject: "Có một đơn hàng mới!", // Tiêu đề email
                html: `Vui lòng nhấp vào trang liên kết để xác nhận quản lý đơn hàng http://localhost:3000/admin/view-order` // Nội dung email
            }

            await transport.sendMail(mailOptions)

            return res.status(200).json({
                status: 200,
                message: 'Cảm ơn bạn đã mua sản phẩm của chúng tôi!',
            });
        }
        else {
            return res.status(401).json({
                status: 401,
                message: 'Đăng nhập để tiếp tục',
            });
        }
    } catch (error) {
        return res.status(422).json({
            status: 422,
            errors: error.errors,
        });
    }
})


router.post('/place-order/vnpay', validateToken, async (req, res) => {
    const { hoTen, diaChi, sdt, ghiChu } = req.body;
    try {
        if (req.user) {
            const userId = req.user.id;

            const cart = await GioHang.findAll({
                include: [
                    {
                        model: NguoiDung
                    },
                    {
                        model: SanPham,
                    }
                ], where: { NguoiDungId: userId }
            })
            let orderItems = [];
            let sumPriceOrder = 0;
            for (const item of cart) {
                console.log(item);
                const { SanPhamId, soLuongSP, kichThuoc, SanPham } = item;
                let sumPrice;
                if (kichThuoc === 'M') {
                    sumPrice = SanPham.giaGiam * soLuongSP

                    await SanPham.update({
                        soLuongM: SanPham.soLuongM - soLuongSP,
                    });
                } else if (kichThuoc === 'L') {
                    sumPrice = SanPham.giaGiam * soLuongSP

                    await SanPham.update({
                        soLuongL: SanPham.soLuongL - soLuongSP,
                    });
                } else if (kichThuoc === 'XL') {
                    sumPrice = SanPham.giaGiam * soLuongSP
                    await SanPham.update({
                        soLuongXL: SanPham.soLuongXL - soLuongSP,
                    });
                }
                sumPriceOrder += sumPrice;
                orderItems.push({
                    SanPhamId,
                    [`soLuong${kichThuoc}`]: soLuongSP,
                    giaTien: SanPham.giaGiam,
                    tongTien: sumPrice,
                });
            }
            sumPriceOrder += 30000;
            const order = await DonHang.create({
                NguoiDungId: userId,
                hoTen: hoTen,
                sdt: sdt,
                diaChi: diaChi,
                ghiChu: ghiChu,
                tongTien: sumPriceOrder,
                thanhToanVnpay: 1,
            })

            await ChiTietDonHang.bulkCreate(orderItems.map(item => ({ DonHangId: order.id, ...item })));

            await GioHang.destroy({
                where: {
                    NguoiDungId: userId,
                },
            });

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

            const mailOptions = {
                to: ADMIN_EMAIL_ADDRESS, // Gửi đến ai?
                subject: "Có một đơn hàng mới!", // Tiêu đề email
                html: `Vui lòng nhấp vào trang liên kết để xác nhận quản lý đơn hàng http://localhost:3000/admin/view-order` // Nội dung email
            }

            await transport.sendMail(mailOptions)

            return res.status(200).json({
                status: 200,
                message: 'Cảm ơn bạn đã mua sản phẩm của chúng tôi!',
            });
        }
        else {
            return res.status(401).json({
                status: 401,
                message: 'Đăng nhập để tiếp tục',
            });
        }
    } catch (error) {
        return res.status(422).json({
            status: 422,
            errors: error.errors,
        });
    }
})


//show all ordersItems
router.get('/show-all/orderItems/:id',adminAuth, async (req, res) => {
    const id = req.params.id;
    const ordersItems = await ChiTietDonHang.findAll({ where: { DonHangId: id } });
    try {
        res.status(200).json({ orderItems: ordersItems })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//Phân trang
router.get("/orderItems/:id",adminAuth, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const id = req.params.id
    try {
        const ordersItems = await ChiTietDonHang.findAndCountAll({
            offset,
            limit,
            include: [
                {
                    model: SanPham,
                }
            ], where: { DonHangId: id }
        })
        const totalPages = Math.ceil(ordersItems.count / limit);
        res.status(200).json({
            totalPages,
            orderItems: ordersItems.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})





//update status
router.put("/upload-status/:id",adminAuth, async (req, res) => {
    const id = req.params.id;
    console.log(id);
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
                to: order.NguoiDung.email, // Gửi đến ai?
                subject: "Đơn hàng đã được xác nhận", // Tiêu đề email
                html: `<div>
                Xin chào ${order.hoTen},<br><br>
                    Chúng tôi xin gửi lời cảm ơn đến anh/chị vì đã đặt hàng từ chúng tôi. Rất vui thông báo rằng đơn hàng của anh/chị đã được xác nhận thành công.<br><br>
                    Dưới đây là thông tin chi tiết về đơn hàng của anh/chị:<br><br>
                    Mã đơn hàng: ${order.id}<br>
                    Ngày đặt hàng: ${date}<br>
                    Tổng tiền hàng: ${price} (đã bao gồm phí vận chuyển + 30.000 VNĐ)<br><br>
                    Chúng tôi đang tiến hành xử lý đơn hàng của anh/chị và sẽ gửi thông tin vận chuyển cụ thể khi hàng sẵn sàng được giao. Thời gian giao hàng dự kiến là ${dates}. Anh/chị có thể theo dõi trạng thái đơn hàng bằng cách truy cập vào tài khoản của mình trên trang web của chúng tôi hoặc sử dụng mã đơn hàng để tra cứu.<br><br>
                    Nếu anh/chị có bất kỳ câu hỏi hoặc yêu cầu nào liên quan đến đơn hàng, vui lòng liên hệ với chúng tôi qua địa chỉ email hoặc số điện thoại đã cung cấp. Chúng tôi sẽ sẵn lòng hỗ trợ anh/chị.<br><br>
                    Một lần nữa, chúng tôi xin chân thành cảm ơn sự tin tưởng và ủng hộ của anh/chị. Chúng tôi hy vọng sẽ tiếp tục phục vụ anh/chị trong tương lai.<br><br>
                    Trân trọng,<br>
                    Vinh Tân<br>
                    ShopSocXanh
               </div>` // Nội dung email
            }
            await DonHang.update({ trangThai: 1 }, { where: { id: id } });
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

router.put("/upload-delivery/:id",adminAuth, async (req, res) => {
    const id = req.params.id;
    console.log(id);
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
            const mailOptions = {
                to: order.NguoiDung.email, // Gửi đến ai?
                subject: "Đơn hàng đã giao thành công!", // Tiêu đề email
                html: `<div>
                Xin chào ${order.hoTen},<br><br>
                Chúng tôi rất vui thông báo rằng đơn hàng của bạn đã được giao thành công.<br><br>
                Chúng tôi xin chân thành cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng chúng tôi. Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu hỗ trợ nào, hãy liên hệ với đội ngũ dịch vụ khách hàng của chúng tôi.<br><br>
                    Trân trọng,<br>
                    Vinh Tân<br>
                    ShopSocXanh
               </div>` // Nội dung email
            }
            if (order.thanhToanVnpay === 1) {
                await DonHang.update({ giaoHang: 1 }, { where: { id: id } });
            }
            else {
                await DonHang.update({ giaoHang: 1, thanhToanTienMat: 1 }, { where: { id: id } });
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


//show all status xác nhận
router.get('/show-status',adminAuth, async (req, res) => {
    const orders = await DonHang.findAll({ where: { trangThai: 0, huyDon: 0 } });
    try {
        res.status(200).json({ orders: orders })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})


//show all đã xác nhận chưa giao hàng
router.get('/show-transport',adminAuth, async (req, res) => {
    const orders = await DonHang.findAll({ where: { trangThai: 1, giaoHang: 0, huyDon: 0 } });
    try {
        res.status(200).json({ orders: orders })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//show all đã giao hàng
router.get('/show-delivery',adminAuth, async (req, res) => {
    const orders = await DonHang.findAll({ where: { trangThai: 1, giaoHang: 1, huyDon: 0 } });
    try {
        res.status(200).json({ orders: orders })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//show all đã hủy
router.get('/show-cancel',adminAuth, async (req, res) => {
    const orders = await DonHang.findAll({ where: { huyDon: 1 } });
    try {
        res.status(200).json({ orders: orders })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})


//show all đã hủy
router.put('/upload-cancel',adminAuth, async (req, res) => {
    const { id } = req.body;
    try {
        const order = await DonHang.findOne({ where: { id: id } })
        if (order) {
            await DonHang.update({ huyDon: 1 }, { where: { id: order.id, giaoHang: 0 } });
            return res.json({ status: 200, message: "Hủy thành công!", order: order });
        }
        return res.json({ status: 404, message: "Không tìm thấy đơn hàng!" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.post('/search',adminAuth, async (req, res) => {
    const id = req.body.id;
    const orders = await DonHang.findAll()
    let results = ''
    if (id != 0 && id.trim() !== '') {
        results = orders.filter(order =>
            order.id == id
        );
        return res.json({ status: 200, orders: results });
    }


});

module.exports = router;