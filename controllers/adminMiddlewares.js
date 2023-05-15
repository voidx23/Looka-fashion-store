function adminAuth(req,res, next){
    if(req.session && req.session.admin && req.session.adminLoggedIn){
      res.redirect("/admin/home")
    }else{
      next();
    }
  }
  
  function verify(req,res, next){
    if(req.session && req.session.admin && req.session.adminLoggedIn){
      next();
    }else{
      res.redirect("/admin")
    }
  }



  module.exports = {
    adminAuth,
    verify,
  };