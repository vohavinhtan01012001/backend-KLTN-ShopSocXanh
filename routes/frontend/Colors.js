const express = require('express')
const router = express.Router()
const { MauSac } = require('../../models');

//show all colors
router.get('/show-all', async (req, res) => {
    const colors = await MauSac.findAll();
    try {
        res.status(200).json({ colors: colors })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router;
