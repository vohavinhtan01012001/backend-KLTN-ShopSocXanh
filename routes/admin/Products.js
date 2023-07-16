const express = require('express')
const router = express.Router()
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { SanPham, TheLoai, KhuyenMai, ThuongHieu, MauSac, ChatLieu, KieuDang } = require('../../models');
const { adminAuth } = require('../../middlewares/AuthAdmin');

//show all products
router.get("/show-all", adminAuth, async (req, res) => {
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
router.get("/product", adminAuth, async (req, res) => {
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
                },
                {
                    model: MauSac
                },
                {
                    model: ChatLieu
                },
                {
                    model: KieuDang
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

router.post('/add-product', adminAuth, upload.fields([{ name: 'image1' }, { name: 'image2' }, { name: 'image3' }, { name: 'image4' }]), async (req, res) => {
    try {
        const { ten, giaTien, gioiTinh, MauSacId, KieuDangId, ChatLieuId, soLuongM, soLuongL, soLuongXL, moTa, TheLoaiId, KhuyenMaiId, ThuongHieuId, trangThai } = req.body;

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

        const theLoaiId = TheLoaiId.toString().padStart(3, '0');
        const thuongHieuId = ThuongHieuId.toString().padStart(3, '0');

        const lastProduct = await SanPham.findOne({
            order: [['id', 'DESC']],
        });
        let id = `SP0000${theLoaiId}${thuongHieuId}`;
        if (lastProduct) {
            const lastProductId = lastProduct.id[2] + lastProduct.id[3] + lastProduct.id[4] + lastProduct.id[5];
            const ids = parseInt(lastProductId) + 1;
            const soThuTu = ids.toString().padStart(4, '0');

            id = `SP${soThuTu}${theLoaiId}${thuongHieuId}`;
        }

        //xét có dữ liệu khuyến mãi không 
        if (KhuyenMaiId != 0) {
            await SanPham.create({
                id: id,
                ten: ten,
                giaTien: giaTien,
                gioiTinh: gioiTinh,
                MauSacId: MauSacId,
                ChatLieuId: ChatLieuId,
                soLuongM: soLuongM,
                soLuongL: soLuongL,
                soLuongXL: soLuongXL,
                moTa: moTa,
                TheLoaiId: TheLoaiId,
                KieuDangId: KieuDangId,
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
                gioiTinh: gioiTinh,
                MauSacId: MauSacId,
                ChatLieuId: ChatLieuId,
                soLuongM: soLuongM,
                soLuongL: soLuongL,
                soLuongXL: soLuongXL,
                moTa: moTa,
                TheLoaiId: TheLoaiId,
                KieuDangId: KieuDangId,
                hinh: image1,
                hinh2: image2,
                hinh3: image3,
                hinh4: image4,
                KhuyenMaiId: null,
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
router.get("/product/:id", adminAuth, async (req, res) => {
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
router.put('/upload-product/:id', adminAuth, upload.fields([{ name: 'image1' }, { name: 'image2' }, { name: 'image3' }, { name: 'image4' }]), async (req, res) => {
    try {
        const id = req.params.id;
        const { ten, giaTien, gioiTinh, MauSacId, KieuDangId, ChatLieuId, soLuongM, soLuongL, soLuongXL, moTa, TheLoaiId, ThuongHieuId, KhuyenMaiId, trangThai } = req.body;

        /* if (!req.files || req.files.length === 0) {
                    return res.status(400).json({ message: 'No files were uploaded' });
                } */
        const product = await SanPham.findOne({ where: { id: id } });
        if (!product) {
            return res.status(404).json({ message: 'Địa chỉ không hợp lệ' });
        }
        const image1 = req.files['image1'] ? req.files['image1'][0].path.replace(/\\/g, '/') : product.hinh;
        const image2 = req.files['image2'] ? req.files['image2'][0].path.replace(/\\/g, '/') : product.hinh2;
        const image3 = req.files['image3'] ? req.files['image3'][0].path.replace(/\\/g, '/') : product.hinh3;
        const image4 = req.files['image4'] ? req.files['image4'][0].path.replace(/\\/g, '/') : product.hinh4;

        /*  const image1 = req.files['image1'][0].path.replace(/\\/g, '/');
         const image2 = req.files['image2'][0].path.replace(/\\/g, '/');
         const image3 = req.files['image3'][0].path.replace(/\\/g, '/');
         const image4 = req.files['image4'][0].path.replace(/\\/g, '/'); */

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

        // Create a new product in the database
        if (KhuyenMaiId == 0) {
            await SanPham.update({
                id: id,
                ten: ten,
                giaTien: giaTien,
                gioiTinh: gioiTinh,
                MauSacId: MauSacId,
                ChatLieuId: ChatLieuId,
                soLuongM: soLuongM,
                soLuongL: soLuongL,
                soLuongXL: soLuongXL,
                moTa: moTa,
                TheLoaiId: TheLoaiId,
                KieuDangId: KieuDangId,
                hinh: image1,
                hinh2: image2,
                hinh3: image3,
                hinh4: image4,
                KhuyenMaiId: null,
                ThuongHieuId: ThuongHieuId,
                giaGiam: giaGiam,
                trangThai: trangThai,
            }, { where: { id: id } });

        }
        else {
            await SanPham.update({
                id: id,
                ten: ten,
                giaTien: giaTien,
                gioiTinh: gioiTinh,
                MauSacId: MauSacId,
                ChatLieuId: ChatLieuId,
                soLuongM: soLuongM,
                soLuongL: soLuongL,
                soLuongXL: soLuongXL,
                moTa: moTa,
                TheLoaiId: TheLoaiId,
                KieuDangId: KieuDangId,
                hinh: image1,
                hinh2: image2,
                hinh3: image3,
                hinh4: image4,
                KhuyenMaiId: KhuyenMaiId,
                ThuongHieuId: ThuongHieuId,
                giaGiam: giaGiam,
                trangThai: trangThai,
            }, { where: { id: id } });

        }
        res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

//delete  product
router.delete('/delete-product', adminAuth, (req, res) => {
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

//update status product 
router.put('/upload-status/:id', adminAuth, async (req, res) => {
    try {
        const id = req.params.id
        const { trangThai } = req.body;
        // Create a new product in the database
        await SanPham.update({
            trangThai: trangThai,
        }, { where: { id: id } });
        res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

//TÌm kiếm theo tên sản phẩm
router.post('/search/:slug', adminAuth, async (req, res) => {
    const slug = req.params.slug;
    const { title, id } = req.body;
    let productList = await SanPham.findAll({
        include: [
            {
                model: KhuyenMai,
            },
            {
                model: TheLoai
            },
            {
                model: ThuongHieu
            },
            {
                model: MauSac
            },
            {
                model: ChatLieu
            }
        ]
    });
    if (slug != 0 && slug.trim() !== '') {
        productList = productList.filter(product =>
            product.ten.toLowerCase().includes(slug.toLowerCase())
        );
    }
    if (title === 1) {
        productList = productList.filter(product =>
            product.TheLoaiId === id
        );
    }
    if (title === 2) {
        productList = productList.filter(product =>
            product.ThuongHieuId === id
        );
    }
    if (title === 3) {
        productList = productList.filter(product =>
            product.MauSacId === id
        );
    }
    if (title === 4) {
        productList = productList.filter(product =>
            product.ChatLieuId === id
        );
    }
    return res.json({ status: 200, products: productList });

});


module.exports = router;