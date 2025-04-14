const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const question = req.query.question || "Bienvenue";
    res.json({ response: "Bienvenue sur notre API !" });
});

module.exports = router;
