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

//AdminCategory
const adminCategoryRouter = require('./routes/admin/Categories');
app.use("/admin-category", adminCategoryRouter);

//AdminProduct
const adminProductRouter = require('./routes/admin/Products');
app.use("/admin-product", adminProductRouter);

//AdminPromotion
const adminPromotionRouter = require('./routes/admin/Promotions');
app.use("/admin-promotion", adminPromotionRouter);

//AdminTrademark
const adminTrademarkRouter = require('./routes/admin/Trademarks');
app.use("/admin-trademark", adminTrademarkRouter);

//Auth
const authRouter = require('./routes/auth/User');
app.use("/auth", authRouter);

db.sequelize.sync().then(() => {
    app.listen(4000, () => {
        console.log("listening on port 4000");
    });
})

