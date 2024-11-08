const express=require('express');
const dotenv = require('dotenv');
const connectDB  = require('./utils/helperfunction');
const userRoutes = require('./userRoutes');

dotenv.config();

const app=express();
const port= process.env.PORT || 3000;
const mongoURI= process.env.MONGO_URI || "";

connectDB(mongoURI);
app.use(express.json());

app.get('/', (req,res)=>{
    res.send("Working");
})

app.use('/api/v1/user',userRoutes);

app.listen(port,()=>{
    console.log(`Server is working on localhost: ${port}`);
})