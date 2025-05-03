import express from "express"
// import { verifyJwt } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import { createProduct, deleteProduct, filterProduct, getAllCategoryBasedProducts, getAllCategoryNames, getAllProduct, getCategorySingleProducts, getSingleProduct, serachProduct, stockMangement, updateMainImg, updateOtherImg, updateProductdetails } from "../controllers/product.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"
import { isAdmin } from "../middlewares/isAdmin.middleware.js"
const router = express.Router()

//Health checking router is it properly work or not
router.route("/chking").get((req,res)=>{
    res.json({msg:"Health is good . All are perfect ."})
})

//Addmin routes
router.route("/createProduct").post(verifyJwt, isAdmin, upload.fields([
    { 
        name:"mainProductImg",
        maxCount:1
    },
    {
        name:"otherProductImg",
        maxCount:5
    }
]),createProduct)
router.route("/updateProductDetails/:productId").patch(verifyJwt,isAdmin,updateProductdetails)
router.route("/deleteProduct/:productId").delete(deleteProduct)
router.route("/updateMainImg/:productId").patch(upload.single('mainProductImg'),updateMainImg)
router.route("/updateOtherImg/:productId").patch(upload.fields([
    {
        name:'otherProductImg',
        maxCount:5
    }
]),updateOtherImg)

router.route("/stockManage").patch(verifyJwt,isAdmin,stockMangement)

//Customer - routes
router.route("/getAllProducts").get(getAllProduct)
router.route("/getSingleProduct/:productId").get(getSingleProduct)
router.route("/searchProduct").get(serachProduct)
router.route("/filterProduct").post(filterProduct)

//all categories product -> show in frontend first Home pg. sliding category ...

router.route("/getCategorySingleProduct").get(getCategorySingleProducts)
router.route("/getCategoryBasedProduct").get(getAllCategoryBasedProducts)
router.route("/getAllCategoryName").get(getAllCategoryNames)


export default router