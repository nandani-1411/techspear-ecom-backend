import mongoose from "mongoose";

const serviceMsgSchema= mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"UserService"
    },
    message:{
        type:String,
    },
    status:{
        type:String,
        enum:["ReSchedule","Complete","Cancel"]
    }

},{timestamps:true})

const ServiceNotification =mongoose.model("ServiceNotification",serviceMsgSchema);

export default ServiceNotification;