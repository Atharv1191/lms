const Course = require('../models/Course')

//get all course

const getAllCourses = async(req,res)=>{
    try{
        const courses = await Course.find({ isPublished: true })
        .select(['-courseContent', '-enrolledStudents'])
        .populate({ path: 'educator', select: '-password' })

    res.json({ success: true, courses })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })

    }
}

//get course by id
const getCourseId = async(req,res)=>{
    const {id} = req.params
    try{
        const courseData = await Course.findById(id).populate({path:'educator'})
        //Remove lecture url if preview is false
        courseData.courseContent.forEach(chapter =>{
            chapter.chapterContent.forEach(lecture=>{
                if(!lecture.isPreviewFree){
                    lecture.lectureUrl =""

                }
            })
        })
        return res.status(200).json({
            success:true,
            courseData
        })

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}



module.exports = {getAllCourses,getCourseId}