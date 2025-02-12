const express = require('express')
const { getUserData, getUserEnrolledCourses, purchaseCourse } = require('../controllers/userController')

const router = express.Router()

router.get('/data',getUserData);
router.get('/enrolled-courses',getUserEnrolledCourses)
router.post('/purchase',purchaseCourse)
module.exports = router;