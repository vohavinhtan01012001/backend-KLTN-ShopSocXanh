const express = require('express');
const app = express();
const db = require('./models');
const cors = require('cors');
const multer = require('multer');


app.use(express.json());
app.use(cors());


app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/uploads', express.static('uploads'));
//Category
const categoryRouter = require('./routes/frontend/Categories');
app.use("/category", categoryRouter);

//AdminCategory
const adminCategoryRouter = require('./routes/admin/Categories');
app.use("/admin-category", adminCategoryRouter);

//AdminProduct
const adminProductRouter = require('./routes/admin/Products');
app.use("/admin-product", adminProductRouter);

//Product
const productRouter = require('./routes/frontend/Products');
app.use("/product", productRouter);

//Auth
const authRouter = require('./routes/auth/User');
app.use("/auth", authRouter);

db.sequelize.sync().then(() => {
    app.listen(4000, () => {
        console.log("listening on port 4000");
    });
})

