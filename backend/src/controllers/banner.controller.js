import { Banner } from "../models/banner.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const addBannerImg = AsyncHandler(async (req, res, next) => {

    const bannerLocalPath = req.files?.img;
    // console.log(bannerLocalPath)

    const seperateLocalPath = bannerLocalPath.map((img) => img.path)
    console.log(seperateLocalPath)
    if (!bannerLocalPath) {
        throw new ApiError(400, "Banner Img is Required.")
    }
    //all imgs upload on clodinary
    const bannerCloudinaryUrl = await Promise.all(seperateLocalPath.map(async (img) => {
        const upload = await uploadOnCloudinary(img)
        if (!upload) {
            throw new ApiError(400, "Error while uploding url on clodinary")
        }
        // console.log(upload.url)
        return upload.url
    }))

    if (!bannerCloudinaryUrl) {
        throw new ApiError(400, "Error When Uploading to Cloudinary")
    }

    const addBanner = await Banner.create({
        img: bannerCloudinaryUrl
    })

    res.status(201).json(new ApiResponse(200, addBanner, "Added Successfully Banner."))

})

const getBannerImg = AsyncHandler(async (req, res, next) => {
    // console.log("Banner")
    const banner = await Banner.find()
    if (banner.length === 0) {
        throw new ApiError(400, "Not found Banner")
    }
    res.status(200).json(new ApiResponse(200, banner, "Getting Banner"))
})

const deleteBannerImg = AsyncHandler(async (req, res, next) => {
    const { bannerId } = req.params;

    if (!bannerId) {
        throw new ApiError(400, "Banner Id is Required For Deletion of Banner.")
    }

    const dltBanner = await Banner.findByIdAndDelete(bannerId)
    console.log('Deleted Successfully.')
    res.status(200).json(new ApiResponse(200, dltBanner, "Deleted Successfully"))

})

export {
    addBannerImg,
    getBannerImg,
    deleteBannerImg
}