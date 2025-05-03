import mongoose from "mongoose";

const userServiceSchema= mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    name:{
        type:String,
        required:[true,"Name must be required"]
    }, 
    email:{
        type:String,
        required:[true,"Email must be required"]
    },
    category:{
        type:String,
        // required:true
    },
    // subCategories:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"ServiceCategory"
    // },
    subCategories:{
        type:String,
        requried:true
    },
    addressInfo:{
        type:String,
        required:[true,"Address is Required"]
    },
    date:{
        type:Date,
        required:true
    },
    scheduleTime:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["Schedule","ReSchedule","Cancel","Complete"], //only admin allow to chnge the status.
        default:"Schedule"
    }
},{timestamps:true})

const UserService=mongoose.model("UserService",userServiceSchema);

export default UserService;