const express = require('express')
const router = express.Router()
const { MauSac } = require('../../models');
const { adminAuth } = require('../../middlewares/AuthAdmin');

//show all colors
router.get('/show-all',adminAuth , async (req, res) => {
    const colors = await MauSac.findAll();
    try {
        res.status(200).json({ colors: colors })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//Phân trang
router.get("/color",adminAuth , async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    try {
        const colors = await MauSac.findAndCountAll({
            offset,
            limit
        });
        const totalPages = Math.ceil(colors.count / limit);
        res.status(200).json({
            totalPages,
            colors: colors.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})


//Add color
router.post("/add-color",adminAuth , async (req, res) => {
    const { tenMauSac, moTa } = req.body;
    await MauSac.create({ ten: tenMauSac, moTa: moTa });
    try {
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})


//update color
router.put("/upload-color",adminAuth , async (req, res) => {
    const { id, tenMau, moTa } = req.body;
    await MauSac.update({ ten: tenMau, moTa: moTa }, { where: { id: id } });
    try {
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
})

module.exports = router;
