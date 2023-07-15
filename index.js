const express = require('express');
const app = express();
const db = require('./models');
const cors = require('cors');
const multer = require('multer');


app.use(express.json());
app.use(cors());
//Upload images 
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));


//Category
const categoryRouter = require('./routes/frontend/Categories');
app.use("/category", categoryRouter);

//Product
const productRouter = require('./routes/frontend/Products');
app.use("/product", productRouter);

//cart
const cartRouter = require('./routes/frontend/Cart');
app.use("/cart", cartRouter);

//order
const orderRouter = require('./routes/frontend/Order');
app.use("/order", orderRouter);

//material
const materialRouter = require('./routes/frontend/Materials');
app.use("/marterial", materialRouter);

//color
const colorRouter = require('./routes/frontend/Colors');
app.use("/color", colorRouter);

//style
const styleRouter = require('./routes/frontend/Styles');
app.use("/style", styleRouter);


//favourite
const favouriteRouter = require('./routes/frontend/Favourite');
app.use("/favourite", favouriteRouter);


//evaluate
const evaluateRouter = require('./routes/frontend/Evaluate');
app.use("/evaluate", evaluateRouter);

//trademarks
const trademarkRouter = require('./routes/frontend/Trademarks');
app.use("/trademark", trademarkRouter);

//comment
const commentRouter = require('./routes/frontend/Comment');
app.use("/comment", commentRouter);

//comment2
const comment2Router = require('./routes/frontend/Comment2');
app.use("/comment2", comment2Router);

//comment2
const likeRouter = require('./routes/frontend/Like');
app.use("/icon", likeRouter);

//AdminEvaluate
const adminEvaluateRouter = require('./routes/admin/Evaluate');
app.use("/admin-evaluate", adminEvaluateRouter);

//AdminCategory
const adminCategoryRouter = require('./routes/admin/Categories');
app.use("/admin-category", adminCategoryRouter);

//AdminProduct
const adminProductRouter = require('./routes/admin/Products');
app.use("/admin-product", adminProductRouter);

//AdminColor
const adminColorRouter = require('./routes/admin/Colors');
app.use("/admin-color", adminColorRouter);

//adminStyle
const adminStyleRouter = require('./routes/admin/Styles');
app.use("/admin-style", adminStyleRouter);

//AdminColor
const adminMaterialRouter = require('./routes/admin/Materials');
app.use("/admin-material", adminMaterialRouter);

//AdminPromotion
const adminPromotionRouter = require('./routes/admin/Promotions');
app.use("/admin-promotion", adminPromotionRouter);

//AdminTrademark
const adminTrademarkRouter = require('./routes/admin/Trademarks');
app.use("/admin-trademark", adminTrademarkRouter);


//AdminPermission
const adminPermissionRouter = require('./routes/admin/Permissions');
app.use("/admin-permission", adminPermissionRouter);


//AdminOrder
const adminOrderRouter = require('./routes/admin/Orders');
app.use("/admin-order", adminOrderRouter);

//AdminDashboard
const adminDashboardRouter = require('./routes/admin/Dashboard');
app.use("/admin-dashboard", adminDashboardRouter);

//VNPay
const vnpayRouter = require('./routes/admin/Vnpay');
app.use("/vnpay", vnpayRouter);


//Auth
const authRouter = require('./routes/auth/User');
app.use("/auth", authRouter);

db.sequelize.sync().then(() => {
    app.listen(4000, () => {
        console.log("listening on port 4000");
    });
})

