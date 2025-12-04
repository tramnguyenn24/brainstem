const express = require('express');
const ctrl = require('../controllers/leadsController');

const router = express.Router();

router.get('/check-phone', ctrl.checkPhone);
router.get('/', ctrl.getLeads);
router.get('/summary', ctrl.getLeadSummary);
router.get('/:id', ctrl.getLeadById);
router.post('/', ctrl.createLead);
router.put('/:id', ctrl.updateLead);
router.delete('/:id', ctrl.deleteLead);
router.post('/:id/convert', ctrl.convertLead);

module.exports = router;


