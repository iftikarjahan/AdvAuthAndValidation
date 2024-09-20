exports.allContrllers=(req,res,next)=>{
    res.render("page1");
}

exports.page2Controller=(req,res,next)=>{
    res.render("page2");
}

exports.getLoginPage=(req,res,next)=>{
    res.render("loginPage");
}

exports.getSignInPage=(req,res,next)=>{
    res.render("signInPage");
}