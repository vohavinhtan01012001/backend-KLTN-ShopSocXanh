const express = require('express')
const router = express.Router()
const { DonHang } = require('../../models');
const { Op, Sequelize } = require('sequelize');
router.get('/show-all/:year', async (req, res) => {
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
          'Doanh thu',
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

router.get('/years', async (req, res) => {
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
router.get('/revenue', async (req, res) => {
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



module.exports = router;
