const { clerkClient } = require('@clerk/express');
const Course = require('../models/Course');
const Purchase = require('../models/Purchase');
const cloudinary = require("cloudinary").v2;
const User = require('../models/User');

// Update user role to educator
const updateRoleToEducator = async (req, res) => {
    try {
        const userId = req.auth.userId;
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator',
            }
        });
        res.json({
            success: true,
            message: "You can publish a course now"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add New Course
const AddCourse = async (req, res) => {
    try {
      const {courseData} = req.body;
      const imageFile = req.file;
      const educatorId = req.auth.userId;
  
      if (!imageFile) {
        return res.status(400).json({
          success: false,
          message: "Course thumbnail is required"
        });
      }
  
      const parsedCourseData = JSON.parse(courseData);
      console.log("Parsed course data:", parsedCourseData); // Log parsed course data
      parsedCourseData.educator = educatorId;
  
      parsedCourseData.courseContent.forEach((chapter, index) => {
        chapter.chapterContent.forEach((lecture) => {
          if (!lecture.lectureId || !lecture.lectureOrder) {
            console.log("Lecture missing lectureId or lectureOrder:", lecture); // Log missing lecture details
          }
        });
      });
  
      const newCourse = await Course.create(parsedCourseData);
      const imageUpload = await cloudinary.uploader.upload(imageFile.path);
      newCourse.courseThumbnail = imageUpload.secure_url;
      
      await newCourse.save();
      res.json({
        success: true,
        message: "Course added successfully",
      });
    } catch (error) {
      console.error("Error adding course:", error.message);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  






// Get Educator Courses
const getEducatorCourse = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });
        return res.status(200).json({
            success: true,
            courses
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Educator Dashboard Data
const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.auth.userId;

        const courses = await Course.find({ educator });

        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);

        // Calculate total earnings from purchases
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

        // Collect unique enrolled student IDs with their course titles
        const enrolledStudentsData = [];
        for (const course of courses) {
            const students = await User.find({
                _id: { $in: course.enrolledStudents }
            }, 'name imageUrl');

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }

        res.json({
            success: true,
            dashboardData: {
                totalEarnings,
                enrolledStudentsData,
                totalCourses
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.auth?.userId;
        if (!educator) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        // Check if courses are retrieved properly
        const courses = await Course.find({ educator });
        console.log("Educator ID:", educator);
        console.log("Found Courses:", courses);

        const courseIds = courses.map(course => course._id);
        if (!courseIds.length) {
            return res.status(404).json({
                success: false,
                message: "No courses found for this educator"
            });
        }

        // Check if purchases are retrieved correctly
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');
        console.log("Populated Purchases: ", purchases);

        if (!purchases.length) {
            return res.status(404).json({
                success: false,
                message: "No purchases found for these courses"
            });
        }

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));

        return res.status(200).json({
            success: true,
            enrolledStudents
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



module.exports = {
    updateRoleToEducator,
    AddCourse,
    getEducatorCourse,
    educatorDashboardData,
    getEnrolledStudentsData
};
