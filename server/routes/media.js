const express = require('express');
const ctrl = require('../controllers/mediaController');

const router = express.Router();

router.get('/', ctrl.getMedia);
router.get('/summary', ctrl.getSummary);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;

