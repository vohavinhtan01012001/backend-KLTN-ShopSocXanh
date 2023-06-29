const express = require('express')
const router = express.Router()
const { BinhLuan, NguoiDung } = require('../../models');
const { validateToken } = require('../../middlewares/AuthMiddleware');

//show all colors
router.post('/add-comment', validateToken, async (req, res) => {
    const userId = req.user.id;
    const { comment, productId } = req.body;
    try {
        await BinhLuan.create({
            noiDung: comment,
            NguoiDungId: userId,
            SanPhamId: productId,
        })
        res.json({ status: 200 })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.get('/show-all/:id', async (req, res) => {
    const id = req.params.id;
    const comments = await BinhLuan.findAll({ include: [NguoiDung], where: { SanPhamId: id } });
    try {
        res.json({ status: 200, comments: comments });
    }
    catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router;
