const express = require('express')
const router = express.Router()
const { ThuongHieu, SanPham, KhuyenMai, TheLoai } = require('../../models');
const { adminAuth } = require('../../middlewares/AuthAdmin');


//show all trademarks
router.get('/show-all', async (req, res) => {
    const trademarks = await ThuongHieu.findAll();
    try {
        res.status(200).json({ trademarks: trademarks })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})
module.exports = router;