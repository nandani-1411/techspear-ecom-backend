import { Order } from "../models/order.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const getDashboardStats = async (req, res) => {
  try {
    // 1️⃣ Sales Chart (Orders Per Month)
    const salesChart = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    console.log("Sales Chart (Raw):", salesChart);

    const formattedSales = salesChart.map((item) => ({
      month: getMonthName(item._id),
      totalSales: item.totalSales
    }));

    console.log("formated sales ",formattedSales)
    // 2️⃣ Revenue Growth (Sum of totalAmount per Month)
    const revenueGrowth = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    console.log("revenue Chart (Raw):",revenueGrowth);


    const formattedRevenue = revenueGrowth.map((item) => ({
      month: getMonthName(item._id),
      revenue: item.revenue
    }));

    console.log("formated revenue Chart (Raw):",formattedRevenue);
    // 3️⃣ Orders Overview
    const [totalOrders, pendingOrders, completedOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: "Pending" }),
      Order.countDocuments({ orderStatus: "Delivered" }),
    ]);
    console.log("Orders Overview:", { totalOrders ,pendingOrders, completedOrders });

    // 4️⃣ Most Sold Products
    const mostSold = await Order.aggregate([
        { $unwind: "$orderItems" },
        {
          $group: {
            _id: "$orderItems.product", // reference to Product model
            totalSold: { $sum: "$orderItems.quantity" }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        { $unwind: "$productDetails" },
        {
          $project: {
            _id: 0,
            productId: "$productDetails._id",
            productName: "$productDetails.productName",
            description: "$productDetails.description",
            price: "$productDetails.price",
            stock: "$productDetails.stock",
            img: "$productDetails.mainProductImg",
            totalSold: 1
          }
        }
      ]);
      
    console.log("Most Sold Products:", mostSold);

    res.status(200).json(new ApiResponse(200,{
        salesChart: formattedSales,
        revenueChart: formattedRevenue,
        ordersOverview: {
          totalOrders,
          pendingOrders,
          completedOrders
        },
        mostSoldProducts: mostSold
      },"Getting Chart From apis ." ));

  } catch (error) {
    throw new ApiError(400,error)
  }
};

function getMonthName(month) {
  return new Date(2000, month - 1).toLocaleString("default", { month: "short" });
}
