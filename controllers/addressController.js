const Address = require("../models/addressSchema");
const Product = require("../models/productSchema");
const Cart = require("../models/shoppingCartSchema");
const mongoose = require('mongoose');
const Order = require("../models/orderSchema")
// const Razorpay = require("razorpay");

// var instance = new Razorpay({
//     key_id: process.env.key_id,
//     key_secret: process.env.key_secret,
//   });






exports.deliveryAddressPost = async (req, res) => {
    let orders = req.body;
    console.log(orders);
    let cod = req.body['payment-method']
    console.log(cod)
    
    let addressId = new mongoose.Types.ObjectId(req.body.address);
    
    console.log(addressId);
    
    try {
      const addressDetails = await Address.findOne(
        { "address._id": addressId },
        { "address.$": 1 }
      );
      console.log(addressDetails);
      
      let filteredAddress = addressDetails.address[0]
      console.log(filteredAddress)
      console.log(filteredAddress.firstname)
  
      let cart = await Cart.findOne({userId:req.session.user._id});
      let userId =req.session.user._id;
      console.log(cart,userId);
  
  
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
            productInfo: { $arrayElemAt: ["$productInfo", 0] },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$quantity", "$productInfo.price"] } },
          },
        },
      ]).allowDiskUse(true);
  
     
     console.log(cart,'nnnnnnnnnnnnnnnnnn')
      // Store the total value in a session variable
      // req.session.total = total[0].total;
  
      console.log(total[0].total, "cart got");
      let status = req.body['payment-method'] === 'COD' ? 'placed' : 'pending'
  
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
        totalAmount: total[0].total,
        paymentstatus: status,
        deliverystatus:'not shipped',
        createdAt: new Date()
    
      });
      console.log(orderObj)
      let orderDoc = await Order.create(orderObj);
      console.log(orderDoc, 'order createad')
      let orderId = orderDoc._id
      let orderIdString = orderId.toString();
      console.log(orderIdString, 'order string')
      // Find and delete the cart items for the user
      await Cart.findOneAndDelete({ userId: cart.userId });
      if (req.body['payment-method'] == 'COD') {
      res.json({ codSuccess: true })
      }else if (req.body['payment-method'] == 'RazorPay') {
        console.log(orderDoc._id, 'iddd of order')
        var options = {
          amount: orderDoc.totalAmount * 100,  // amount in the smallest currency unit
          currency: "INR",
          receipt: orderIdString
        };
        instance.orders.create(options, function (err, order) {
          console.log(order, 'new order');
          res.json(order)
        });
      
      
      }else if (req.body['payment-method'] == 'PayPal') {
  
      let amount = Math.floor(orderDoc.totalAmount/75);
      console.log(amount,"///////")
      amount = new String(amount)
      console.log(amount,'amount 1')
      const create_payment_json = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal'
        },
        redirect_urls: {
          return_url: `http://localhost:3001/paymentsuccess/?objId=${orderId}`,
          cancel_url: `http://localhost:3001/paypal-cancel/?objId=${orderId}`
        },
        transactions: [{
          item_list: {
            items: [{
              name: 'item',
              sku: 'item',
              price: amount,
              currency: 'USD',
              quantity: 1
            }]
          },
          amount: {
            currency: 'USD',
            total: amount
          },
          description: 'This is the payment description.'
        }]
      };
  
      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          console.log(error);
        } else {
          console.log('Create Payment Response');
          console.log(payment);
          console.log(payment.links[1].href, 'link')
          console.log(payment.links,"payment link")
          console.log(payment.links[1],"payment link[1]")
          // Check that payment.links[1] exists
          if (payment.links && payment.links[1]) {
            // Redirect the user to the PayPal checkout page
            res.json({ payment });
          } else {
            console.log('Payment response missing redirect URL');
            res.status(500).send('Unable to process payment');
          }
        }
  
      });
  
    }} catch (error) {
      console.log(error);
    }
  };

  exports.deliveryAddress = async (req, res) => {
    let user = req.session.user;
    console.log(user, "id found");
    let userId = req.session.user._id;
    userId = userId.toString();
  
    const addressData = await Address.find({ user: user._id });
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

        user,
        total,
        address,
        cartItems,
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
    let userId = req.session.user._id;
    userId = userId.toString();
    console.log(user, "user here");
  
    const cartCount = req.cartCount;
    const addressData = await Address.find({ user: user._id });
  
    if (addressData && addressData.length > 0) {
      const address = addressData[0].address;
      console.log(address, "address got");
  
      try {
        res.render("user/savedAddress", {
          video: true,
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
      res.render("user/savedAddress", {
        video: true,
        user,
        cartCount,
        address: [],
      });
    }
    // Clear any existing session data for address
    req.session.address = null;
  };