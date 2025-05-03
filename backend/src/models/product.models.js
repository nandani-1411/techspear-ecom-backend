import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName:{
        type:String,
        required:[true,"Product Name must be required"],
    },
    description:{
        type:String,
        required:[true,"Prouduct Description must be required"]
    },
    mainProductImg:{
        type:String,
        required:[true,"Main Prouduct Imgs must required Bcz showing main as fronted to user."] //img main product
    },
    otherProductImg:{
        type:[String], //cloudinary url -> storing multiple urls ->products other sprepart additional imgs
        default:[]
    },
    underlinePrice:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:[true,"Category is required here."]
    },
    stock:{
        type:Number,
        required:[true,"Please Enter the Product Stock"],
        maxLength:[4,"Maximum is 4 char tk"],
        default:1
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    //For Review
    numOfReviews:{
        type:Number,
        default:0
    },
    averageRating:{
        type:Number,
        default:0
    },
    isTrending:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

const Product = mongoose.model("Product",productSchema)
export {Product}