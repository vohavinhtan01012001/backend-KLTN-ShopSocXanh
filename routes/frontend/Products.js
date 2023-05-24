const express = require('express')
const router = express.Router()
const { SanPham, TheLoai } = require('../../models');

router.get("/show-all", async (req, res) => {
    const products = await SanPham.findAll({ include: [TheLoai] });
    if (products) {
        res.json({ products: products, status: 200 })
    }
    else {
        res.json({ status: 400 })
    }
})
module.exports = router;