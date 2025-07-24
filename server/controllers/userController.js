require("dotenv").config();
const Course = require("../models/Course.js");
const  CourseProgress  = require("../models/CourseProgress.js");
const Purchase  = require("../models/Purchase.js");
const User = require("../models/User.js");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get User Data
const getUserData = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User Not Found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Purchase Course
const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth?.userId;

    console.log("Auth:", req.auth);
    console.log("User ID:", userId);
    console.log("Course ID:", courseId);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: userId not found in auth.' });
    }

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Bad Request: courseId is required.' });
    }

    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const courseData = await Course.findById(courseId);
    if (!courseData) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const amount = (courseData.coursePrice - (courseData.discount * courseData.coursePrice / 100)).toFixed(2);

    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount,
    };

    const newPurchase = await Purchase.create(purchaseData);

    const currency = process.env.CURRENCY?.toLowerCase() || 'inr';

    const line_items = [{
      price_data: {
        currency,
        product_data: {
          name: courseData.courseTitle
        },
        unit_amount: Math.floor(newPurchase.amount * 100)
      },
      quantity: 1
    }];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      line_items,
      mode: 'payment',
      metadata: {
        purchaseId: newPurchase._id.toString()
      }
    });

    res.json({ success: true, session_url: session.url });

  } catch (error) {
    console.error("Purchase Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Users Enrolled Courses With Lecture Links
const getUserEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth.userId;

        const userData = await User.findById(userId).populate('enrolledCourses');

        res.json({ success: true, enrolledCourses: userData.enrolledCourses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update User Course Progress
const updateUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { courseId, lectureId } = req.body;

        const progressData = await CourseProgress.findOne({ userId, courseId });

        if (progressData) {
            if (progressData.lectureCompleted.includes(lectureId)) {
                return res.json({ success: true, message: 'Lecture Already Completed' });
            }

            progressData.lectureCompleted.push(lectureId);
            await progressData.save();
        } else {
            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            });
        }

        res.json({ success: true, message: 'Progress Updated' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get User Course Progress
const getUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { courseId } = req.body;

        const progressData = await CourseProgress.findOne({ userId, courseId });

        res.json({ success: true, progressData });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Add User Ratings to Course
const addUserRating = async (req, res) => {
    const userId = req.auth.userId;
    const { courseId, rating } = req.body;

    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.json({ success: false, message: 'Invalid Details' });
    }

    try {
        const course = await Course.findById(courseId);

        if (!course) {
            return res.json({ success: false, message: 'Course not found.' });
        }

        const user = await User.findById(userId);

        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: 'User has not purchased this course.' });
        }

        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId.toString() === userId);

        if (existingRatingIndex > -1) {
            course.courseRatings[existingRatingIndex].rating = rating;
        } else {
            course.courseRatings.push({ userId, rating });
        }

        await course.save();

        return res.json({ success: true, message: 'Rating added' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

module.exports = {
    getUserData,
    getUserEnrolledCourses,
    purchaseCourse,
    updateUserCourseProgress,
    getUserCourseProgress,
    addUserRating
};
