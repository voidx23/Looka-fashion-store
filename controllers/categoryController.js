const Categories = require('../models/categorySchema')


// this function is used to get all the available categories in the database.this function brings all categories from the DB to a variable.


exports.getAllCategories = async(req,res)=>{
    try{
        const color = await Categories.find({categoryname: "Color"});
        const pattern = await Categories.find({categoryname: "Pattern"});
        const productType = await Categories.find({categoryname: "productType"});
        const productCategory = await Categories.find({categoryname: "productCategory"});
        res.render('admin/categoryView',{admin:true,color,pattern,productType,productCategory});
      }catch(error){
        console.log(error);
      }
    
}

//this function is used to add a new category to the list. this fnc will check the new category is already in the list or not.

exports.postAddCategory = async (req, res, next) => {
    try {
      let categoryValuein = req.body.categoryvalue;
      categoryValuein = categoryValuein
        .toLowerCase()
        .split(" ")
        .map((word) => {
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
      const newCategory = await Categories.findOne({
        categoryname: req.body.categorytype,
        values: categoryValuein,
      });
      if (!newCategory) {
        const newData = new Categories({
          categoryname: req.body.categorytype,
          values: categoryValuein,
        });
        Categories.create(newData);
        req.session.categoryout = "Added";
        res.status(204).redirect("/admin/addcategory");
      } else {
        req.session.categoryout = "Category already exist";
        res.status(400).redirect("/admin/addcategory");
      }
    } catch (error) {
      console.log(error);
      res.status(400);
    }
  };

//controllers for block and unblock function for category 
  exports.blockCategory = async(req,res)=>{
    await Categories.updateOne({_id: req.params.id}, { isListed: false });
    res.redirect('/admin/categoryView')
 }
 exports.unBlockCategory = async(req,res)=>{
    await Categories.updateOne({_id: req.params.id}, { isListed: true });
    res.redirect('/admin/categoryView')
}

//controllers for editing categories page.

exports.getEditCategoryPage = async(req,res)=>{
    try{
         const editCategory = await Categories.findOne({_id: req.params.id})
         let adminDetails =req.session.admin;
         res.render('admin/editCategory',{editCategory,admin:true,adminDetails})
      }catch(error){
         console.log(error);
      }
    
  }
 // function for editing the categories.
  exports.editCategory = async(req,res)=>{

   
     try{
      const items = await Categories.updateOne({_id:req.params.id},{
        categoryname:req.body.categorytype,
        values:req.body.categoryvalue
       
        })
  
      await res.redirect('/admin/categoryView');
  
     }catch(error){
       console.log(error)
     }
  
    }
  
   
    
  