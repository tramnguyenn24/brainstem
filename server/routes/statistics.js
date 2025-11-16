const express = require('express');
const ctrl = require('../controllers/statisticsController');

const router = express.Router();

router.get('/revenue', ctrl.getRevenue);
router.get('/revenue/export', ctrl.downloadRevenueExport);
router.get('/dashboard', ctrl.getDashboardStats);
router.get('/', ctrl.getStatistics);

module.exports = router;

