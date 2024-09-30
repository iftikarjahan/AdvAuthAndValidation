const express = require("express");
const router = express.Router();
const controllers = require("../controllers/allControllers");
const { check } = require("express-validator");
const User = require("../models/user");
const getDb = require("../util/database").getDb;

router.get("/", controllers.allContrllers);

router.get("/page2", controllers.page2Controller);

router.get("/login", controllers.getLoginPage);

router.get("/signIn", controllers.getSignInPage);

router.post(
  "/signin",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email address!")
      .custom((value, { req }) => {
        // Here I will add the asynchrounous checks
        const db = getDb();
        return db
          .collection("users")
          .findOne({ email: value })
          .then((user) => {
            if (user) {
              return Promise.reject(
                "The email already exists. Please signIn with a diffrent email"
              );
            }
          });
      }),
    check("name")
      .isLength({ min: 4, max: 200 })
      .withMessage(
        "Name of the user should be at least 4 characters long and maximum of 200 characters"
      ),
    check("password")
      .isStrongPassword({ minLength: 6, minLowercase: 1, minUppercase: 1 })
      .withMessage(
        "Password should be at least 6 characters long and should also contain 1 lowecase and 1 uppercase character"
      ),
    check("confirm-password").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match");
      }
      return true;
    }),
  ],
  controllers.postSignInController
);

router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Please enter a valid email id"),
    check("password")
      .isStrongPassword({ minLength: 6, minLowercase: 1, minUppercase: 1 })
      .withMessage(
        "Password should be at least 6 characters long and should also contain 1 lowecase and 1 uppercase character"
      ),
  ],
  controllers.postLoginController
);

router.get("/afterLogin", controllers.getAfterLogin);

router.post("/logout", controllers.postLogoutController);

router.get("/reset-password", controllers.getResetPasswordController);

router.post("/reset-password", controllers.postResetPassword);

router.get("/reset-password/:token", controllers.getResetPasswordForm);

router.post(
  "/after-reset-password",
  controllers.postAfterResetPasswordController
);

module.exports = router;
