const express = require('express');
const ctrl = require('../controllers/channelsController');

const router = express.Router();

router.get('/', ctrl.getChannels);
router.get('/summary', ctrl.getSummary);
router.get('/:id', ctrl.getById);
router.get('/:id/campaigns', ctrl.getCampaigns);

module.exports = router;


