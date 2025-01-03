import mongoose from "mongoose";
import bcrypt from "bcryptjs"; //for hashing the passwords of users

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"Name is required"]
    },
    email: {
        type: String,
        required: [true,"Email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true,"Password is required"],
        minlength: [6,"Password must be at least 6 characters long"]
    },
    cartItems: [ //array of objects
        {
            quantity: {
                type: Number,
                default: 1
            },
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product" //refernce to product model
            }
        }  
    ],
    role: {
        type: String,
        enum: ["customer","admin"], //by default they are customers, by they can also be admins :)
        default: "customer"
    }   
},
{
    timestamps: true
    //adds createdat, updatedat
});


// Pre-save hook to hash the password before saving to the database
//eg jane's password 1456721 converted/hashed and saved in database as "$2a$10$TyDrMQNwCId7xsybHiuODO/cN9Pav5/igodfRUDk/VqIwi74OsCny"
userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    try{
        const salt = await bcrypt.genSalt(10); //genSalt is a method of bcrypt used for hashing //10 is the number of rounds of hashing
        this.password = await bcrypt.hash(this.password,salt); //hashing the password using the salt which is a random string of characters generated by bcrypt used to hash the password
        next();
    }
    catch(error){
        next(error);
    }
})

//password is 12345 but gave 12352 wrong => invalid credentials
userSchema.methods.comparePassword = async function(password){
    return bcrypt.compare(password,this.password);
}

const User = mongoose.model("User",userSchema); //name of model, schema
//this must placed at the bottom like this to make sure it's above prehooks and methods to work!

export default User;