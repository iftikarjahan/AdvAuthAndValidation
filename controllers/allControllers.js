const User=require("../models/user");
const getDb=require("../util/database").getDb;
const bcrypt=require("bcrypt");
// const { use } = require("../routes/allRoutes");

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

exports.postSignInController=(req,res,next)=>{
    // console.log(req.body);
    
    // extracting the user credentials
    const name=req.body.name;
    const email=req.body.email;
    const password=req.body.password;
    /*
    ->Once you have extracted the user credintials, create a database user
        ->If user already exists, redirect to signin page
        ->if not, craete a new document
    */ 
    const db=getDb();
    db.collection("users").findOne({email:email}).then(user=>{
        if(user){
            return res.redirect("/login");
        }
        else{
            return bcrypt.hash(password,12).then(hashedPassword=>{
                // using this hashed password, I need to create the user and store in db
                const newUser=new User(name,email,hashedPassword);
                return newUser.save();   //save() method returns a promise
            }).then(result=>{
                res.redirect("/login");
            })
        }
    }).catch(err=>{
        console.log(err);
    })
    
}

exports.postLoginController=(req,res,next)=>{
    const email=req.body.email;
    const password=req.body.password;

    const db=getDb();
    db.collection("users").findOne({email:email}).then(userDoc=>{
        if(!userDoc){
            res.redirect("/signIn");
        }
        else{
            bcrypt.compare(password,userDoc.password).then(result=>{
                if(result){
                    req.session.isLoggedIn=true;
                    req.session.user=userDoc;

                    req.session.save(err=>{
                        if(err){
                            console.log(err);
                        }
                        else{
                            res.redirect("/afterLogin");
                        }
                    })
                }
                else{
                    res.redirect("/login");
                }
            }).catch(err=>{
                console.log(err);
            })
        }
    })
}

exports.getAfterLogin=(req,res,next)=>{
    res.render("afterLogin",{
        userName:req.session.user.name,
        userEmail:req.session.user.email
    });
}

exports.postLogoutController=(req,res,next)=>{
    // delete the session
    req.session.destroy(err=>{
        if(err){
            console.log(err);
        }
        else{
            res.clearCookie("connect.sid");
            res.redirect("/");
        }
    })
}


