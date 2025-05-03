import mongoose, { Schema, model } from "mongoose"

const orderSchema = Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "User", //refrecing the user
    },

    addressInfo: {
        type: Schema.Types.ObjectId,
        ref:"Address" //refrecing the address
    },
 
    orderItems: [
        {
          productName: {
            type: String,
            required: true,
          },
          price: {
            type: Number,
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
          mainProductImg: {
            type: String,
            required: true,
          },
          product: {
            type: mongoose.Schema.ObjectId,
            ref: "Product",
            required: true,
          },
        },
      ],

    totalAmount: {
        type: Number,
        // required: true
    },

    orderStatus: {
        type: String,
        enum: ['Pending',"Confirmed", 'Processing',  'Shipped', 'Delivered', 'Cancel'],
        default: "Pending"
    },
    statusTimeline: [
      {
         label: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancel'],
         },
         date: {
            type: Date,
            default: Date.now,
         },
      },
   ],

    // paymentInfo:{
    //      razorpay,stripe ... alll about payments...
    // }

}, { timestamps: true })

// Optionally add a pre-save hook to update the timeline automatically on status change
orderSchema.pre('save', function (next) {
  if (this.isModified('orderStatus')) {
     this.statusTimeline.push({
        label: this.orderStatus,
        date: new Date(),
     });
  }
  next();
});


export const Order = model("Order",orderSchema)