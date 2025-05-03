import { Product } from "../models/product.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

import fs from "fs"; 

const createProduct = AsyncHandler(async (req, res) => {
  const {
    productName,
    description,
    price,
    category,
    stock,
    underlinePrice,
    isTrending,
  } = req.body;

  console.log("Incoming request body:", req.body);

  if (
    !productName ||
    !description ||
    !price ||
    !category ||
    !stock ||
    !underlinePrice ||
    typeof isTrending === "undefined"
  ) {
    throw new ApiError(400, "All fields are required. Please fill them.");
  }

  // Extract image paths from req.files
  const mainProductImgLocalpath = req.files?.mainProductImg?.[0]?.path;
  const otherProductImgLocalpath = req.files?.otherProductImg
    ?.map((file) => file.path)
    .filter(Boolean); // Remove undefined/null paths

  console.log("Main product image path:", mainProductImgLocalpath);
  console.log("Other product image paths:", otherProductImgLocalpath);

  if (!mainProductImgLocalpath) {
    throw new ApiError(400, "Main product image is required.");
  }

  if (!otherProductImgLocalpath || otherProductImgLocalpath.length === 0) {
    throw new ApiError(400, "At least one additional product image is required.");
  }

  // Upload main product image
  const mainProductUpload = await uploadOnCloudinary(mainProductImgLocalpath);
  if (!mainProductUpload?.url) {
    throw new ApiError(400, "Error while uploading main product image.");
  }

  // Upload additional product images
  const otherImgUpload = await Promise.all(
    otherProductImgLocalpath.map(async (filePath, index) => {
      try {
        const upload = await uploadOnCloudinary(filePath);
        if (!upload?.url) {
          throw new Error(`Upload failed for image at index ${index}`);
        }
        return upload.url;
      } catch (error) {
        console.error(
          `Error uploading additional image [${index}]:`,
          filePath,
          error.message
        );
        throw new ApiError(400, "Error while uploading additional product images.");
      }
    })
  );

  // Create product document
  const createdProduct = await Product.create({
    productName,
    description,
    price,
    category,
    stock,
    underlinePrice,
    mainProductImg: mainProductUpload.url,
    otherProductImg: otherImgUpload,
    isTrending,
  });

  //  Delete all uploaded local files after product creation
  const uploadedFilePaths = [mainProductImgLocalpath, ...otherProductImgLocalpath];

  uploadedFilePaths.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete file:", filePath);
        else console.log("Local file deleted successfully:", filePath);
      });
    }
  });

  res
    .status(201)
    .json(new ApiResponse(201, createdProduct, "Product created successfully."));
});




const getAllProduct = AsyncHandler(async (req, res, next) => {
    const allProducts = await Product.find({})
    if (!allProducts) {
        throw new ApiError(500, "Products Not Found")
    }
    res.status(200).json(new ApiResponse(200, allProducts, "Getting all the products ...."))
})

//update product details 
//update product img, other img
//delet product
//get product with id 
const updateProductdetails = AsyncHandler(async (req, res, next) => {
    const { productId } = req.params;

    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found with that ID");
    }

    const {
        productName,
        description,
        price,
        underlinePrice,
        category,
        stock
    } = req.body;

    console.log("BODY ",req.body)

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
            $set: {
                productName,
                description,
                price,
                underlinePrice,
                category,
                stock,
            },
        },
        { new: true, runValidators: true }
    );
    console.log("Updated product ",updatedProduct)

    res.status(200).json(new ApiResponse(200, updatedProduct, "Product details updated successfully"));
});

const deleteProduct = AsyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    if (!productId) {
        throw new ApiError(400, "product id required")
    }
    const product = await Product.findOneAndDelete(productId)
    if (!product) {
        throw new ApiError(400, "Product not find")
    }
    res.status(200).json(new ApiResponse(200, {}, "Delted Product Successfully"))
})

const updateMainImg = AsyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    console.log(req.file)

    const mainProductImgLocalpath = req.file?.path;
    console.log(mainProductImgLocalpath)
    if (!mainProductImgLocalpath) {
        throw new ApiError(400, "Main Product Img is required.")
    }

    const mainProductUpload = await uploadOnCloudinary(mainProductImgLocalpath)

    if (!mainProductUpload) {
        throw new ApiError(400, "Error : while uploading main product")
    }

    const updateProduct = await Product.findByIdAndUpdate(productId, {
        $set: {
            mainProductImg: mainProductUpload.url
        }
    }, { new: true })

    res.status(200).json(new ApiResponse(200, updateProduct, "Updated Product main img"))

})

const updateOtherImg = AsyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    if (!productId) {
        throw new ApiError(400, "Productid required")
    }

    // console.log(req.files)
    const otherProductImgLocalpath = req.files?.otherProductImg.map((file) => file.path)
    // console.log("paths")
    // console.log(otherProductImgLocalpath)

    if (!otherProductImgLocalpath) {
        throw new ApiError(400, "Other Products Imgs are required")
    }

    const otherImgUpload = await Promise.all(otherProductImgLocalpath.map(async (file) => {
        const upload = await uploadOnCloudinary(file)
        if (!upload.url) {
            throw new ApiError(400, "Error While Uploading Other Imgs")
        }
        return upload.url
    }))


    const updateProduct = await Product.findByIdAndUpdate(productId, {
        $set: {
            otherProductImg: otherImgUpload
        }
    }, { new: true })

    res.status(200).json(new ApiResponse(200, updateProduct, "Updated Product Other imgs"))


})

const getSingleProduct = AsyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    if (!productId) {
        throw new ApiError(400, "product id required")
    }
    const product = await Product.findById(productId)
    res.status(200).json(new ApiResponse(200, product, "Getting Detailed Product..."))

})

const getCategorySingleProducts = AsyncHandler(async (req, res, next) => {
    //koi ek hi particcular fields k liye distinct....
    const categories = await Product.distinct("category")
    if (!categories) {
        throw new ApiError("Not Found Any Categories")
    }

    //product milegi by category

    // map ->loop che bdhu na thy tya sudhi so promise.all.... Await thse hold kro
    const productByCategory = await Promise.all(categories.map(async (category) => await Product.findOne({ category })))
    // console.log(categories)
    // console.log(productByCategory)

    res.status(200).json(new ApiResponse(200, productByCategory, "Getting all category Products"))

})

const getAllCategoryBasedProducts = AsyncHandler(async (req, res, next) => {
    //category like laptop che to ena related bdha aave

    const { category } = req.query
    console.log(category)
    if (!category) {
        throw new ApiError(400, "Pls Provide category..")
    }
    const allcategoryProducts = await Product.find({ category })

    if (allcategoryProducts.length === 0) {
        throw new ApiError(400, "Not Available for that category Based Product")
    }

    res.status(200).json(new ApiResponse(200, allcategoryProducts, "Getting all Category Base Products....."))

})


const getAllCategoryNames = AsyncHandler(async (req, res, next) => {
    const categories = await Product.aggregate([
        {
            $group: {
                _id: "$category",
                mainProductImg: { $first: "$mainProductImg" }  // First product image for each category
            }
        }
    ]);
    res.status(200).json(new ApiResponse(200, categories, "Getting all categories name."))
})

const serachProduct = AsyncHandler(async (req, res, next) => {
    // const {data}=req.body;

    const searchquery = req.query.q;

    if (!searchquery) {
        throw new ApiError(400, "String Is Required for the search")
    }
    //search productname with egnore case
    const serach = await Product.find({
        productName: {
            $regex: searchquery,
            $options: "i"
        },
        // category:{
        //     $regex:searchquery,
        //     $options:"i"
        // }
        // 
    })

    if (serach.length === 0) {
        throw new ApiError(400, "Not Found Product")
    }

    res.status(200).json(new ApiResponse(200, serach, "Getting Serach Product."))
})

const filterProduct = AsyncHandler(async (req, res, next) => {

    const { categoryList, sortOption } = req.body;
    //sort order means 
    // if(!sortOption){
    //     throw new ApiError(400,"Required Category for filter")
    // }

    const sortQuery = sortOption === "HighToLow" ? { price: -1 } :
        sortOption === "LowToHigh" ? { price: 1 } :
            {}

    const filCategory = await Product.find(categoryList?.length ? {
        category: {
            $in: categoryList
        }
    } : {}).sort(sortQuery)

    if (filCategory.length === 0) {
        throw new ApiError(400, "Not found Product with that Product Category.")
    }

    res.status(200).json(new ApiResponse(200, filCategory, "Getting Filtered Product"))
})

const stockMangement = AsyncHandler(async (req,res,next)=>{

    const { productId ,stock } = req.body;
    if (!productId || !stock) {
        throw new ApiError(400, "product id and stock is required")
    }
    const product = await Product.findById(productId)
    product.stock = Number(stock);
    await product.save();
    res.status(200).json(new ApiResponse(200, product, "Product Stock Updated Successfully..."))
})


export {
    createProduct,
    getAllProduct,
    updateProductdetails,
    deleteProduct,
    getSingleProduct,
    updateMainImg,
    updateOtherImg,
    getCategorySingleProducts,
    getAllCategoryBasedProducts,
    getAllCategoryNames,
    serachProduct,
    filterProduct,
    stockMangement
}