const express = require('express')
const router = express.Router()
const { Op } = require('sequelize');
const { SanPham, TheLoai, KhuyenMai, YeuThich, ThuongHieu, MauSac, ChatLieu } = require('../../models');
const { validateToken } = require('../../middlewares/AuthMiddleware');

router.get("/show-all", async (req, res) => {
    const products = await SanPham.findAll({ include: [{ model: TheLoai }, { model: KhuyenMai }], where: { trangThai: 1 } });
    if (products) {
        res.json({ products: products, status: 200 })
    }
    else {
        res.json({ status: 400 })
    }
})

router.get("/category/:slug", async (req, res) => {
    const categoryName = req.params.slug
    try {
        const category = await TheLoai.findOne({ where: { ten: categoryName } })
        const products = await SanPham.findAll({ include: [{ model: TheLoai }, { model: KhuyenMai }], where: { TheLoaiId: category.id, trangThai: 1 } });
        if (products) {
            res.json({ products: products, status: 200 })
        }
        else {
            res.json({ status: 400 })
        }
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get("/categoryList/:slug", async (req, res) => {
    const slug = req.params.slug;
    try {
        const category = await TheLoai.findOne({ where: { ten: slug } });
        if (category) {
            const product = await SanPham.findAll({ include: [{ model: TheLoai }, { model: KhuyenMai }], where: { TheLoaiId: category.id, trangThai: 1 } })
            res.status(200).json({ products: product, categories: category })
        }
    }
    catch (err) {
        res.status(500).json({ message: "Lỗi server" })
    }

})

router.get("/viewproductdetail/:category_slug/:product_slug", async (req, res) => {
    const category_slug = req.params.category_slug
    const product_slug = req.params.product_slug

    const category = await TheLoai.findOne({ where: { ten: category_slug } });
    try {
        if (category) {
            const product = await SanPham.findOne({ include: [{ model: TheLoai }, { model: KhuyenMai }], where: { TheLoaiId: category.id, id: product_slug, trangThai: 1 } })
            res.status(200).json({ products: product })
        }
    }
    catch (err) {
        res.status(500).json({ message: "Lỗi server" })
    }

})


router.get("/favourite", validateToken, async (req, res) => {
    const user = req.user;
    const like = await YeuThich.findAll({ where: { NguoiDungId: user.id } });
    console.log(like)
    try {
        const productList = await Promise.all(like.map(async (item) => {
            const pro = (await SanPham.findAll({ include: [{ model: TheLoai }, { model: KhuyenMai }], where: { id: item.SanPhamId } }));
            return pro[0]
        }));
        res.json({ status: 200, productList: productList })
    }
    catch (err) {
        res.status(500).json({ message: "Lỗi server" })
    }

})


//TÌm kiếm theo tên sản phẩm
router.get('/search/:slug', async (req, res) => {
    const slug = req.params.slug;

    const productList = await SanPham.findAll({
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
    let results = ''
    if (slug && slug.trim() !== '') {
        results = productList.filter(product =>
            product.ten.toLowerCase().includes(slug.toLowerCase())
        );
        return res.json({ status: 200, products: results });
    }
});



module.exports = router;