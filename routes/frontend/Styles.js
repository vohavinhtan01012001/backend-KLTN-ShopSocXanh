const express = require('express')
const router = express.Router()
const { KieuDang } = require('../../models');

//show all styles
router.get('/show-all', async (req, res) => {
    const styles = await KieuDang.findAll();
    try {
        res.status(200).json({ styles: styles })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router;
