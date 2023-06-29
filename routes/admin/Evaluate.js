const express = require('express')
const router = express.Router()
const { DanhGia, SanPham } = require('../../models');

router.get('/evaluate', async (req, res) => {
    const page = req.query.page || 1; // Trang hiện tại (mặc định là 1)
    const limit = req.query.limit || 5; // Số lượng phần tử trên mỗi trang (mặc định là 5)

    try {
        const evaluates = await DanhGia.findAll();
        const products = await SanPham.findAll();

        const startIndex = (page - 1) * limit; // Chỉ số bắt đầu của phần tử trên trang hiện tại
        const endIndex = page * limit; // Chỉ số kết thúc của phần tử trên trang hiện tại
        const totalItems = evaluates.length; // Tổng số phần tử evaluate

        let evaluate = [];
        for (let i = 0; i < products.length; i++) {
            let sumEvaluate = 0;
            let count = 0;
            for (let j = 0; j < evaluates.length; j++) {
                if (evaluates[j].SanPhamId === products[i].id) {
                    sumEvaluate += evaluates[j].danhGia;
                    count++;
                }
            }
            if (count > 0) {
                sumEvaluate = sumEvaluate / count;
            }
            else {
                sumEvaluate = 0;
            }
            evaluate.push({ evaluate: parseFloat(sumEvaluate.toFixed(1)), productId: products[i].id, productName: products[i].ten });
        }

        const paginatedEvaluate = evaluate.slice(startIndex, endIndex); // Các phần tử evaluate trên trang hiện tại

        res.json({
            status: 200,
            evaluate: paginatedEvaluate,
            evaluateLength: evaluate.length,
        });
    } catch (e) {
        res.status(500).json({ error: e.error })
    }
})

module.exports = router;
