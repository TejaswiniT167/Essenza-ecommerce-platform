import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import {stripe} from "../lib/stripe.js"

export const createCheckoutSession= async (req,res)=>{
    try{
        const {products,couponCode} = req.body;

       //console.log(products,couponCode);

        if(!Array.isArray(products)|| products.length===0){
            res.status(400).json({message: "Invalid or empty products array"});
        }

        let totalAmount = 0;
        const lineItems = products.map(product=>{
            const amount = Math.round(product.price*100) //stripe wants us to send in the format of cents 1$=100cents
            totalAmount += amount*product.quantity;

            return{ //in the format stripe wants as below.
                price_data:{
                    currency: "usd",
                    product_data:{
                        name: product.name,
                        images: [product.image],
                    },
                    unit_amount: amount
                },
                quantity: product.quantity || 1
            }
        });
        let coupon = null;
        if(couponCode){
            coupon = await Coupon.findOne({code:couponCode,userId:req.user._id,isActive:true});
            if(coupon){
                totalAmount -= Math.round(totalAmount*(coupon.discountPercentage/100));
                //we'll send this coupon to stripe to apply the discount by it generating a stripe usable coupon.
                //which the stripe uses to apply the discount to the total amount itself.
                //the calculation we are doing here is for checking if the total amount after discounting i.e total amount spent
                // the user reached a certain limit, so we can assign him/her a coupon to use later :)
            }
        }

        //console.log(coupon);
        //console.log(req.user._id.toString());
        //console.log(lineItems);
        const session = await stripe.checkout.sessions.create({ //it's sessions not sesions dumbass typo
            payment_method_types: ["card",],
            line_items: lineItems, //we made above
            mode: "payment", //can be subscription,etc check docs of stripe api.
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`, //session_id not session-id typooo
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            //redirects to abvoe urls when the user/client performs abvoe actions on stripe payment page.
            discounts: coupon 
            ? [
                {
                    coupon: await createStripeCoupon(coupon.discountPercentage),
                    //the custom coupon we created is converted to stripe usable coupon and sent to stripe
                },
            ]:[],
            metadata:{ //we'll be using this later.
                userId: req.user._id.toString(),
                couponCode: couponCode || "", //couponCode so we can deactivate it on successful payment for this userId
				products: JSON.stringify( //sending products list so we can use this for building order object later :)
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
            },
        });

        if(totalAmount>= 20000){ //20000 cents = $200
            await createNewCoupon(req.user._id);
        }
        res.status(200).json({id: session.id, totalAmount: totalAmount/100}); //to get amount spent in $.
    }//with this session.id sent to the user, the user can access the stripe checkout page, where all these product details, totalamount after discount,
    //all are displayed, where they can proceed with the payment/cancel :) which again will redirect as described in above stripe success_url and cancel_url.
    catch(error){
        console.log("Error in createCheckoutSession controller",error.message);
        res.status(500).json({message: "Server Error", error: error.message});
    }
}

//on checkout success, deactivates if any coupon used,
//also creates the order object and stores in orders collection for the payment made 
//i.e Order object with the details of user_id, product details, amount, stripeSessionId
export const checkoutSuccess = async (req, res) => {
	try {
		const { sessionId } = req.body;
		const session = await stripe.checkout.sessions.retrieve(sessionId);
        //this session is created in above function.

		if (session.payment_status === "paid") {
			if (session.metadata.couponCode) { //if payment successful and used coupon, deactivate it
				await Coupon.findOneAndUpdate(
					{
						code: session.metadata.couponCode,
						userId: session.metadata.userId,
					},
					{
						isActive: false,
					}
				);
			}

			// create a new Order for the above payment made :)
			const products = JSON.parse(session.metadata.products); //parsing the stringified products sent in above function's session created.
			const newOrder = new Order({
				user: session.metadata.userId,
				products: products.map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: product.price,
				})),
				totalAmount: session.amount_total / 100, // convert from cents to dollars,
				stripeSessionId: sessionId,
			});

			await newOrder.save();

			res.status(200).json({
				success: true,
				message: "Payment successful, order created, and coupon deactivated if used.",
				orderId: newOrder._id,
			});
		}
	} catch (error) {
		console.error("Error processing successful checkout:", error);
		res.status(500).json({ message: "Error processing successful checkout", error: error.message });
	}
}


async function createStripeCoupon(discountPercentage){
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    })
    return coupon.id; //returning id of stripe usable coupon generated with given discountpercentage.
}

async function createNewCoupon(userId){
    await Coupon.findOneAndDelete({userId: userId});
    //so it ensures a user having only one coupon at at time by removing previously active/inactive coupons!
    const newCoupon = new Coupon({
        code: "GIFT"+Math.random().toString(36).substring(2,8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now()+10*24*60*60*1000), //30 days
        userId: userId
    })

    await newCoupon.save();
    return newCoupon;
    //so basically a new coupon which user can use later is created when user makes a certain purchase
    //or do something which earns him/her this coupon :)
}


