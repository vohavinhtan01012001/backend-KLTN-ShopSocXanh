const express = require('express')
const router = express.Router()
const { TheLoai } = require('../../models');

router.get("/", async (req, res) => {
    const categories = await TheLoai.findAll();
    res.json(categories)
})
module.exports = router;