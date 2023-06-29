const express = require('express')
const router = express.Router()
const moment = require('moment');
const { DonHang, ChiTietDonHang,TheLoai, GioHang, SanPham, NguoiDung } = require('../../models');
const { validateToken } = require('../../middlewares/AuthMiddleware');

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
            const orderItems = await ChiTietDonHang.findAll({ include: [{
                model:SanPham,
                include: [TheLoai]
            }], where: { DonHangId: id } });
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
module.exports = router;
