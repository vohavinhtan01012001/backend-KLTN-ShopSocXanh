const express = require('express')
const router = express.Router()
const { KieuDang } = require('../../models');
const { adminAuth } = require('../../middlewares/AuthAdmin');

//show all styles
router.get('/show-all',adminAuth , async (req, res) => {
    const styles = await KieuDang.findAll();
    try {
        res.status(200).json({ styles: styles })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//Phân trang
router.get("/style",adminAuth , async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    try {
        const styles = await KieuDang.findAndCountAll({
            offset,
            limit
        });
        const totalPages = Math.ceil(styles.count / limit);
        res.status(200).json({
            totalPages,
            styles: styles.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})


//Add style
router.post("/add-style",adminAuth , async (req, res) => {
    const { ten, moTa } = req.body;
    await KieuDang.create({ ten: ten, moTa: moTa });
    try {
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})


//update style
router.put("/upload-style",adminAuth , async (req, res) => {
    const { id, ten, moTa } = req.body;
    await KieuDang.update({ ten: ten, moTa: moTa }, { where: { id: id } });
    try {
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
})

module.exports = router;
