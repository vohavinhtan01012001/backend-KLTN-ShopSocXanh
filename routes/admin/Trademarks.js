const express = require('express')
const router = express.Router()
const { ThuongHieu, SanPham, KhuyenMai, TheLoai } = require('../../models');


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

//Phân trang
router.get("/trademark", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    try {
        const trademarks = await ThuongHieu.findAndCountAll({
            offset,
            limit
        });
        const totalPages = Math.ceil(trademarks.count / limit);
        res.status(200).json({
            totalPages,
            trademarks: trademarks.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//Add trademark
router.post("/add-trademark", async (req, res) => {
    const { ten, moTa } = req.body;
    await ThuongHieu.create({ ten: ten, moTa: moTa });
    try {
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//update trademark
router.put("/upload-trademark", async (req, res) => {
    const { id, ten, moTa } = req.body;
    await ThuongHieu.update({ ten: ten, moTa: moTa }, { where: { id: id } });
    try {
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
})

//show product theo id của trademark
router.get('/show-product/:id', async (req, res) => {
    const id = req.params.id;
    const products = await SanPham.findAll({
        include: [
            {
                model: KhuyenMai,
            },
            {
                model: TheLoai
            },
            {
                model: ThuongHieu
            }
        ], where: { ThuongHieuId: id }
    });
    try {
        res.status(200).json({ products: products })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})


//show trademark theo id 
router.get('/show-trademark/:id', async (req, res) => {
    const id = req.params.id;
    const trademark = await ThuongHieu.findOne({ where: { id: id } });
    try {
        res.status(200).json({ trademark: trademark })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.delete('/delete-trademark/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const product = await SanPham.findAll({ where: { ThuongHieuId: id } })

        if (product.length > 0) {
            res.status(400).json({ message: 'Còn sản phẩm trong thương hiệu' });
        }
        else {
            ThuongHieu.destroy({ where: { id: id } })
            res.status(200).json({ message: 'Success' });
        }
    }
    catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router;