import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        requried: true
    },
    description:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        min:0,
        requried: true
    },
    image:{
        type: String,
        required: [true,'Image is required'] //custom message if image is not given!
    },
    category:{
        type: String,
        requierd: true
    },
    isFeatured:{ //if it's gonna be shown in featured slider or not
        type: Boolean,
        default: false
    }
},
{timeseries: true});

const Product = mongoose.model("Product",productSchema);

export default Product;