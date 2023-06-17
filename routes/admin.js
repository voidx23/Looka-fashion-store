var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController');
const { adminAuth, verify } = require('../controllers/adminMiddlewares');// middleware seperated from router file.
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const orderController = require('../controllers/orderController');
const product = require('../models/productSchema');
const offerController = require('../controllers/offerController');
const couponController = require('../controllers/couponController');
const bannerController = require('../controllers/bannerController')











router.get('/coupons', function (req, res) {
  res.render('admin/coupons', { admin: true })
});

router.get('/', adminAuth, function (req, res) {
  res.render('admin/admin-login', { admin: true })
});

router.get('/admin-signup', adminAuth, function (req, res) {
  res.render('admin/admin-signup', { admin: true })
});



// product routes
router.get('/products', productController.getAllProducts)
router.get('/addProduct', productController.addProductPage)
router.get('/editProduct/:id', productController.getEditProductPage)
router.post('/editProduct/:id', productController.editProduct)
router.post('/addProduct', productController.postProduct)
router.delete('/deleteProduct/:id', productController.deleteProduct)

router.get('/salesReport', verify, adminController.salesReport)
router.post('/Sales-report', adminController.getSalesReport)


router.get('/orderStatus', orderController.OrdersAdmin)
router.post('/order-details/', orderController.orderDetailsAdmin);

router.get('/home', adminController.dashboard);
router.post('/getSalesData', adminController.getSalesData);
router.post('/editProduct/:id', productController.editProduct)
router.post('/addProduct', productController.postProduct)
router.delete('/deleteProduct/:id', productController.deleteProduct)

// category managment routes
router.get('/categoryView', categoryController.getAllCategories)
router.post('/addcategory', categoryController.postAddCategory)
router.get('/categoryBlock/:id', categoryController.blockCategory);
router.get('/categoryUnblock/:id', categoryController.unBlockCategory);
router.get('/editCategory/:id', categoryController.getEditCategoryPage)
router.post('/editCategory/:id', categoryController.editCategory)

//offer management routes
router.get("/offers", verify, offerController.offer)
router.post("/offers", verify, offerController.postoffer)

router.get('/coupon', couponController.couponPage)
router.post('/coupon', couponController.postCoupon)
router.patch('/coupon-disable/:id', couponController.disableCoupon)
router.patch('/coupon-enable/:id', couponController.enableCoupon)
router.get('/edit-coupon', couponController.editCoupon)
router.post('/update-coupon', couponController.updateCoupon)

/* Banners */
router.get('/banner', verify, bannerController.getBanner)
router.get('/add-banner', verify, bannerController.getBannerForm)
router.get('/edit-banner/:id', verify, bannerController.getEditBanner)
router.post('/add-banner', verify, bannerController.addBanner)
router.post('/edit-banner', verify, bannerController.postEditBanner)
router.patch('/banner/change-status', verify, bannerController.patchBannerStatus)
router.delete('/delete-banner', verify, bannerController.deleteBanner)






//signup and login setups.
router.post('/admin-login', adminAuth, adminController.postLogin)
router.post('/admin-signup', adminAuth, adminController.postSignup)

router.get('/logout', (req, res) => {
  req.session.adminLoggedIn = false
  req.session.destroy()
  res.redirect('/admin')
})

router.get('/user', adminController.userslist);
router.get('/userBlock/:id', adminController.blockUser);
router.get('/userUnblock/:id', adminController.unBlockUser);
router.delete('/userdelete/:id', adminController.deleteUser);




module.exports = router;
