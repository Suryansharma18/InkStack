const {Schema,model} = require('mongoose');
const {createHmac , randomBytes}  = require("crypto");
const { createTokenForUser} = require("../services/authentication.js")

const userSchema = new Schema({
    fullName:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        require:true,
        unique:true,
    },
    salt:{
        type:String,

    },
    password:{
        type:String,
        require:true,
    },
    profileImageURL:{
        type:String,
        default:"/images/images.png"
    },
    role: {
        type:String,
        enum : ["ADMIN","USER"],
        default: "USER"

    }
},{timestamps: true});
userSchema.pre('save', function (next) {
 const user =this;
 if(!user.isModified("password")) return;
 const salt = randomBytes(16).toString();
 const hashedPass = createHmac("sha256",salt).update(user.password).digest("hex");
 this.salt = salt;
 this.password = hashedPass;
 next();
});
userSchema.static('matchPasswordAndGenerateToken',async function(email,password) {
    const user = await this.findOne({email});
    if(!user) throw new Error("User not found");

    const salt = user.salt;
    const hashedPass = user.password;
    const userProvidedHash = createHmac("sha256",salt).update(password)
    .digest("hex");
    if(hashedPass !== userProvidedHash){
        throw new Error("Password is Incorrect");
    }
    else{
    // return {...user._doc,password:undefined,salt:undefined};
    // return user;
    const token = createTokenForUser(user);
    return token;
    }
    
})

const User = model("user",userSchema);
module.exports = User;