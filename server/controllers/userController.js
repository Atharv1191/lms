const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const Purchase = require("../models/Purchase");
const User = require("../models/User");
const Stripe = require('stripe')

const getUserData = async(req,res)=>{
    try{
        const userId = req.auth.userId;
        const user = await User.findById(userId)

        if(!user){
            return res.status(404).json({
                success:fasle,
                message:"User not found"
            })
        }
        return res.status(200).json({
            success:true,
            user
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }

}
//user enrolled courses with lecture link
const getUserEnrolledCourses = async(req,res)=>{
    try{
        const userId = req.auth.userId;
        const userData = await User.findById(userId).populate('enrolledCourses')
        return res.status(200).json({
            success:true,
            enrolledCourses:userData.enrolledCourses
        })

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
//purchase Course
// const purchaseCourse = async(req,res)=>{
//     try{
//         const {courseId} = req.body;
//         const {origin} = req.headers
//         const userId = req.auth.userId
//         const userData = await User.findById(userId);
//         const courseData = await Course.findById(courseId);
//         if(!userId || !courseData){
//             return res.status(404).json({
//                 success:false,
//                 message:"data Not found"
//             })
//         }
//         const purchaseData = {
//             courseId:courseData._id,
//             userId,
//             amount:(courseData.coursePrice - courseData.discount*courseData.coursePrice/100).toFixed(2)
//         }
//         const newPurchase = await Purchase.create(purchaseData );
//         //Stripe getway initialize
//         const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
//         const currency = process.env.CURRENCY.toLowerCase();
//         //creating line items for stripes
//         const line_items = [{
//             price_data:{
//                 currency,
//                 product_data:{
//                     name: courseData.courseTitle
//                 },
//                 unit_amount: Math.floor(newPurchase.amount) *100
//             },
//             quantity:1
//         }]
//         //stripe session
//         const session = await stripeInstance.sessions.create({
//             success_url:`${origin}/loading/my-enrollments`,
//             cancel_url:`${origin}/`,
//             line_items:line_items,
//             mode:"payment",
//             metaData:{
//                 purchaseId:newPurchase._id.toString()
//             }
//         })
//         return res.status(200).json({
//             success:true,
//             session_url:session.url
//         })
//     } catch(error){
//         console.log(error);
//         return res.status(500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }


const purchaseCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const { origin } = req.headers;
        const userId = req.auth?.userId; // Safely access userId
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        const userData = await User.findById(userId);
        const courseData = await Course.findById(courseId);

        if (!courseData) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: ((courseData.coursePrice - (courseData.discount * courseData.coursePrice / 100))).toFixed(2)
        };

        const newPurchase = await Purchase.create(purchaseData);

        // Stripe gateway initialization
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
        const currency = process.env.CURRENCY.toLowerCase();

        // Creating line items for Stripe
        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.round(newPurchase.amount * 100) // Correctly calculate amount in smallest currency unit
            },
            quantity: 1
        }];

        // Creating Stripe session
        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: "payment",
            metadata: { // Correct key is 'metadata'
                purchaseId: newPurchase._id.toString()
            }
        });

        return res.status(200).json({
            success: true,
            session_url: session.url
        });
    } catch (error) {
        console.error("Stripe error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create purchase session",
            error: error.message
        });
    }
};
//update User Course Progress
const updateUserCourseProgress = async(req,res)=>{
    try{
        const userId = req.auth.userId
        const {courseId,lectureId} = req.body;
        const progressData = await CourseProgress.findOne({userId,courseId})
        if(progressData){
            if(progressData.lectureCompleted.includes(lectureId)){
                return res.status(400).json({success:false,message:"Lecture already completed"})
            }
            progressData.lectureCompleted.push(lectureId)
            await progressData.save()
        }else{
            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted:[lectureId]

                
            })
        }
        return res.status(200).json({
            success: true,
            message:"progress Updateed"
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
//get User Course Progress
const getUserCourseProgress = async(req,res)=>{
    try{
        const userId = req.auth.userId
        const {courseId} = req.body;
        const progressData = await CourseProgress.findOne({userId,courseId})
        return res.status(200).json({
            success:true,
            progressData
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
// add User Ratings to Course
const addUserRating = async (req,res)=>{
    const userId = req.auth.userId
    const {courseId,rating} = req.body;
    if(!courseId || !userId || !rating < 1 || rating > 5  ){
        return res.status(400).json({
            success:false,
            message:"Invalid Details"
        })
    }
    try{
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                success:false,
                message:"Course Not Found"
            })
        }
        const user = await User.findById(userId);
        if(!user || !user.enrolledCourses.includes(courseId)){
            return res.status(400).json({
                success:false,
                message:"User has Not Purchased the Course"
            })
        }
        const existingRatingIndex = course.courseRatings.findIndex(r =>r.userId === userId)
        if(existingRatingIndex > -1){
            course.courseRatings[existingRatingIndex].rating = rating
        }else{
            course.courseRatings.push({userId,rating})
        }
        await course.save()
        return res.status(200).json({
            success:true,
            message:"Rating Added Successfully"
        })  
       
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
module.exports = {getUserData,getUserEnrolledCourses,purchaseCourse,updateUserCourseProgress,getUserCourseProgress,addUserRating}