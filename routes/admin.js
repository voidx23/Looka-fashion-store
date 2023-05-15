var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController')
const { adminAuth, verify } = require('../controllers/adminMiddlewares');// middleware seperated from router file.
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const categoryController = require('../controllers/categoryController')
const product = require('../models/productSchema');




router.get('/home',verify,function(req,res){
  res.render('admin/index2',{admin:true})
});



router.get('/banner',function(req,res){
  res.render('admin/banner',{admin:true})
});

// router.get('/categoryView',function(req,res){
//   res.render('admin/categoryView',{admin:true,})
// });

router.get('/addCategory',function(req,res){
  res.render('admin/category',{admin:true,})
});

router.get('/coupons',function(req,res){
  res.render('admin/coupons',{admin:true})
});
router.get('/orderStatus',function(req,res){
  res.render('admin/orderStatus',{admin:true})
});

// router.get('/products',function(req,res){
//   res.render('admin/products',{admin:true,products})
// });
router.get('/',adminAuth,function(req,res){
  res.render('admin/admin-login',{admin:true})
});

router.get('/admin-signup',adminAuth,function(req,res){
  res.render('admin/admin-signup',{admin:true})
});

// router.get('/addProduct',function(req,res){
//   res.render('admin/addProduct',{admin:true})
// })

// router.get('/categoryView',function(req,res){
//   res.render('admin/categoryView',{admin:true,})
// });


// product routes
router.get('/products',productController.getAllProducts)
router.get('/addProduct', productController.addProductPage)
router.get('/editProduct/:id',productController.getEditProductPage)
router.post('/editProduct/:id',productController.editProduct)
router.post('/addProduct',productController.postProduct)
router.delete('/deleteProduct/:id',productController.deleteProduct)

// category routes
router.get('/categoryView', categoryController.getAllCategories)
router.post('/addcategory',categoryController.postAddCategory)
//category block and unblock routes
router.get('/categoryBlock/:id',categoryController.blockCategory);
router.get('/categoryUnblock/:id',categoryController.unBlockCategory);
//category edit

router.get('/editCategory/:id',categoryController.getEditCategoryPage)
router.post('/editCategory/:id',categoryController.editCategory)












router.post('/admin-login',adminAuth,adminController.postLogin)
router.post('/admin-signup',adminAuth,adminController.postSignup)

router.get('/logout',(req,res)=>{
  req.session.adminLoggedIn = false
 req.session.destroy()
 res.redirect('/admin')
})

router.get('/user',adminController.userslist);
router.get('/userBlock/:id',adminController.blockUser);
router.get('/userUnblock/:id',adminController.unBlockUser);
router.delete('/userdelete/:id',adminController.deleteUser);




module.exports = router;
