const express = require("express");
const cors = require("cors");
const connectDB = require("./configs/mongodb");
const { clerkWebhooks } = require("./controllers/webhookes");
require('dotenv').config();

//initialize exprss
const app = express();
//connect to database
 connectDB()

//middeleweres
app.use(cors());

//routes

app.get('/',(req,res)=>{
    res.send('API Is working')
})
app.post('/clerk',express.json(),clerkWebhooks)

//pport
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})