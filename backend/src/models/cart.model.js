import mongoose from "mongoose";

const cartSchema = mongoose.Schema({

    //itemss -products refId Quntity number , user ref id, 

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  //frontend ma aa cookies mathi user aavse
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min:1
            }
        }
    ]

},{timestamps:true})

export const Cart = mongoose.model("Cart", cartSchema)