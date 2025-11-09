const express = require('express');
const ctrl = require('../controllers/coursesController');

const router = express.Router();

router.get('/', ctrl.getCourses);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;

