const Product = require('../models/productSchema')
const Categories = require('../models/categorySchema')

const multer = require('multer')

//storage
const storage = multer.diskStorage({
    destination: function(req, file , cb){
      return cb (null, "./public/uploads")
    },
    filename : function(req, file , cb){
      return cb (null, `${Date.now()}-${file.originalname}`)
    }
  })
  
  const upload = multer({storage})

 //function for rendering add product page .

exports.addProductPage = async(req,res)=>{
  let adminDetails =req.session.admin;
  const color = await Categories.find({categoryname: "Color"});
  const pattern = await Categories.find({categoryname: "Pattern"});
  const productType = await Categories.find({categoryname: "productType"});
  const productCategory = await Categories.find({categoryname: "productCategory"})
  
  res.render('admin/addProduct',{admin:true,adminDetails,color,pattern,productType,productCategory})
}

// function for rendering product editing page. admin side

exports.getEditProductPage = async(req,res)=>{
    try{
      
  const color = await Categories.find({categoryname: "Color"});
  const pattern = await Categories.find({categoryname: "Pattern"});
  const productType = await Categories.find({categoryname: "productType"});
  const productCategory = await Categories.find({categoryname: "productCategory"});
         const editProduct = await Product.findOne({_id: req.params.id});
         let adminDetails =req.session.admin;
         res.render('admin/editProduct',{editProduct,admin:true,adminDetails,color,pattern,productType,productCategory});
      }catch(error){
         console.log(error);
      }
    
  }

// function for showing product list  with listing all the products in the admin side .

exports.getAllProducts = async(req,res)=>{
    try{
        const products = await Product.find({});
        res.render('admin/products',{admin:true,products});
      }catch(error){
        console.log(error);
      }
    
}

 // function for adding new products to the page.

exports.postProduct =(req,res,next)=>{
    upload.array('image',3)(req, res, async (err) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      console.log(req.body)
      console.log(req.files)
    
    try{
      const newProduct = new Product({
          name: req.body.name,
          gender: req.body.gender,
          description: req.body.description,
          moreInfo: req.body.moreInfo,
          pattern: req.body.pattern,
          color:req.body.color,
          price: req.body.price,
          productCategory: req.body.productCategory,
          productType: req.body.productType,
          // Quantity: {
          //   small: req.body.small,
          //   medium: req.body.medium,
          //   large: req.body.large,
          //   extraLarge: req.body.extraLarge,
          // },
          category:req.body.category,
          images: req.files.map(file => file.filename),
          isActive: true
      });
      await Product.create(newProduct);
      console.log(newProduct)
      res.redirect('/admin/products');
    }catch(error){
      console.log(error);
    }
  
  });
  };

 
// function for deleting a product from the list.

exports.deleteProduct = async (req,res)=>{
  try{
   await Product.deleteOne({_id: req.params.id});
   res.redirect("/admin/products");

  }catch(error){
   console.log(error)
  }
}



// this function is used to edit the products.
exports.editProduct = async(req,res)=>{

  upload.array('image',4)(req, res, async (err) => {
   try{
    const items = await Product.updateOne({_id:req.params.id},{
      name: req.body.name,
      gender: req.body.gender,
      description: req.body.description,
      moreInfo: req.body.moreInfo,
      pattern: req.body.pattern,
      color:req.body.color,
      price: req.body.price,
      // Quantity: {
      //   small: req.body.small,
      //   medium: req.body.medium,
      //   large: req.body.large,
      //   extraLarge: req.body.extraLarge,
      // },
      category:req.body.category,
      productCategory: req.body.productCategory,
      productType: req.body.productType,
      images: req.files.map(file => file.filename),
      isActive: true
    })

    await res.redirect('/admin/products');

   }catch(error){
     console.log(error)
   }

  });

 
  
}
