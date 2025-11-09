const express = require('express');
const ctrl = require('../controllers/staffController');

const router = express.Router();

router.get('/', ctrl.getStaff);
router.get('/summary', ctrl.getSummary);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/assign-campaigns', ctrl.assignCampaigns);

module.exports = router;


