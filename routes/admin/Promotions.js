const express = require('express')
const router = express.Router()
const path = require('path');
const { KhuyenMai, SanPham, TheLoai, ThuongHieu } = require('../../models');
const { Op } = require('sequelize');
const { adminAuth } = require('../../middlewares/AuthAdmin');


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
router.get('/show-all',adminAuth, async (req, res) => {
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
router.get("/promotion",adminAuth, async (req, res) => {
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
router.post("/add-promotion",adminAuth, async (req, res) => {
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
router.put("/upload-promotion",adminAuth, async (req, res) => {
    const { id, tieuDe, giamGia } = req.body;
    try {

        // upload giá giảm trong product
        const giaTriNum = parseFloat(giamGia);
        const product = await SanPham.findAll({
            where: { KhuyenMaiId: id }
        })
        if (product) {
            for (let i = 0; i < product.length; i++) {
                const giaTienNum = parseFloat(product[i].giaTien);
                const giaGiam = parseFloat(giaTienNum - (giaTienNum * giaTriNum / 100));
                await SanPham.update(
                    {
                        giaGiam: giaGiam
                    },
                    { where: { KhuyenMaiId: id } }
                )
            }
        }
        await KhuyenMai.update({ tieuDe: tieuDe, giamGia: giamGia }, { where: { id: id } });

        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
})

//show all product không có promotionId đã chọn
router.get("/show-product/:id",adminAuth, async (req, res) => {
    const id = req.params.id;
    const products = await SanPham.findAll({
        include: [
            {
                model: TheLoai,
            },
            {
                model: ThuongHieu,
            },
            {
                model: KhuyenMai,

            },
        ],
        where: {
            [Op.or]: [
                { KhuyenMaiId: { [Op.ne]: id } },
                { KhuyenMaiId: null },
            ]
        }
    },
    );
    try {
        res.json({ products: products, status: 200 })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
})

//show promotion theo id 
router.get('/show-promotion/:id',adminAuth, async (req, res) => {
    const id = req.params.id;
    const promotion = await KhuyenMai.findOne({ where: { id: id } });
    try {
        res.status(200).json({ promotion: promotion })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//update product có promotion
router.put("/upload-productPro/:id",adminAuth, async (req, res) => {
    const KhuyenMaiId = req.params.id;
    const { idProduct } = req.body;
    try {
        const product = await SanPham.findOne({ where: { id: idProduct } });
        if (product) {
            // Tính giá giảm
            const disCount = await KhuyenMai.findOne({
                where: { id: KhuyenMaiId }
            });

            let giaGiam = 0;

            if (disCount) {
                const giaTienNum = parseFloat(product.giaTien);
                const giaTriNum = parseFloat(disCount.giamGia);

                giaGiam = parseFloat(giaTienNum - (giaTienNum * giaTriNum / 100));
            }

            await SanPham.update({ KhuyenMaiId: KhuyenMaiId, giaGiam: giaGiam }, { where: { id: idProduct } });
        };
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
})

//show product theo id cua promotion 
router.get("/show-listProduct/:id",adminAuth, async (req, res) => {
    const id = req.params.id;
    const products = await SanPham.findAll({
        include: [
            {
                model: TheLoai,
            },
            {
                model: ThuongHieu,
            },
            {
                model: KhuyenMai,

            },
        ],
        where: {
            KhuyenMaiId: id
        }
    },
    );
    try {
        res.json({ products: products, status: 200 })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
})


//update product có promotion
router.put("/detele-idPromotion",adminAuth, async (req, res) => {
    const { id } = req.body;
    try {
        const product = await SanPham.findOne({ where: { id: id } });
        if (product) {
            await SanPham.update({ KhuyenMaiId: null, giaGiam: product.giaTien }, { where: { id: id } });
        };
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
})


//delete promotion
router.delete('/delete-promotion/:id', (req, res) => {
    const id = req.params.id;
    try {
        KhuyenMai.destroy({ where: { id: id } })
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router;
