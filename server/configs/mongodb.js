const mongoose = require('mongoose');

//connect to the mogodb database

const connectDB = async()=>{
    mongoose.connection.on('connected',()=>(console.log("Database connected")))

    await mongoose.connect(`${process.env.MONGODB_URI}`)
}
module.exports = connectDB;