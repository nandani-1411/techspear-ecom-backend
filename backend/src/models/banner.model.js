import mongoose  from "mongoose";

const bannerSchema = mongoose.Schema({
    img:{
        type:[String],
        required:[true,"Banner img is required."]
    }
},{timestamps:true})

const Banner= mongoose.model("Banner",bannerSchema)

export {Banner}