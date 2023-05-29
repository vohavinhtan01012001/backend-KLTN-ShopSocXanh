const express = require('express')
const router = express.Router()
const path = require('path');
const { KhuyenMai } = require('../../models');


// Hàm tạo ID ngẫu nhiên
function generateRandomId(length) {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
const randomId = generateRandomId(10);


//show all promotions
router.get('/show-all', async (req, res) => {
    const promotions = await KhuyenMai.findAll();
    try {
        res.status(200).json({ promotions: promotions })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//show phân trang promotion
router.get("/promotion", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    try {
        const promotion = await KhuyenMai.findAndCountAll({
            offset,
            limit,
        });
        const totalPages = Math.ceil(promotion.count / limit);
        res.json({
            status: 200,
            totalPages,
            promotion: promotion.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
})

//Add promotion
router.post("/add-promotion", async (req, res) => {
    const { tieuDe, giamGia } = req.body;
    let id = 'KM' + randomId;
    const showId = await KhuyenMai.findOne({ where: { id: 'KM' + randomId } })
    if (showId) {
        const idKhuyenMai = generateRandomId(10)
        id = "KM" + idKhuyenMai;
    }
    await KhuyenMai.create({ id: id, tieuDe: tieuDe, giamGia: giamGia });
    try {
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//update promotion
router.put("/upload-promotion", async (req, res) => {
    const { id, tieuDe, giamGia } = req.body;
    await KhuyenMai.update({ tieuDe: tieuDe, giamGia: giamGia }, { where: { id: id } });
    try {
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
})

module.exports = router;
