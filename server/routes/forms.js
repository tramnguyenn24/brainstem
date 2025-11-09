const express = require('express');
const ctrl = require('../controllers/formsController');

const router = express.Router();

router.get('/', ctrl.getForms);
router.get('/:id', ctrl.getById);
router.get('/:id/embed', ctrl.getEmbed);
router.post('/', ctrl.create);
router.post('/:id/submit', ctrl.submitForm);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;


