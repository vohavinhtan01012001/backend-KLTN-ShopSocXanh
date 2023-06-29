const express = require('express')
const router = express.Router()
const { SanPham, NguoiDung, GioHang, TheLoai, KhuyenMai } = require('../../models');
const { validateToken } = require('../../middlewares/AuthMiddleware');


router.post('/add-to-cart', validateToken, async (req, res) => {
    const { productId, size, product_qty } = req.body;
    if (req.user) {
        const userId = req.user.id;
        const productCheck = await SanPham.findOne({ where: { id: productId } })
        if (productCheck) {
            const cartCheck = await GioHang.findOne({
                where: { SanPhamId: productId, NguoiDungId: userId, kichThuoc: size }
            })
            if (cartCheck) {
                res.json({
                    status: "409",
                    message: productCheck.ten + ' đã thêm vào giỏ hàng'
                })
                return;
            }
            else {
                await GioHang.create({
                    NguoiDungId: userId,
                    SanPhamId: productId,
                    kichThuoc: size,
                    soLuongSP: product_qty,
                })
                res.json({
                    status: "200",
                    message: 'Thêm thành công'
                })
                return;
            }
        } else {
            res.json({
                status: "404",
                message: 'Sản phẩm không tìm thấy'
            })
            return;
        }
    } else {
        res.json({
            status: "401",
            message: 'Vui lòng đăng nhập trước khi thêm vào giỏ hàng!'
        })
    }
})

router.get('/show-all', validateToken, async (req, res) => {
    if (req.user) {
        const userId = req.user.id;
        const cartItems = await GioHang.findAll({
            include: [{ model: NguoiDung }, {
                model: SanPham,
                include: [
                    {
                        model: TheLoai,
                    },
                    {
                        model: KhuyenMai,
                    }
                ]
            }], where: { NguoiDungId: userId }
        })
        res.json({ status: 200, cart: cartItems })
    } else {
        res.json({
            status: "401",
            message: 'Vui lòng đăng nhập trước khi thêm vào giỏ hàng!'
        })
    }
})

router.put('/cart-updatequantity/:cartId/:scope', validateToken, async (req, res) => {
    const cartId = req.params.cartId;
    const scope = req.params.scope;
    if (req.user) {
        const userId = req.user.id;
        const cartItem = await GioHang.findOne(
            {
                include: [
                    {
                        model: NguoiDung
                    },
                    {
                        model: SanPham,
                        include: [
                            {
                                model: TheLoai,
                            },
                            {
                                model: KhuyenMai,
                            }
                        ]
                    }], where: { id: cartId, NguoiDungId: userId }
            })
        let quantity = cartItem.soLuongSP;
        const productCheck = await SanPham.findOne({ where: { id: cartItem.SanPhamId } })
        console.log(productCheck)
        if (scope == 'inc') {
            if (
                (cartItem.soLuongSP < productCheck.soLuongM && cartItem.kichThuoc == "M")
                ||
                (cartItem.soLuongSP < productCheck.soLuongL && cartItem.kichThuoc == "L")
                ||
                (cartItem.soLuongSP < productCheck.soLuongXL && cartItem.kichThuoc == "XL")
            ) {
                quantity += 1;
            }
            else {
                quantity += 0;
            }
        } else if (scope == "dec") {
            if (cartItem.soLuongSP > 1) {
                quantity -= 1;
            }
            else {
                quantity -= 0;
            }
        }
        await GioHang.update(
            {
                soLuongSP: quantity,
            }
            ,
            {
                where: { id: cartId, NguoiDungId: userId }
            }
        )
        res.json({ status: 200 })
    } else {
        res.json({
            status: "401",
            message: 'Vui lòng đăng nhập trước khi thêm vào giỏ hàng!'
        })
    }
})


router.delete('/delete-cartitem/:cartId', validateToken, async (req, res) => {
    const cartId = req.params.cartId;
    if (req.user) {
        const userId = req.user.id;
        const cartItem = await GioHang.findOne({ where: { id: cartId, NguoiDungId: userId } })
        if (cartItem) {
            GioHang.destroy({ where: { id: cartId, NguoiDungId: userId } })
            res.json({ status: 200, message: 'Xóa thành công!' });
        }
        else {
            res.json({ status: 404, message: 'Không tìm thấy sản phẩm!' });
        }
    }
    else {
        res.json({ status: 401, message: 'Vui lòng đăng nhập!' });
    }
})


module.exports = router;
