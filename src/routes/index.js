const router = require('express').Router();

// routes
router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;