const express = require('express')
const router = express.Router()
const { TheLoai, SanPham } = require('../../models');


//show all categories
router.get('/show-all', async (req, res) => {
    const categories = await TheLoai.findAll();
    try {
        res.status(200).json({ categories: categories })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//Phân trang
router.get("/category", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    try {
        const categories = await TheLoai.findAndCountAll({
            offset,
            limit
        });
        const totalPages = Math.ceil(categories.count / limit);
        res.status(200).json({
            totalPages,
            categories: categories.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})


//update category
router.put("/upload-category", async (req, res) => {
    const { id, ten, moTa } = req.body;
    await TheLoai.update({ ten: ten, moTa: moTa }, { where: { id: id } });
    try {
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
})


//Add category
router.post("/add-category", async (req, res) => {
    const { ten, moTa } = req.body;
    await TheLoai.create({ ten: ten, moTa: moTa });
    try {
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})


//show product theo id của category
router.get('/show-product/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const products = await SanPham.findAll({ include: [TheLoai], where: { TheLoaiId: id } });
    try {
        res.status(200).json({ products: products })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//show category theo id 
router.get('/show-category/:id', async (req, res) => {
    const id = req.params.id;
    const category = await TheLoai.findOne({ where: { id: id } });
    try {
        res.status(200).json({ category: category })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.delete('/delete-category/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const product = await SanPham.findAll({ where: { TheLoaiId: id } })

        if (product.length > 0) {
            res.status(400).json({ message: 'Success' });
        }
        else {
            TheLoai.destroy({ where: { id: id } })
            res.status(200).json({ message: 'Success' });
        }
    }
    catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }

    /*  TheLoai.destroy({ where: { id: id } });
     try {
         res.status(200).json({ message: 'Success' });
     }
     catch (err) {
         console.error(err);
         res.status(500).json({ message: 'Internal server error' });
     } */
})

module.exports = router;