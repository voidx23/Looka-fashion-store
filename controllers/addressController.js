const Address = require("../models/addressSchema");
const Product = require("../models/productSchema");
const Cart = require("../models/shoppingCartSchema");
const mongoose = require('mongoose');
const Order = require("../models/orderSchema");
const Coupon = require("../models/couponSchema");
const Wallet = require('../models/walletSchema')
const { render } = require("ejs");
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});
// const Razorpay = require("razorpay");

// var instance = new Razorpay({
//     key_id: process.env.key_id,
//     key_secret: process.env.key_secret,
//   });






//create or add address
exports.deliveryAddressPost = async (req, res) => {
  let orders = req.body;

  let cod = req.body['payment-method'];

  let myCoupon = req.body.couponAmount;
  myCoupon = myCoupon.replace("₹", "");


  let addressId = new mongoose.Types.ObjectId(req.body.address);



  try {
    const addressDetails = await Address.findOne(
      { "address._id": addressId },
      { "address.$": 1 }
    );


    let filteredAddress = addressDetails.address[0]


    let cart = await Cart.findOne({ userId: req.session.user._id });
    let userId = req.session.user._id;

    console.log("")



    let total = await Cart.aggregate([
      {
        $match: { userId: userId },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          item: { $toObjectId: "$products.item" },
          quantity: "$products.quantity",
          currentPrice: "$products.currentPrice",
          tax: "$products.tax",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "item",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $project: {
          item: 1,
          quantity: 1,
          currentPrice: 1,
          tax: 1,
          productInfo: { $arrayElemAt: ["$productInfo", 0] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$quantity", "$productInfo.price"] } },
          totalWithTax: {
            $sum: {
              $multiply: ["$quantity", { $add: ["$tax", "$currentPrice"] }],
            },
          },
        },
      },
    ]).allowDiskUse(true);


    //console.log(cart,'nnnnnnnnnnnnnnnnnn')
    // Store the total value in a session variable
    // req.session.total = total[0].total;
    // var matchCouponId = await Coupon.findOne({
    //   couponCode: req.body.couponId,

    // });
    // let discountAmount = matchCouponId.discount;

    let status = req.body['payment-method'] === 'COD' ? 'pending' : 'pending'

    let orderObj = new Order({
      deliveryDetails: {
        firstname: filteredAddress.firstname,
        lastname: filteredAddress.lastname,
        state: filteredAddress.state,
        streetaddress: filteredAddress.streetaddress,
        appartment: filteredAddress.appartment,
        town: filteredAddress.town,
        zip: filteredAddress.zip,
        mobile: filteredAddress.mobile,
        email: filteredAddress.email,
        radio: filteredAddress.radio

      },
      userId: cart.userId,
      paymentMethod: req.body['payment-method'],
      products: cart.products,
      totalAmount: total[0].totalWithTax,
      paymentstatus: status,
      deliverystatus: 'not shipped',
      discount: myCoupon,
      createdAt: new Date()

    });

    let orderDoc = await Order.create(orderObj);
    console.log(orderDoc, "💕💕💕");
    let orderId = orderDoc._id
    let orderIdString = orderId.toString();
    const wallet = await Wallet.findOne({ userId })
    let balance = wallet.balance;


    // Find and delete the cart items for the user
    await Cart.findOneAndDelete({ userId: cart.userId });
    if (req.body['payment-method'] == 'COD') {
      // await Cart.findOneAndDelete({ userId: cart.userId });
      res.json({ codSuccess: true })
    } else if (req.body['payment-method'] == 'RazorPay') {

      if (myCoupon) {

        var options = {
          amount: (orderDoc.totalAmount - myCoupon) * 100,  // amount in the smallest currency unit
          currency: "INR",
          receipt: orderIdString
        };
      } else {

        var options = {
          amount: orderDoc.totalAmount * 100,  // amount in the smallest currency unit
          currency: "INR",
          receipt: orderIdString
        };

      }

      console.log(options.amount, "👌👌👌")
      instance.orders.create(options, function (err, order) {
        console.log("before res");
        res.json(order)
      });


    } else if (req.body['payment-method'] == 'Wallet') {

      if (orderDoc.totalAmount <= balance) {

        balance -= orderDoc.totalAmount;

        wallet.balance = balance;

        await wallet.save();

        res.json({ walletSuccess: true });
      } else {

        res.json({ emptyWallet: true });

      }



    }
    // else if (req.body['payment-method'] == 'PayPal') {

    //   let amount = Math.floor(orderDoc.totalAmount / 75);
    //   amount = new String(amount)
    //   const create_payment_json = {
    //     intent: 'sale',
    //     payer: {
    //       payment_method: 'paypal'
    //     },
    //     redirect_urls: {
    //       return_url: `http://localhost:3001/paymentsuccess/?objId=${orderId}`,
    //       cancel_url: `http://localhost:3001/paypal-cancel/?objId=${orderId}`
    //     },
    //     transactions: [{
    //       item_list: {
    //         items: [{
    //           name: 'item',
    //           sku: 'item',
    //           price: amount,
    //           currency: 'USD',
    //           quantity: 1
    //         }]
    //       },
    //       amount: {
    //         currency: 'USD',
    //         total: amount
    //       },
    //       description: 'This is the payment description.'
    //     }]
    //   };

    //   paypal.payment.create(create_payment_json, function (error, payment) {
    //     if (error) {
    //       console.log(error);
    //     } else {
    //       console.log('Create Payment Response');
    //       console.log(payment);
    //       console.log(payment.links[1].href, 'link')
    //       console.log(payment.links, "payment link")
    //       console.log(payment.links[1], "payment link[1]")
    //       // Check that payment.links[1] exists
    //       if (payment.links && payment.links[1]) {
    //         // Redirect the user to the PayPal checkout page
    //         res.json({ payment });
    //       } else {
    //         console.log('Payment response missing redirect URL');
    //         res.status(500).send('Unable to process payment');
    //       }
    //     }

    //   });

    // }
  } catch (error) {
    console.log(error);
  }
};

exports.deliveryAddress = async (req, res) => {
  let user = req.session.user;
  let username = user ? user.name : null;
  const cartCount = req.cartCount;
  console.log(user, "id found");
  let userId = user ? user._id : null;
  // userId = userId.toString();

  const addressData = await Address.find({ user: userId });
  console.log(addressData.length, "adress lenght");
  if (addressData.length === 0) {
    return res.redirect("/savedAddress");
  }
  console.log(addressData);
  const address = addressData[0].address;
  console.log(address, "address found");

  console.log(userId, "user");

  try {

    cartItems = await Cart.aggregate([
      {
        $match: { userId },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          item: { $toObjectId: "$products.item" },
          quantity: "$products.quantity",
          size: "$products.size",
          currentPrice: "$products.currentPrice",
          tax: "$products.tax",
          unique_id: "$products._id",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "item",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $project: {
          unique_id: 1,
          item: 1,
          quantity: 1,
          size: 1,
          currentPrice: 1,
          tax: 1,
          productInfo: { $arrayElemAt: ["$productInfo", 0] },
        },
      },
    ]);
    console.log(cartItems, "cartItemssss");

    let total = await Cart.aggregate([
      {
        $match: { user: req.session.userId },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          item: { $toObjectId: "$products.item" },
          size: "$products.size",
          currentPrice: "$products.currentPrice",
          tax: "$products.tax",
          quantity: "$products.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "item",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $project: {
          item: 1,
          size: 1,
          currentPrice: 1,
          tax: 1,
          quantity: 1,
          productInfo: { $arrayElemAt: ["$productInfo", 0] },
        },
      },
      {
        $group: {
          _id: null,

          totalTax: { $sum: { $multiply: ["$quantity", "$tax"] } },
          total: { $sum: { $multiply: ["$quantity", "$currentPrice"] } },
          totalWithTax: {
            $sum: {
              $multiply: ["$quantity", { $add: ["$tax", "$currentPrice"] }],
            },
          },
        },
      },
    ]);

    // Store the total value in a session variable
    // req.session.total = total[0].total;

    console.log(total, "cart got");
    res.render("user/address", {
      userloggedIn: req.session.userloggedIn,
      user,
      total,
      address,
      cartItems,
      username,
      user,
      cartCount,
    });
  } catch (error) {
    console.log(error);
  }
};


// exports.savedAddressget = async (req,res)=>{
//   let user = req.session.user
//   console.log(user,'user here')
//    // Access cartCount value from req object
//    const cartCount = req.cartCount;
//    const addressData  = await Address.find()
//    const address = addressData[0].address;

//    console.log(address,"address got")
//   try {
//     res.render('user/savedAddress',{video:true,user,cartCount,address})
//   } catch (error) {
//     console.log(error)
//   }
// }
exports.savedAddressPost = async (req, res) => {
  let user = req.session.user._id;
  console.log(user, "user found");
  console.log(req.body);
  let addaddress = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    state: req.body.state,
    streetaddress: req.body.address,
    appartment: req.body.appartment,
    town: req.body.town,
    zip: req.body.postcode,
    mobile: req.body.mobile,
    email: req.body.email,
    radio: req.body.optradio,
  };
  try {
    const data = await Address.findOne({ user: user });
    if (data) {
      data.address.push(addaddress);
      const updated_data = await Address.findOneAndUpdate(
        { user: user },
        { $set: { address: data.address } },
        { returnDocument: "after" }
      );
      console.log(updated_data, "updated address collection");
    } else {
      const address = new Address({
        user: req.session.user._id,
        address: [addaddress],
      });
      const address_data = await address.save();
      console.log(address_data, "address collection");
    }

    res.json(true);
  } catch (error) {
    console.log(error);
  }
};
exports.editSavedAddress = async (req, res) => {
  try {
    let user = req.session.user;
    // Access cartCount value from req object
    const cartCount = req.cartCount;
    console.log(req.params.id); // Check if id is coming in params
    const address = await Address.findOne({ "address._id": req.params.id });
    // Check if address is coming or not
    // if (!address) {
    //   return res.status(404).send("Address not found");
    // }
    const selectedAddress = address.address.find(
      (addr) => addr._id.toString() === req.params.id
    );
    console.log(selectedAddress, "selectedAddress");
    res.render("user/editSavedAddress", {
      video: true,
      user,
      cartCount,
      address: selectedAddress,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};


exports.savedAddressget = async (req, res) => {
  let user = req.session.user;

  let username = user ? user.name : null;
  let userId = user ? user._id : null;
  // userId = userId.toString();
  console.log(user, "user here");

  const cartCount = req.cartCount;
  const addressData = await Address.find({ user: userId });

  if (addressData && addressData.length > 0) {
    const address = addressData[0].address;
    console.log(address, "address got");


    try {
      res.render("user/savedAddress", {
        userloggedIn: req.session.userloggedIn,

        username,
        user,
        cartCount,
        address,
      });
    } catch (error) {
      console.log(error);
    }
    // json(true);
  } else {
    console.log("No address data found");
    console.log(cartCount);
    res.render("user/savedAddress", {
      user,
      userloggedIn: req.session.userloggedIn,
      username,
      cartCount,
      address: [],
    });
  }
  // Clear any existing session data for address
  req.session.address = null;
};