const express = require('express')
const router = express.Router()
const { YeuThich } = require('../../models');
const { validateToken } = require('../../middlewares/AuthMiddleware');

router.put('/favourite/:id', validateToken, async (req, res) => {
    const id = req.params.id
    try {
        if (req.user) {
            const like = await YeuThich.findOne({ where: { SanPhamId: id, NguoiDungId: req.user.id } })
            if (like) {
                YeuThich.destroy({ where: { SanPhamId: id, NguoiDungId: req.user.id } })
            }
            else {
                YeuThich.create({
                    SanPhamId: id,
                    NguoiDungId: req.user.id
                })
            }
            res.json({ status: 200, message: "success" })
        }
        else {
            res.json({ status: 401, message: "Vui lòng đăng nhập để tiếp tục" })
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})


router.get('/favourite/:id', validateToken, async (req, res) => {
    const id = req.params.id
    try {
        const like = await YeuThich.findOne({ where: { SanPhamId: id, NguoiDungId: req.user.id } })
        if (like) {
            res.json({ status: 200 })
        }
        else {
            res.json({ status: 201 })
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router;
