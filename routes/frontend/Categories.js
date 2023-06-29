const express = require('express')
const router = express.Router()
const { TheLoai } = require('../../models');

router.get("/", async (req, res) => {
    const categories = await TheLoai.findAll();
    res.json(categories)
})


//show all categories
router.get('/show-all', async (req, res) => {
    const categories = await TheLoai.findAll();
    try {
        res.status(200).json({ categories: categories })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})



module.exports = router;