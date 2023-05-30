const express = require('express')
const router = express.Router()
const multer = require('multer');
const path = require('path');
const { Sequelize } = require('sequelize');
const { SanPham, TheLoai, KhuyenMai, ThuongHieu } = require('../../models');


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

router.get("/show-all", async (req, res) => {
    const products = await SanPham.findAll({ include: [TheLoai] });
    try {
        if (products) {
            res.json({ products: products, status: 200 })
        }
        else {
            res.json({ status: 400 })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
})

//Phân trang
router.get("/product", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    try {
        const products = await SanPham.findAndCountAll({
            offset,
            limit,
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
            ]
        });

        const totalPages = Math.ceil(products.count / limit);
        res.json({
            status: 200,
            totalPages,
            products: products.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
})


///////Add Product
// Định nghĩa cấu hình multer để lưu trữ hình ảnh trong thư mục uploads

const storage = multer.diskStorage({
    destination: 'uploads/images/',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    },
});

// Khởi tạo multer với cấu hình
const upload = multer({ storage: storage });

router.post('/add-product', upload.fields([{ name: 'image1' }, { name: 'image2' }, { name: 'image3' }, { name: 'image4' }]), async (req, res) => {
    try {
        const { ten, giaTien, mauSac, soLuongM, soLuongL, soLuongXL, moTa, TheLoaiId, KhuyenMaiId, ThuongHieuId, trangThai } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files were uploaded' });
        }
        const image1 = req.files['image1'][0].path.replace(/\\/g, '/');
        const image2 = req.files['image2'][0].path.replace(/\\/g, '/');
        const image3 = req.files['image3'][0].path.replace(/\\/g, '/');
        const image4 = req.files['image4'][0].path.replace(/\\/g, '/');

        // Tính giá giảm
        const disCount = await KhuyenMai.findOne({
            where: { id: KhuyenMaiId }
        })

        let giaTri = 0;

        if (disCount) {
            giaTri = disCount.giamGia;
        }

        const giaTienNum = parseFloat(giaTien);
        const giaTriNum = parseFloat(giaTri);

        const giaGiam = parseFloat(giaTienNum - (giaTienNum * giaTriNum / 100));

        //xet randomId bị trùng
        let id = 'SP' + randomId;
        const showId = await SanPham.findOne({ where: { id: 'SP' + randomId } })
        if (showId) {
            const idSanPham = generateRandomId(10)
            id = "SP" + idSanPham;
        }

        //xét có dữ liệu khuyến mãi không 
        // Create a new product in the database
        if (KhuyenMaiId != 0) {
            await SanPham.create({
                id: id,
                ten: ten,
                giaTien: giaTien,
                mauSac: mauSac,
                soLuongM: soLuongM,
                soLuongL: soLuongL,
                soLuongXL: soLuongXL,
                moTa: moTa,
                TheLoaiId: TheLoaiId,
                hinh: image1,
                hinh2: image2,
                hinh3: image3,
                hinh4: image4,
                KhuyenMaiId: KhuyenMaiId,
                ThuongHieuId: ThuongHieuId,
                giaGiam: giaGiam,
                trangThai: trangThai,
            });
        }
        else {
            await SanPham.create({
                id: id,
                ten: ten,
                giaTien: giaTien,
                mauSac: mauSac,
                soLuongM: soLuongM,
                soLuongL: soLuongL,
                soLuongXL: soLuongXL,
                moTa: moTa,
                TheLoaiId: TheLoaiId,
                hinh: image1,
                hinh2: image2,
                hinh3: image3,
                hinh4: image4,
                ThuongHieuId: ThuongHieuId,
                giaGiam: giaGiam,
                trangThai: trangThai,
            });
        }
        res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});


//show product id
router.get("/product/:id", async (req, res) => {
    const id = req.params.id;
    const product = await SanPham.findAll({ where: { id: id }, include: [TheLoai] });
    try {
        if (product) {
            res.status(200).json({ product: product })
        }
        else {
            res.status(404).json({ product: product })
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
})

//update product 
router.put('/upload-product', upload.fields([{ name: 'image1' }, { name: 'image2' }, { name: 'image3' }, { name: 'image4' }]), async (req, res) => {
    try {
        const { id, ten, giaTien,mauSac, soLuongM, soLuongL, soLuongXL, moTa, TheLoaiId, ThuongHieuId, giaGiam, trangThai } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files were uploaded' });
        }
        const image1 = req.files['image1'][0].path.replace(/\\/g, '/');
        const image2 = req.files['image2'][0].path.replace(/\\/g, '/');
        const image3 = req.files['image3'][0].path.replace(/\\/g, '/');
        const image4 = req.files['image4'][0].path.replace(/\\/g, '/');

        // Create a new product in the database
        await SanPham.update({
            id: 'SP' + randomId,
            ten: ten,
            giaTien: giaTien,
            mauSac: mauSac,
            soLuongM: soLuongM,
            soLuongL: soLuongL,
            soLuongXL: soLuongXL,
            moTa: moTa,
            TheLoaiId: TheLoaiId,
            hinh: image1,
            hinh2: image2,
            hinh3: image3,
            hinh4: image4,
            ThuongHieuId: ThuongHieuId,
            giaGiam: giaGiam,
            trangThai: trangThai,
        }, { where: { id: id } });
        res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});


//delete  product
router.delete('/delete-product', (req, res) => {
    try {
        const { id } = req.body
        SanPham.destroy({ where: { id: id } });
        res.status(200).json({ message: 'Success' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
})


module.exports = router;