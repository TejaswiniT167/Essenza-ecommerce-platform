import Product from '../models/product.model.js';
import {redis} from '../lib/redis.js';
import cloudinary from '../lib/cloudinary.js';

export const getAllProucts = async (req,res)=>{
    try{
        const products = await Product.find({}); //gets all products
        res.json({products});   
    }
    catch(error){
        console.log("Error in getAllProducts controller", error.message);
        res.status(500).json({message: "Server Error", error: error.message});
    }
}

export const getFeaturedProducts = async (req,res)=>{
    try{
        let featuredProducts = await redis.get("featured_products");
        if(featuredProducts){
            return res.json(JSON.parse(featuredProducts));
        }
        //if not in redis, fetch from mongodb...wow redis one is like fixed!
        featuredProducts = await Product.find({isFeatured: true}).lean();
        //.lean() returns plain javascript object instead of mongodb document/object good for performance
        //console.log("Featured Products Server side: ", featuredProducts);

        if(!featuredProducts){
            return res.status(404).json({message: "No featured products found"});
        }

        //now stored the obtained featuredProdcuts from mongodb in redis
        await redis.set("featured_products",JSON.stringify(featuredProducts));

        res.json(featuredProducts);
    }
    catch(error){
        console.log("Error in getFeaturedProducts controller", error.message);
        res.status(500).json({message: "Server Error", error: error.message});
    }
}

export const createProduct = async (req,res)=>{
    try{
        const {name,description,price,image,category} = req.body;

        let cloudinaryResponse = null;

        if(image){
            cloudinaryResponse = await cloudinary.uploader.upload(image,{folder: "products"});
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url? cloudinaryResponse.secure_url: "",
            //if no value for cloudinayResponse.secure_url, we simply keep empty string.
            category
        });
        res.status(201).json(product);
    }
    catch(error){
        console.log("Error in createProduct controller", error.message);
        res.status(500).json({message: "Server Error", error: error.message});   
    }
}

export const deleteProduct = async (req,res)=>{
    try{
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.status(404).json({message: "Product not found"});
        }
        if(product.image){
            const publicId = product.image.split("/").pop().split(".")[0];
            //above will give the id for the image.
            try{
                await cloudinary.uploader.destroy(`products/${publicId}`);
                console.log("Deleted image from cloudinary");
            }
            catch(error){
                console.log("Error in deleting image from cloudinary", error.message);
            }
        }
        await Product.findByIdAndDelete(req.params.id);
        res.json({message: "Product deleted successfully"});
    }
    catch(error){
        console.log("Error in deleteProduct controller", error.message);
        res.status(500).json({message: "Server Error", error: error.message});
    }
}

export const getRecommendedProducts = async (req,res)=>{
    try{
        const products = await Product.aggregate([
            //you don't effing forget await idiot!
            {
                $sample:{size:4}
            },
            {
                $project:{
                    _id:1,
                    name:1,
                    description:1,
                    image:1,
                    price:1
                }
            }
        ])//basically gets 3 sample products from products collection from database, 
        //fills all these fileds with 1 value for each of the three obtained products.
        res.json(products);
    }
    catch(error){
        console.log("Error in getRecommendedProducts controller", error.message);
        res.status(500).json({message: "Server Error", error: error.message});
    }
}

export const getProductsByCategory = async (req,res)=>{
    const {category} = req.params;
    try{
        const products = await Product.find({category});
        res.json({products});
    }
    catch(error){
        console.log("Error in getProductsByCategory controller", error.message);
        res.status(500).json({message: "Server Error", error: error.message});
    }
}

async function updateFeaturedProuctsCache(){
     try{
        //lean() method used to return plain javaScript objects instad of full Mongoose documetns.
        //This can improve perfomance greatly.
        const featuredProducts = await Product.find({isFeatured: true}).lean();
        await redis.set('featured_products',JSON.stringigy(featuredProducts));
     }
     catch(error){
        console.log("Error in updateFeaturedProductsCache", error.message);
     }
}

export const toggleFeaturedProduct = async (req,res)=>{
    try{
        const product = await Product.findById(req.params.id);
        if(product){
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save(); //saves the changes to the database
            await updateFeaturedProuctsCache();
            res.json(updatedProduct);
        }
        else{
            res.status(404).json({message: "Product not found"});
        }
    }
    catch(error){
        console.log("Error in toggleFeaturedProduct controller", error.message);
        res.status(500).json({message: "Server Error", error: error.message});
    }
}

