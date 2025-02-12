const express = require("express");
const { getAllCourses, getCourseId } = require('../controllers/CourseController')
const router = express.Router()

router.get('/all', getAllCourses);
router.get('/:id', getCourseId)
module.exports = router;