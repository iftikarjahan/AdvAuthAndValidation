const express=require("express");
const router=express.Router();
const controllers=require("../controllers/allControllers");



router.get("/",controllers.allContrllers);

router.get("/page2",controllers.page2Controller);

router.get("/login",controllers.getLoginPage);

router.get("/signIn",controllers.getSignInPage);

router.post("/signin",controllers.postSignInController);

router.post("/login",controllers.postLoginController);

router.get("/afterLogin",controllers.getAfterLogin);

router.post("/logout",controllers.postLogoutController);

module.exports=router;

