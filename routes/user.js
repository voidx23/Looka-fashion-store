var express = require('express');
// const { trusted } = require('mongoose');
var router = express.Router();
const userController = require('../controllers/userController')
const shoppingCartController = require('../controllers/shoppingCartController')
const addressController = require('../controllers/addressController')
const {userauth , verify } = require('../controllers/userMiddlewares');







router.get('/logout',(req,res)=>{
  req.session.loggedIn = false
 req.session.destroy()
//  req.session.sessionActive=false
 res.redirect('/')
})

/* GET home page. */


router.get('/about', function(req, res, next){
  res.render('user/about',{userloggedIn:req.session.userloggedIn})
})

router.get('/testimonial', function(req, res, next){
  res.render('user/testimonials',{userloggedIn:req.session.userloggedIn})
})

// router.get('/product', userController.home)

router.get('/blogList', function(req, res, next){
  res.render('user/blogList',{userloggedIn:req.session.userloggedIn})
})

router.get('/contact', function(req, res, next){
  res.render('user/contact',{userloggedIn:req.session.userloggedIn})
})


router.get('/forgotPass', function(req,res, next){
  res.render('user/forgot-pass',{noShow:true})
})

router.get('/enterNewpass', function(req,res, next){
  res.render('user/enterNewpass')
})

// router.get('/otp', function(req,res, next){
//   res.render('user/otpVerification',{noShow:true})
// })


// router.get('/page',function(req,res,next){
//   res.render('user/product-test')
// })
// router.get('/',userauth ,function(req, res, next) {
//   // let user = req.session.user;
//   res.render('user/index',{userloggedIn:req.session.userloggedIn});
// });

// router.get('/home',verify ,function(req, res, next) {
  
//   res.render('user/index',{userloggedIn:req.session.userloggedIn});
// });
// router.get('/productDetail',function(req,res,next){
//   res.render('user/productDetail')
// })

// router.get('/shoppingCart',function(req,res,next){
//   res.render('user/shoppingCart')
// })


router.get('/shoppingCart',verify,shoppingCartController.cartCount,shoppingCartController.getCartProducts)
router.get('/addtocart/:id',shoppingCartController.isLogin,shoppingCartController.addtoCart,shoppingCartController.cartCount)//,shoppingCartController.cartCount
// router.post('/changeProductQuantity',shoppingCartController.changeProductQuantity)
router.post('/changeProductQuantity',shoppingCartController.changeProductQuantity)
router.post('/removeItem',shoppingCartController.removeItem)


router.get('/signup',userController.getSignup);
router.get('/login',userauth,userController.getLogin )
router.get('/',userauth,shoppingCartController.cartCount,userController.index)
router.get('/home',verify,shoppingCartController.cartCount,userController.main)
router.get('/productMen',shoppingCartController.cartCount,userController.home)
router.get('/productDetail/:id',shoppingCartController.cartCount,userController.detail)
router.get('/product-size-selector',shoppingCartController.productSizeSelector)
// router.get('/productWomen',userauth,userController.Women)
// router.get('/shoppingCart',)
router.post('/signup',userController.postSignup);
router.post('/login',userController.postLogin);
router.post("/sendotp", userController.sendOtp);
router.post("/verifyotp", userController.verifyOtp);
router.post("/emailexists", userController.emailVerify);

//checkout
router.get('/address',addressController.deliveryAddress)
router.post('/address',addressController.deliveryAddressPost) // url for check out page 
//user saved address
router.get('/savedAddress',shoppingCartController.cartCount,addressController.savedAddressget)
router.post('/savedAddress',addressController.savedAddressPost)
router.get('/editSavedAddress/:id',shoppingCartController.cartCount,addressController.editSavedAddress)
// router.post('/editSavedAddress/:id',addressController.editSavedAddressPost)
router.get('orderPlaced')




module.exports = router;

