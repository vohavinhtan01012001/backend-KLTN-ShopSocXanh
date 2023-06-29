const express = require('express')
const router = express.Router()
const { Icon,NguoiDung } = require('../../models');
const { validateToken } = require('../../middlewares/AuthMiddleware');

router.post('/upload-icon', validateToken, async (req, res) => {
    const { icon, commentId, productId } = req.body;
    const userId = req.user.id;
    try {
        const existingIcon = await Icon.findOne({
            where: {
                icon: icon,
                BinhLuanId: commentId,
                NguoiDungId: userId,
                SanPhamId: productId
            }
        });

        if (!existingIcon && icon !== 0) {
            await Icon.create({
                icon: icon,
                BinhLuanId: commentId,
                NguoiDungId: userId,
                SanPhamId: productId,
            });

            res.json({ status: 200 });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.get('/show-all/:id', async (req, res) => {
    const productId = req.params.id;
    const icons = await Icon.findAll({ include: [NguoiDung], where: { SanPhamId: productId } });
    try {
        res.json({ status: 200, icons: icons });
    }
    catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router;
