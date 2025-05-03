import mongoose from "mongoose";

const serviceCategoriesSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    subCategories:[String]
},{timestamps:true})

const ServiceCategory =mongoose.model("ServiceCategory",serviceCategoriesSchema);

export default ServiceCategory;