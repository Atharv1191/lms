const express = require('express')
const { getUserData, getUserEnrolledCourses, purchaseCourse, updateUserCourseProgress, getUserCourseProgress, addUserRating } = require('../controllers/userController')

const router = express.Router()

router.get('/data',getUserData);
router.get('/enrolled-courses',getUserEnrolledCourses)
router.post('/purchase',purchaseCourse)
router.post('/update-course-progress',updateUserCourseProgress)
router.post('/get-course-progress',getUserCourseProgress)
router.post('/add-rating', addUserRating)
module.exports = router;