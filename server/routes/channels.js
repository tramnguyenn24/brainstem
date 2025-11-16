const express = require('express');
const ctrl = require('../controllers/channelsController');

const router = express.Router();

router.get('/', ctrl.getChannels);
router.get('/summary', ctrl.getSummary);
router.get('/:id', ctrl.getById);
router.get('/:id/campaigns', ctrl.getCampaigns);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;


