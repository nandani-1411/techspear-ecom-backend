import { Order } from "../models/order.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { AsyncHandler } from "../utils/AsyncHandler.js"
import { User } from "../models/user.model.js"
import { Product } from "../models/product.models.js"
import { Address } from "../models/address.model.js"
import { Cart } from "../models/cart.model.js"
import { populate } from "dotenv"
import Payment from "../models/payment.model.js"

const newOrder = AsyncHandler(async (req, res, next) => {
   const { userId, addressInfo, cartItems } = req.body
   console.log(req.body)


   let orderItems = [];  // to store a snapshot of cart items
   let totalAmount = 0; // to store the total amount

   console.log(userId, addressInfo, orderItems)

   if (!userId || !addressInfo || !orderItems) {
      throw new ApiError(400, "UserID,AddressInfo , orderItems Required ")
   }

   console.log(userId, addressInfo, orderItems);
   const user = await User.findById(userId)
   if (!user) {
      throw new ApiError(400, "User Not Found .")
   }

   const cart = await Cart.findById(cartItems)
      .populate({
         path: "items.productId"
      })

   // console.log(cart)

   if (cart.length === 0) {
      throw new ApiError(400, "Product not found")
   }

   if (!cart) {
      throw new ApiError(400, "Product not Found")
   }
   // console.log("mycart")
   // console.log(cart)
   // console.log("done")

   const address = await Address.findById(addressInfo)
   if (!address) {
      throw new ApiError(400, "Address not Found")
   }

   for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId._id);
      if (!product) {
         throw new ApiError(400, "Error: Can't fetch product.");
      }

      if (cartItem.quantity > product.stock) {
         throw new ApiError(
            400,
            `Out of stock for ${product.productName}. Available stock: ${product.stock}`
         );
      }

      product.stock = Math.max(0, product.stock - cartItem.quantity);
      await product.save();
      console.log(`Updated stock for ${product.productName}: ${product.stock}`);

      orderItems.push({
         productName: product.productName,
         price: product.price,
         quantity: cartItem.quantity,
         mainProductImg: product.mainProductImg,
         product: product._id,
      });
      totalAmount += product.price * cartItem.quantity;
   }

   let orderStatus="Pending";

   const order = await Order.create({
      userId,
      addressInfo,
      orderStatus,
      orderItems: orderItems, // corrected to orderItems
      totalAmount: totalAmount, // added totalAmount
   });

   // Clear the cart
   cart.items = [];
   await cart.save();
   console.log("Cart cleared after order creation.");


   const populatedOrder = await Order.findById(order._id)
      .populate("userId addressInfo")
      .populate({
         path: "orderItems.product", // corrected to orderItems.product
         select: "productName price stock mainProductImg otherProductImg",
      });

   res
      .status(200)
      .json(new ApiResponse(200, populatedOrder, "new order created"));
});

//admin can allow to access all orders  ->users k order allow hai ho to ....

const getAllOrders = AsyncHandler(async (req, res, next) => {

   // const {userId}=req.params
   // console.log(userId)

   const orders = await Order.find({})
      .populate({
         path: "userId",
         select: "name email profilePic role createdAt"
      })
      .populate({
         path: "addressInfo",
         select: "fullAddress city state country"
      })
      .populate({
         path: "orderItems.product", // Corrected to orderItems.product
         select: "productName price description mainProductImg stock category",
      });
   // console.log(orders)

   if (!orders || orders.length === 0) {
      throw new ApiError(400, "Orders Not Found")
   }
   console.log(orders)

   res.status(200).json(new ApiResponse(200, orders, "Getting All the Orders"))

})

const updateOrderStatus = AsyncHandler(async (req, res, next) => {

   const { orderId } = req.params
   const { orderStatus } = req.body

   console.log(req.body)
   // console.log(orderId,orderStatus)

   if (!orderId) {
      throw new ApiError(400, "Required Order Id")
   }
   if (!orderStatus) {
      throw new ApiError(400, "Order Status is Required for updating .")
   }

   const order = await Order.findById(orderId)
      .populate({
         path: "userId"
      })
      .populate({
         path: "orderItems.product", // Corrected to orderItems.product
         select: "productName price stock mainProductImg description",
      });

   // console.log(order)

   if (!order) {
      throw new ApiError(400, "Order not found with that id")
   }
   if(order.orderStatus==="Delivered"){
      console.log("COME")
      const payment = await Payment.findOne({ orderId: orderId });

      console.log("MY payment  ",payment)
      if (!payment) {
         throw new ApiError(400, "Payment not found for this order.");
      }

      // Update payment status to 'Completed'
      payment.status = "Completed";
      console.log(payment.status)
      await payment.save();
   }

   if (order.orderStatus === "Delivered") {
      throw new ApiError(400, "You have already Delivered The Order.")
   }



   //update the stock-> like stock is 10 -> quantity is 2 -> 10-2=8 stock Update it 

   // await Promise.all( order.cartItems.map((item)=>) )

   // order.cartItems.forEach(async (cart) => {
   //    // console.log(cart)
   //    cart.items.forEach(async (item) => {
   //       const product = await Product.findById(item.productId._id)
   //       if (!product) {
   //          throw new ApiError(400, "Error Can't Fetch the product not Updating the stock")
   //       }

   //       if (item.quantity > product.stock) {
   //          throw new ApiError(400, "Out of stock.")
   //       }

   //       product.stock = Number(product.stock - item.quantity)
   //       await product.save()
   //       console.log(product)
   //    })
   // })

   order.orderStatus = orderStatus
   await order.save();

   const updatedOrders = await Order.findById(orderId)
      .populate("userId")
      .populate({
         path: "orderItems.product", // Corrected to orderItems.product
         select: "productName price stock mainProductImg description",
      });
   res.status(200).json(new ApiResponse(200, updatedOrders, "OrderStatus is Updated..."))

})

// user k liye 
const getMyOrdersLoggInUser = AsyncHandler(async (req, res, next) => {
   const user = req.user._id

   console.log(user)
   if (!user) {
      throw new ApiError(400, "Unauthorized request Please Login")
   }

   const userOrder = await Order.find({ userId: user }).populate({
      path: "orderItems.product",
      select: "productName price stock mainProductImg description",
   })
      .populate({ path: "userId", select: "name email profilePic role createdAt" })
      .populate({ path: "addressInfo", select: "fullAddress city state country pinCode" })

   if (userOrder.length === 0) {
      throw new ApiError(400, "Orders Not found")
   }

   // console.log(userOrder)
   res.status(200).json(new ApiResponse(200, userOrder, "Getting all User Order."))


})

//admin dekh sakta hai user k single orders
const getSingleOrder = AsyncHandler(async (req, res, next) => {
   const { id } = req.params
   // console.log(id)
   if (!id) {
      throw new ApiError(400, "Id required")
   }
   const order = await Order.findById(id).populate({
      path: "userId",
   })
      .populate({
         path: "addressInfo",
      })
      .populate({
         path: "orderItems.product", // Corrected to orderItems.product
         select: "productName price description mainProductImg stock category",
      });;


   res.status(200).json(new ApiResponse(200, order, "Getting single orders"))
})

//admin can able to dlt the order

const deleteOrder = AsyncHandler(async (req, res, next) => {
   const { id } = req.params
   if (!id) {
      throw new ApiError(400, "Id required")
   }
   const order = await Order.findByIdAndDelete(id)
   res.status(200).json(new ApiResponse(200, {}, "Dleted Order Successfully."))
})


const trackingOrders= AsyncHandler(async (req,res,next)=>{
   const {id} = req.params;

   if (!id) {
      throw new ApiError(400, "Id required")
   }
   
   const order= await Order.findById(id).select('statusTimeline orderStatus');

   res.status(200).json(new ApiResponse(200,order,"Tracking Orders"))

})

export {
   newOrder,
   getAllOrders,
   updateOrderStatus,
   getMyOrdersLoggInUser,
   getSingleOrder,
   deleteOrder,
   trackingOrders
}