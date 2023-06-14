const bcrypt = require('bcrypt')
const User = require('../models/userSchema')
const Product = require("../models/productSchema")
const Order = require("../models/orderSchema")
const Categories = require("../models/categorySchema")
const Address = require("../models/addressSchema")
const Wallet = require("../models/walletSchema")
const mongoose = require("mongoose");
const otp = require('../controllers/otp');
const { cartCount } = require('./shoppingCartController');
const ObjectId = mongoose.Types.ObjectId;
// const swal = require('sweetalert2');



// this function is used for signing up new user 
exports.postSignup = async (req, res, next) => {
  console.log("hai");
  try {
    console.log("signup");
    const existingUser = await User.findOne({ name: req.body.name })
    if (existingUser) {
      console.log(`User with name ${req.body.name} already exist`);

      res.redirect('/login')

    }
    else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      console.log(hashedPassword);
      const newUser = new User({
        id: Date.now().toString(),
        name: req.body.name,
        mobile: req.body.mobile,
        email: req.body.email,
        password: hashedPassword,
        status: false,
        isActive: true,
      });
      const createdUser = await User.create(newUser);

      const userId = createdUser.id;


      const newWallet = new Wallet({
        userId: userId,
        balance: 0,
        
      })



      Wallet.create(newWallet);

      res.redirect("/login");

    }
  } catch (error) {
    console.log(error);
    res.redirect("/signup");
  }
};




// this function is used to login for the user



exports.postLogin = async (req, res) => {
  try {
    console.log(req.body.name);
    const newUser = await User.findOne({ email: req.body.email });
    console.log(newUser);

    if (newUser.isActive) {
      bcrypt.compare(req.body.password, newUser.password).then((status) => {
        if (status) {
          console.log("User Exist");
          req.session.user = newUser;
          req.session.userloggedIn = true;
          console.log(newUser);
          res.redirect("/");
        } else {
          req.session.loginErr = "Invalid Email or Password";
          console.log("Password is not matching");
          res.status(400).redirect("/login");
        }
      });
    } else {

      req.session.loginErr = "Your account is blocked"
      res.redirect('/login')
      // const inactiveUser = await User.findOne({ email: req.body.email, isActive: false });
      // if (inactiveUser) {
      //   req.session.loginErr = "Your account is inactive.";
      //   console.log("Account is inactive");
      //   res.redirect("/login");
      // } else {
      //   req.session.loginErr = "Invalid Email or Password";
      //   console.log("User not found");
      //   res.status(400).redirect("/login");
      // }
    }
  } catch (error) {
    console.log(error);
    req.session.loginErr = "An error occurred";
    res.redirect("/login");
  }
};



// this function is used to get the login page


exports.getLogin = function (req, res, next) {
  let user = req.session.user;

  res.render('user/login', { noShow: false, user, loginErr: req.session.loginErr })
  req.session.loginErr = false;
  req.session.save()
};

// this is used to get the signup page
exports.getSignup = function (req, res, next) {
  res.render('user/signup', { noShow: true })
};

// this function is used to check whether the user already existing or not by using findone method of mongp db.
exports.emailVerify = async (req, res, next) => {
  console.log("inside function")
  const response = {};
  try {
    const vUser = await User.findOne({
      $or: [{ email: req.body.email }, { mobile: req.body.mobile }],
    }).exec();
    if (vUser) {
      response.success = false;
      res.status(500).send({
        response,
        success: false,
        message: "User found",
      });
    } else {
      res.status(200).send({ success: true, message: "No user found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error verifying user" });
  }
},

  //otp send and verifications
  exports.sendOtp = async (req, res, next) => {
    const response = {};
    try {
      console.log(req.body.mobile);
      if (!req.session.otP) {
        req.session.otP = Math.floor(100000 + Math.random() * 900000);
      } else {
      }
      console.log(req.session.otP);
      otp
        .OTP(req.body.mobile, req.session.otP)
        .then((response) => {
          console.log("aaaaa");
          response.success = true;
          console.log(response);

          res.status(200).send({
            response,
            success: true,
            message: "OTP Sent successfully",
          });
        })
        .catch((error) => {
          console.log("gggg");
          res
            .status(500)
            .send({ success: false, message: "Error sending OTP" });
        });
    } catch (error) {
      console.log(error);
    }
  },
  // to varity the otp entered by the user with the otp generated by the service.
  exports.verifyOtp = async (req, res, next) => {
    const response = {};
    try {
      if (parseInt(req.body.userOtp) === req.session.otP) {
        res.status(200).send({
          success: true,
          response,
          message: "OTP verified successfully",
        });
      } else {
        req.session.errmsg = "Invalid Otp";
        res.status(500).send({ success: false, message: "Invalid Otp" });
      }
    } catch (error) {
      console.log(error);
    }
  }


exports.paymentVerify = async (req, res) => {
  try {
    let details = req.body;
    // console.log(req.body,'hello this is my body')
    const crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", "mcxM7RFNnbvhdJCPIVujYBc8");
    hmac.update(
      details['payment[razorpay_order_id]'] +
      "|" +
      details['payment[razorpay_payment_id]']
    );
    hmac = hmac.digest("hex");

    let orderResponse = details['order[receipt]']
    let orderObjId = new ObjectId(orderResponse);

    if (hmac === details['payment[razorpay_signature]']) {
      await Order.updateOne(
        { _id: orderObjId },
        {
          $set: {
            paymentstatus: "paid",
          },
        }
      );

      console.log("Payment is successful");


      res.json({ status: true });

    } else {
      await Order.updateOne(
        { _id: orderObjId },
        {
          $set: {
            paymentstatus: "failed",
          },
        }
      );
      console.log("Payment is failed");
      res.json({ status: false, errMsg: "" });
    }
  } catch (error) {
    console.log(error, "error");
    res.status(500).send("Internal server error");
  }
};

exports.paymentFailed = async (req, res) => {

  try {

    var cartCount = req.cartCount;
    const user = req.session.user || ''
    const username = user.name;
    res.render("user/paymentFailed", { other: true, cartCount, username });

  } catch (error) {

    console.log(error);

  }
};





// this function is used to render the landing page
exports.index = async function (req, res, next) {
  try {

    const products = await Product.find();
    var cartCount = req.cartCount;
    const user = req.session.user || ''
    const username = user.name;

    res.render('user/index', { userloggedIn: req.session.userloggedIn, products, cartCount, username })
  } catch (error) {
    console.log(error);
  }
};
// this function is also used to render home page 

exports.main = async function (req, res, next) {
  try {

    const products = await Product.find();
    var cartCount = req.cartCount;
    console.log(cartCount)
    const user = req.session.user || ''
    const username = user.name;


    res.render('user/index', { userloggedIn: req.session.userloggedIn, products, cartCount, username })
  } catch (error) {
    console.log(error);
  }
};


exports.mobileVerifyForgotPass = async (req, res, next) => {
  const response = {};
  try {
    const vUser = await User.findOne({ mobile: req.body.mobile }).exec();

    if (vUser) {
      req.session.user = vUser;
      res.status(200).send({
        success: true, message: "User found"

      });
    } else {
      response.success = false;
      res.status(500).send({
        response,
        success: false,
        message: "User found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error verifying user" });
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.session.user._id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the password
    await User.updateOne({ _id: userId }, { password: hashedPassword });

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred. Please try again later.",
      });
  }
};





//this function is used to render the product page.
// exports.home=async function (req, res, next) {
//   try{
//     let page = req.query.page
//     let perPage = 4
//     let docCount
//     const products = await Product.find().count()
//             .then(total => {
//               docCount = total
//               return Product.find().skip((page-1) * perPage).limit(perPage)
//             })
//     var cartCount = req.cartCount;
//     const user = req.session.user || ''
//     const username = user.name;
//     console.log(username);


//     res.render('user/productMen',{
//       userloggedIn:req.session.userloggedIn,
//       products,
//       cartCount,
//       username,
//       totalPages: Math.ceil(docCount / perPage),
//       page,
//       perPage
//     })
//   }catch(error){
//     console.log(error);
//  }
// };

exports.homeSearch = async function (req, res, next) {
  try {
    const color = await Categories.find({ categoryname: "Color" });
    const pattern = await Categories.find({ categoryname: "Pattern" });
    const productType = await Categories.find({ categoryname: "productType" });
    const productCategory = await Categories.find({ categoryname: "productCategory" });
    const page = parseInt(req.query.page) || 1;
    const perPage = 9;
    const docCount = await Product.countDocuments({});
    const products = await Product.find()
      .skip((page - 1) * perPage)
      .limit(perPage);
    const cartCount = req.cartCount;
    const user = req.session.user || '';
    const username = user.name;

    res.json({
      userloggedIn: req.session.userloggedIn,
      products,
      cartCount,
      username,
      totalPages: Math.ceil(docCount / perPage),
      currentPage: page,
      perPage,
      color,
      pattern,
      productType,
      productCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.home = async function (req, res, next) {
  try {
    const color = await Categories.find({ categoryname: "Color" });
    const pattern = await Categories.find({ categoryname: "Pattern" });
    const productType = await Categories.find({ categoryname: "productType" });
    const productCategory = await Categories.find({ categoryname: "productCategory" });
    const page = parseInt(req.query.page) || 1;
    const perPage = 9;
    const docCount = await Product.countDocuments({});
    const products = await Product.find()
      .skip((page - 1) * perPage)
      .limit(perPage);
    const cartCount = req.cartCount;
    const user = req.session.user || '';
    const username = user.name;

    res.render('user/productMen', {
      userloggedIn: req.session.userloggedIn,
      products,
      cartCount,
      username,
      totalPages: Math.ceil(docCount / perPage),
      currentPage: page,
      perPage,
      color,
      pattern,
      productType,
      productCategory,

    });
  } catch (error) {
    console.log(error);
  }
};

exports.homeSorted = async function (req, res, next) {
  try {
    const color = await Categories.find({ categoryname: "Color" });
    const pattern = await Categories.find({ categoryname: "Pattern" });
    const productType = await Categories.find({ categoryname: "productType" });
    const productCategory = await Categories.find({ categoryname: "productCategory" });
    const page = parseInt(req.query.page) || 1;
    const perPage = 9;

    const docCount = await Product.countDocuments({});
    const sorted = req.query.sorted;

    console.log(sorted, "sorted");

    let sort = { createdAt: -1 };

    if (sorted) {
      let sortField = "price";
      let sortOrder = 1;

      if (sorted == "htl") {
        sortOrder = -1;
      } else if (sorted == "lth") {
        sortOrder = 1;
      } else if (sorted == "popularity") {
        sortOrder = 1;
      } else {
        sortField = "createdAt";
        sortOrder = -1;
      }
      sort = { [sortField]: sortOrder };
    }
    // Construct the filter object
    req.sort = sort;
    const products = await Product.find()
      .sort(sort)
      .skip((page - 1) * perPage)
      .limit(perPage);
    const cartCount = req.cartCount;
    const user = req.session.user || '';
    const username = user.name;

    res.render('user/productMen', {
      userloggedIn: req.session.userloggedIn,
      products,
      cartCount,
      username,
      totalPages: Math.ceil(docCount / perPage),
      currentPage: page,
      perPage,
      color,
      pattern,
      productType,
      productCategory,

    });
  } catch (error) {
    console.log(error);
  }
};




//this function is used to show the detailed product view. it will render the detailed product view page.
exports.detail = async function (req, res, next) {
  try {


    let id = req.params.id;
    var cartCount = req.cartCount;

    const oneProduct = await Product.findById(id);
    const user = req.session.user || ''
    const username = user.name;

    res.render('user/productDetail', { userloggedIn: req.session.userloggedIn, oneProduct, cartCount, username })
  } catch (error) {
    console.log(error);
  }
};



exports.userProfile = async function (req, res) {
  try {
    const address = await Address.findOne({ user: req.session.user._id });
    const wallet = await Wallet.findOne({ userId: req.session.user._id });

    const cartCount = req.cartCount;
    const user = req.session.user || ''
    const username = user.name;
    const useremail = user.email;


    console.log(cartCount, "💕💕💕");

    res.render('user/userProfile', { username, useremail, userloggedIn: req.session.userloggedIn, cartCount, address, wallet })
  } catch (error) {
    console.log(error);

  }
}
