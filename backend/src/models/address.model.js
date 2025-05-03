import mongoose,{Schema,model} from "mongoose"

const addressSchema = Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    email:{
        type:String,
        required:[true,"Email must be required."]
    },
    fullAddress: {
        type: String,
        required: [true,"Full adress must required."]
    },
    state:{
        type:String,
        required:[true,"State must be required."]
    },
    city:{
        type:String,
        required:[true,"City must be required."]
    },
    apartment:{
        type:String,
        required:[true,"Apartment must be required"]
    },
    country: {
        type: String,
        required: [true,"Country must be required."]
    },
    pinCode: {
        type: Number,
        required: [true,"Pincode must be required."]
    },
    phone:{
        type:Number,
        require:[true,"Phone nb must be required."]
    }
},{timestamps:true})


export const Address= model("Address",addressSchema)