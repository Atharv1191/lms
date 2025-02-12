const express = require('express')

const {updateRoleToEducator,AddCourse, getEducatorCourse, educatorDashboardData, getEnrolledStudentsData} = require('../controllers/educatorController');
const upload = require('../configs/multer');
const protectEducator = require('../middeleweres/AuthMiddelewere');

const router = express.Router()

//add educator role

router.get('/update-role',updateRoleToEducator);
router.post('/add-course',upload.single('image'),protectEducator,AddCourse)
router.get('/courses',protectEducator,getEducatorCourse)
router.get('/dashboard',protectEducator,educatorDashboardData),
router.get('/enrolled-students',protectEducator,getEnrolledStudentsData)
module.exports = router;