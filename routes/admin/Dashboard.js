const express = require('express')
const router = express.Router()
const { DonHang, ChiTietDonHang, SanPham } = require('../../models');
const { Op, Sequelize } = require('sequelize');
const { adminAuth } = require('../../middlewares/AuthAdmin');
router.get('/show-all/:year', adminAuth, async (req, res) => {
  try {
    const year = req.params.year
    const condition = year ? { giaoHang: 1, createdAt: { [Op.gte]: `${year}-01-01`, [Op.lte]: `${year}-12-31` } } : { giaoHang: 1 };
    console.log(condition)

    const totalSalesByMonth = await DonHang.findAll({
      attributes: [
        [Sequelize.fn('YEAR', Sequelize.col('createdAt')), 'year'],
        [Sequelize.fn('MONTH', Sequelize.col('createdAt')), 'month'],
        [
          Sequelize.fn('SUM', Sequelize.col('tongTien')),
          'price',
        ],
      ],
      where: condition,
      group: ['year', 'month'],
    });

    res.status(200).json({ totalSalesByMonth });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/years', adminAuth, async (req, res) => {
  try {
    const distinctYears = await DonHang.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.fn('YEAR', Sequelize.col('createdAt'))), 'year'],
      ],
    });
    console.log(distinctYears)

    const years = distinctYears.map((item) => item.dataValues.year);

    res.status(200).json({ years });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.get('/revenue', adminAuth, async (req, res) => {
  try {
    const totalSalesByYear = await DonHang.findAll({
      attributes: [
        [Sequelize.fn('YEAR', Sequelize.col('createdAt')), 'year'],
        [
          Sequelize.fn('SUM', Sequelize.col('tongTien')),
          'totalSales',
        ],
      ],
      where: { giaoHang: 1 },
      group: ['year'],
    });

    res.status(200).json({ totalSalesByYear });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/products/bestseller', async (req, res) => {
  /*  try {
     const bestSellerProducts = await DonHang.findAll({
       where: { giaoHang: 1 },
       order: [['tongTien', 'DESC']],
       limit: 2,
       attributes: ['id'],
     });
     const chitietdon = await ChiTietDonHang.findAll();
     const sanphamId = []
     for (let i = 0; i < chitietdon.length; i++) {
       for (let j = 0; j < bestSellerProducts.length; j++) {
         console.log(chitietdon[i].id)
         console.log(bestSellerProducts[j].id)
         if (bestSellerProducts[j].id == chitietdon[i].DonHangId) {
           sanphamId.push(chitietdon[i]);
           console.log(chitietdon[i])
         }
       }
     } */
  try {
    /*  const bestSellerProducts = await ChiTietDonHang.findAll({
       include: [{
         model: DonHang,
         where: { giaoHang: 1 },
       },{
         model:SanPham
       }],
       limit: 1,
       order: [['SanPhamId', 'DESC']],
     }); */
    const bestSellerProducts = await ChiTietDonHang.findAll({
      where: {
        '$DonHang.giaoHang$': 1
      },
      attributes: ['SanPhamId', [Sequelize.fn('COUNT', Sequelize.col('SanPhamId')), 'count']],
      include: [{
        model: DonHang,
        as: 'DonHang',
        where: { giaoHang: 1 },
        attributes: [],
      }, { model: SanPham }],
      group: ['SanPhamId'],
      order: [[Sequelize.literal('count'), 'DESC']],
      limit: 1,
    });
    const product = await SanPham.findAll();
    res.json({ bestSellerProducts: bestSellerProducts, product: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }

})




module.exports = router;
