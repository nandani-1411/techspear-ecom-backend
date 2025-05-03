import mongoose from "mongoose";

const serviceScheduleSchema= mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"UserService"
    },
    date:{
        type:Date,
        required:true
    },
    time:{
        type:String,
        required:true
    }
},{timestamps:true})


const ServiceSchedule= mongoose.model("ServiceSchedule",serviceScheduleSchema);

export default ServiceSchedule;