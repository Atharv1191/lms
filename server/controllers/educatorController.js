const { clerkClient } = require('@clerk/express');
const Course = require('../models/Course');
const Purchase = require('../models/Purchase');
const cloudinary = require("cloudinary").v2;

const updateRoleToEducator = async (req, res) => {
    try {
        const userId = req.auth.userId; // Ensure `req.auth` is populated by Clerk middleware
        await clerkClient.users.updateUser(userId, {
            publicMetadata: {
                role: 'educator',
            }
        });
        res.json({
            success: true,
            message: "You can publish a course now"
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
}
//Add New course
const AddCourse = async(req,res)=>{
    try{
        const {courseData} = req.body;
        const imageFile = req.file
        const educatorId = req.auth.userId
        if(!imageFile){
            return res.status(400).json({
                success:false,
                message:"Thumbnail Not Attached"
            })
        }
        const parsedCourseData = await JSON.parse(courseData)
        parsedCourseData.educator = educatorId
       const newCourse = await Course.create(parsedCourseData)
       const imageUpload = await cloudinary.uploader.upload(imageFile.path)
       newCourse.courseThumbnail = imageUpload.secure_url
       await newCourse.save();
       return res.status(200).json({
        success:true,
        message:"Course Added Successfully",
       })
    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:error.message
        })

    }
}
//Get Educator Courses
const getEducatorCourse = async(req,res) =>{
    try{
        const educator = req.auth.userId
        const courses = await Course.find({educator});
        return res.status(200).json({
            success:true,
            courses
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
//get educator dashboard data
const educatorDashboardData = async(req,res) =>{
    try{
        const educator = req.auth.userId;
        const courses = await Course.find({educator});
        const totalCourses = courses.length;
        const courseIds = courses.map(course =>course._id);

        //calculate total earnig from purchases

        const purchases = await Purchase.find({
            courseId:{$in:courseIds},
            status:"completed"
        })
        const totalEarnings = purchases.reduce((sum,purchase)=>sum + purchase.amount,0);

        //collect unique enrolled student IDs with thier course titles
        const enrolledStudentsData =[];

        for(const course of courses){
            const students = await User.find({
                _id:{$in:course.enrolledStudents}
            },"name imageUrl");
            students.forEach(student =>{
                enrolledStudentsData.push({
                    courseTitle:course.courseTitle,
                    student
                })
            })

        }
        return res.status(200).json({
            success:true,
            dashboardData:{
               totalEarnings,
                enrolledStudentsData,
                totalCourses
            }
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })


    }
}
//Get enrolled Students Data with purchase data
const getEnrolledStudentsData = async(req,res)=>{
    try{
        const educator = req.auth.userId
        const courses = await Course.find({educator});
        const courseIds = courses.map(course =>course._id)

        const purchases = await Purchase.find({
            courseId:{$in:courseIds},
            status:'completed'
        }).populate('userId','name imageUrl').populate('courseId','courseTitle')

        const enrolledStudents = purchases.map(purchase =>({
            student:purchase.userId,
            courseTitle:purchase.courseId,courseTitle,
            purchaseDate:purchase.createdAt
        }))
        return res.status(200).json({
            success:true,
            enrolledStudents
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })


    }
}
module.exports = { updateRoleToEducator,AddCourse,getEducatorCourse,educatorDashboardData,getEnrolledStudentsData };
