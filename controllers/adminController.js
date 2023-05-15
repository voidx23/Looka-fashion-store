const bcrypt = require('bcrypt')
const Admin = require('../models/adminSchema')
const User = require('../models/userSchema')

//this function works when we click the login button on the login page.
// this function checks whether the email entered by the admin is in the database or not and store that in a variable and checks if the email is in the database.
// and if the case is true the password entered by the admin is compared with the password that stored in the DB.
//if the password matches it redirects to admin dashboard page else redirected to login page with an error msg.
exports.postLogin = async (req,res)=>{
    try{
        // console.log(req.body,'nnnnnn');
        const newAdmin = await Admin.findOne({email:req.body.email});
            console.log(newAdmin);
            if(newAdmin){

                bcrypt.compare(req.body.password, newAdmin.password).then((status)=>{
                    if(status){
                        console.log("User Exist");
                        req.session.admin = newAdmin;
                        req.session.adminLoggedIn = true;
                        console.log(newAdmin);
                        res.redirect("/admin/home");
                    }else{
                        req.session.loginErr = "invalid Email or Password";
                        console.log("password is not matching");
                        res.status(400).redirect("/admin/admin-login");
                    }
                });
            }
        }  catch(error){
            console.log(error);
    }
        };


// this function is for admin side signup, it works when we click the sign up button. when the button is clicked, the function first checks if the mail given by the admin exist on DB .=> normal signup procedures.
        exports.postSignup = async (req,res,next)=>{
            console.log("hai");
            try{
                console.log("signup");
                const existingAdmin = await Admin.findOne({name:req.body.name})
                if(existingAdmin){
                    console.log(`Admin with name ${req.body.name} already exist`);
        
                    res.redirect('/admin/admin-signup')
        
                }
                else{
                    const hashedPassword = await bcrypt.hash(req.body.password, 10);
                    console.log(hashedPassword);
                    const newAdmin = new Admin({
                        id:Date.now().toString(),
                        name:req.body.name,
                        mobile:req.body.mobile,
                        email:req.body.email,
                        password:hashedPassword,
                        status:false,
                        isActive:true,
                    });
                    Admin.create(newAdmin);
                    console.log(newAdmin);
                    res.redirect("/admin/admin-login");
        
                }
            }catch(error){
                console.log(error);
                res.redirect("/admin/admin-signup");
            }
        };

        //admin side user controller

// this function is for getting the user details with pagination
exports.userslist = async(req,res)=>{
    try{
      let adminDetails =req.session.admin;
      let currPage = parseInt(req.query.page)
        let usersLists = await User.find();
        let userCount;
        let perPage = 2

        let usersList = await User.find().count()
            .then(docs => {
                    userCount = docs

                    return User.find().skip((currPage - 1) * perPage).limit(perPage)
            })
            let pages = Math.ceil(userCount/perPage)
        console.log(usersList);
        res.render('admin/users',{usersList,admin:true,adminDetails,noShow:true,pages,currPage});
      }catch(error){
        console.log(error);
      }
    
  }
  
  //admin side user management below 
  //this function is used to block a user.
  
   exports.blockUser = async(req,res)=>{
      await User.updateOne({_id: req.params.id}, { isActive: false });
      res.redirect('/admin/user')
   }

   // this function is used to unblock a blocked user.
   exports.unBlockUser = async(req,res)=>{
      await User.updateOne({_id: req.params.id}, { isActive: true });
      res.redirect('/admin/user')
  }
  
  //this function is used for deleting a user.. not currently using now 
  exports.deleteUser = async (req,res)=>{
    try{
  
     await User.deleteOne({_id: req.params.id});
     
     res.redirect("/admin/users");
  
    }catch(error){
     console.log(error)
    }
  }