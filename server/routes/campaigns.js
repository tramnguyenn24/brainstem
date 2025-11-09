const express = require('express');
const ctrl = require('../controllers/campaignsController');

const router = express.Router();

router.get('/', ctrl.getCampaigns);
router.get('/summary', ctrl.getSummary);
router.get('/:id', ctrl.getById);
router.get('/:id/details', ctrl.getCampaignDetails);
router.get('/:id/metrics', ctrl.getMetrics);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;


