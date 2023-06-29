/* const express = require('express');
const crypto = require('crypto');

const router = express.Router();

const vnp_TmnCode = 'UD2KZW06'; // Mã website của bạn tại VNPay
const vnp_HashSecret = 'HUQJSLMKGFXYCNYOWXBBEYDADEGNMOBB'; // Hash secret của bạn tại VNPay
const vnp_ReturnUrl = 'https://sell.sawbrokers.com/domain/your-website.com/'; // URL callback của bạn

// Hàm tạo chuỗi hash dựa trên các thông tin thanh toán
function createHash(params) {
    const sortedKeys = Object.keys(params).sort();
    let hashData = '';

    sortedKeys.forEach((key) => {
        hashData += `${key}=${params[key]}&`;
    });

    hashData += vnp_HashSecret;

    const hash = crypto.createHash('sha256').update(hashData).digest('hex');
    return hash;
}

// Hàm tạo URL thanh toán
function createPaymentUrl(orderId, amount) {
    const vnp_Params = {
        vnp_Version: '2',
        vnp_Command: 'pay',
        vnp_TmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: 'Description of the order',
        vnp_OrderType: 'billpayment',
        vnp_Amount: amount * 100,
        vnp_ReturnUrl,
    };

    vnp_Params.vnp_Hash = createHash(vnp_Params);

    const paymentUrl = 'http://sandbox.vnpayment.vn/paymentv2/vpcpay.html?' + new URLSearchParams(vnp_Params).toString();
    return paymentUrl;
}

// Xử lý callback từ VNPay
router.get('/payment-callback', (req, res) => {
    res.sendStatus(200);
});
router.get('/create-payment', (req, res) => {
    // Lấy thông tin orderId và amount từ request query
    const { orderId, amount } = req.query;

    // Tạo URL thanh toán
    const paymentUrl = createPaymentUrl(orderId, amount);
    
    // Trả về URL thanh toán cho client
    res.json({ paymentUrl });
});


module.exports = router; */

const express = require('express')
const router = express.Router()
const crypto = require('crypto');
const { validateToken } = require('../../middlewares/AuthMiddleware');
const { DonHang, ChiTietDonHang, GioHang, SanPham, NguoiDung } = require('../../models');
const url = require('url');
const querystring = require('qs');

router.get('/vn_payment', validateToken, async (req, res) => {
    const user = req.user;
    const cart = await GioHang.findAll({
        include: [
            {
                model: NguoiDung
            },
            {
                model: SanPham
            }
        ], where: { NguoiDungId: user.id }
    })
    let sumPriceOrder = 0;
    for (const item of cart) {
        const { SanPhamId, soLuongSP, kichThuoc, SanPham } = item;

        let sumPrice;
        if (kichThuoc === 'M') {
            sumPrice = SanPham.giaGiam * soLuongSP

        } else if (kichThuoc === 'L') {
            sumPrice = SanPham.giaGiam * soLuongSP

        } else if (kichThuoc === 'XL') {
            sumPrice = SanPham.giaGiam * soLuongSP
        }
        sumPriceOrder += sumPrice;
    }
    sumPriceOrder += 30000;
    console.log(sumPriceOrder)
    let id = Math.floor(Math.random() * 10000).toString();
    let vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    let vnp_Returnurl = "http://localhost:3000/vnpay"
    let vnp_TmnCode = 'XON1ZD67'; // Mã website tại VNPAY
    let vnp_HashSecret = 'OQFALEJEIXFMSSFSQYFEYUUBHCNQYLNM'; // Chuỗi bí mật

    let vnp_TxnRef = id // Mã đơn hàng
    let vnp_OrderInfo = 'Thanh toan don hang test';
    let vnp_OrderType = 'billpayment';
    let vnp_Amount = Math.round(sumPriceOrder * 100);
    let vnp_Locale = 'vn';
    let vnp_BankCode = 'NCB';
    let vnp_IpAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    let currentDate = new Date();
    let year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, '0');
    let day = String(currentDate.getDate()).padStart(2, '0');
    let hours = String(currentDate.getHours()).padStart(2, '0');
    let minutes = String(currentDate.getMinutes()).padStart(2, '0');
    let seconds = String(currentDate.getSeconds()).padStart(2, '0');

    let vnp_CreateDate = `${year}${month}${day}${hours}${minutes}${seconds}`;

    let inputData = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: vnp_TmnCode,
        vnp_Locale: vnp_Locale,
        vnp_CurrCode: 'VND',
        vnp_TxnRef: vnp_TxnRef,
        vnp_OrderInfo: vnp_OrderInfo,
        vnp_OrderType: 'other',
        vnp_Amount: vnp_Amount,
        vnp_ReturnUrl: vnp_Returnurl,
        vnp_IpAddr: vnp_IpAddr,
        vnp_CreateDate: vnp_CreateDate,
    };

    if (vnp_BankCode !== null && vnp_BankCode !== '') {
        inputData.vnp_BankCode = vnp_BankCode;
    }

    inputData = sortObject(inputData);

    let signData = querystring.stringify(inputData, { encode: false });
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
    inputData['vnp_SecureHash'] = signed;
    vnp_Url += '?' + querystring.stringify(inputData, { encode: false });

    res.json(vnp_Url)
});

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}


router.get('/vnpay_return', function (req, res, next) {
    let vnp_Params = req.query;

    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let tmnCode = 'XON1ZD67';
    let secretKey = 'OQFALEJEIXFMSSFSQYFEYUUBHCNQYLNM';

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

        res.json('success', { code: vnp_Params['vnp_ResponseCode'] })
    } else {
        res.json('success', { code: '97' })
    }
});

function getQueryParamValues(queryString) {
    const paramsArray = queryString.split('&');
    const values = {};

    paramsArray.forEach(param => {
        const [key, value] = param.split('=');
        values[key] = decodeURIComponent(value);
    });

    return values;
}

router.post('/vnpay_ipn', async function (req, res, next) {
    const secureHash = req.body.vnp_secureHash;
    let vnp_Params = getQueryParamValues(req.body.vnp_Params);

    let orderId = vnp_Params['vnp_TxnRef'];
    let rspCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];
    vnp_Params = sortObject(vnp_Params);

    let secretKey = "OQFALEJEIXFMSSFSQYFEYUUBHCNQYLNM";
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
    let paymentStatus = '0'; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
    //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
    //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

    let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
    let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
    console.log("secureHash",secureHash);
    console.log("signed",signed);
    if (secureHash == signed) { //kiểm tra checksum
        if (checkOrderId) {
            if (checkAmount) {
                if (paymentStatus == "0") { //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
                    if (rspCode == "00") {
                        //thanh cong
                        //paymentStatus = '1'
                        // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
                        res.status(200).json({ RspCode: '00', Message: 'Success' })
                    }
                    else {
                        //that bai
                        //paymentStatus = '2'
                        // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
                        res.status(200).json({ RspCode: '01', Message: 'Success' })
                    }
                }
                else {
                    res.status(200).json({ RspCode: '02', Message: 'This order has been updated to the payment status' })
                }
            }
            else {
                res.status(200).json({ RspCode: '04', Message: 'Amount invalid' })
            }
        }
        else {
            res.status(200).json({ RspCode: '01', Message: 'Order not found' })
        }
    }
    else {
        res.status(200).json({ RspCode: '97', Message: 'Checksum failed' })
    }
});

module.exports = router;