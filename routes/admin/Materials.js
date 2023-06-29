const express = require('express')
const router = express.Router()
const { ChatLieu } = require('../../models');

//show all materials
router.get('/show-all', async (req, res) => {
    const materials = await ChatLieu.findAll();
    try {
        res.status(200).json({ materials: materials })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//Phân trang
router.get("/material", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    try {
        const materials = await ChatLieu.findAndCountAll({
            offset,
            limit
        });
        const totalPages = Math.ceil(materials.count / limit);
        res.status(200).json({
            totalPages,
            materials: materials.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})


//Add material
router.post("/add-material", async (req, res) => {
    const { tenChatLieu, moTa } = req.body;
    await ChatLieu.create({ tenChatLieu: tenChatLieu, moTa: moTa });
    try {
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})


//update material
router.put("/upload-material", async (req, res) => {
    const { id, tenChatLieu, moTa } = req.body;
    await ChatLieu.update({ tenChatLieu: tenChatLieu, moTa: moTa }, { where: { id: id } });
    try {
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
})

module.exports = router;
