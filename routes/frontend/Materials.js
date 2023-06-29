const express = require('express')
const router = express.Router()
const { ChatLieu } = require('../../models');


//show all materials
router.get('/show-all', async (req, res) => {
    const materials = await ChatLieu.findAll();
    try {
        res.status(200).json({ materials: materials })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router;