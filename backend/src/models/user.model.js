import mongoose from 'mongoose';
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minlength:[2,"Name Length is Min 2"]
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:[8,"MaxLength of pass is 8"]
    },
    profilePic:{
        type:String
    },
    refreshToken:{
        type:String
    },
    role:{
        type:String,
        enum:["Admin","User"],
        default:"User"
    }

},{timestamps:true})

// hashing the pass ..

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);

    //checking it admin ... 
    if(this.email===process.env.ADMIN_EMAIL){
        this.role="Admin"
    }
    else{
        this.role="User"
    }

    next();
});


// true - match hua  | false - match nhi hua..
userSchema.methods.isPasswordCorrect = async function(pass){
    return await bcrypt.compare(pass,this.password)
}


//jwt Access Token ...

userSchema.methods.generateAccessToken=function(){
    return jwt.sign({
         _id:this._id,
         name:this.name,
         email:this.email
     },process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY})
 }
 
 // Refresh jwt token...
 userSchema.methods.generateRefreshToken=function(){
     return jwt.sign({_id:this._id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY})
 }
 

const User=mongoose.model("User",userSchema)

export {User}

