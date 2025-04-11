const path = require("path");
const express = require('express');
const app = express();
const port = 8000;
const UserRoutes = require('./routes/user')
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const {checkForAuthenticationCookie} = require('./middleware/authentication.js')


const Blog = require('./models/blog.js')


const BlogRoutes = require('./routes/blog.js')

mongoose.connect('mongodb://localhost:27017/blogify')
.then(e => console.log("MongoDb connected"));

app.set('view engine','ejs');
app.set('views',path.resolve("./views"));

app.use(express.urlencoded({extended:false}))
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));





app.use(express.static(path.resolve('./public')));

app.get("/",async(req,res)=>{
    const allBlogs = await Blog.find({});
    res.render("home",{
        user : req.user,
        blogs : allBlogs,
    });
})
app.use("/user",UserRoutes);
app.use("/blog",BlogRoutes);

app.listen(port,()=>{

    console.log(`App is listennng at ${port}`);
})