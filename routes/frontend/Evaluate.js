const express = require('express')
const router = express.Router()
const { DanhGia } = require('../../models');
const { validateToken } = require('../../middlewares/AuthMiddleware');

router.put('/upload-star', validateToken, async (req, res) => {
    const { star, productId } = req.body;
    console.log(star, productId);
    const userId = req.user.id;
    try {
        const evaluate = await DanhGia.findOne({ where: { NguoiDungId: userId, SanPhamId: productId } })
        if (evaluate) {
            const evaluates = await DanhGia.update({ danhGia: star }, { where: { id: evaluate.id } })
            res.json({ status: 200, evaluate: evaluates })
        }
        else {
            const evaluates = await DanhGia.create({ danhGia: star, SanPhamId: productId, NguoiDungId: userId })
            res.json({ status: 200, evaluate: evaluates })
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.put('/show-all', validateToken, async (req, res) => {
    const productListId = req.body;
    const userId = req.user.id;
    let product = []
    try {
        for (let i = 0; i < productListId.length; i++) {
            const evaluate = await DanhGia.findOne({ where: { SanPhamId: productListId[i], NguoiDungId: userId } })
            if(evaluate){
                product.push(evaluate)
            }
        }
        res.json({ status: 200, product: product })
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get('/show-star', async (req, res) => {
    try {
        const stars = await DanhGia.findAll();

        res.json({ status: 200, stars: stars })
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = router;
