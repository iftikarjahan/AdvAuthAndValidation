const express=require("express");
const router=express.Router();
const controllers=require("../controllers/allControllers");

router.get("/",controllers.allContrllers);

router.get("/page2",controllers.page2Controller);

router.get("/login",controllers.getLoginPage);

router.get("/signIn",controllers.getSignInPage);

module.exports=router;

