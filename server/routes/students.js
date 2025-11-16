const express = require('express');
const ctrl = require('../controllers/studentsController');

const router = express.Router();

router.get('/', ctrl.getStudents);
router.get('/summary', ctrl.getStudentSummary);
router.get('/recent-enrollments', ctrl.getRecentEnrollments);
router.get('/:id', ctrl.getStudentById);
router.post('/', ctrl.createStudent);
router.put('/:id', ctrl.updateStudent);
router.delete('/:id', ctrl.deleteStudent);

module.exports = router;


