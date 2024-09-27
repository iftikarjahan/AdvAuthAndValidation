const { log } = require("console");
const User = require("../models/user");
const getDb = require("../util/database").getDb;
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { ObjectId } = require("mongodb");
// email services
const nodemailer = require("nodemailer");
// transporter for sending mails
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use 'Gmail', 'Outlook', or any SMTP service
  auth: {
    user: "iftikarjahan22@gmail.com", // Your email address
    pass: "lwalpexyqwgjqmbz", // Your email password (or app-specific password if 2FA is enabled)
  },
});

exports.allContrllers = (req, res, next) => {
  res.render("page1");
};

exports.page2Controller = (req, res, next) => {
  res.render("page2");
};

exports.getLoginPage = (req, res, next) => {
  res.render("loginPage");
};

exports.getSignInPage = (req, res, next) => {
  res.render("signInPage");
};

exports.postSignInController = (req, res, next) => {
  // console.log(req.body);

  // extracting the user credentials
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  /*
    ->Once you have extracted the user credintials, create a database user
        ->If user already exists, redirect to signin page
        ->if not, craete a new document
    */
  const db = getDb();
  db.collection("users")
    .findOne({ email: email })
    .then((user) => {
      if (user) {
        return res.redirect("/login");
      } else {
        return bcrypt
          .hash(password, 12)
          .then((hashedPassword) => {
            // using this hashed password, I need to create the user and store in db
            const newUser = new User(name, email, hashedPassword);
            return newUser.save(); //save() method returns a promise
          })
          .then((result) => {
            // Send a welcome email on successful sign-in
            const mailOptions = {
              from: "iftikarjahan22@gmail.com", // Sender email
              to: email, // Recipient email
              subject: "Welcome to our authentication project", // Email subject
              text: `Hello ${name}, welcome back to our service!`, // Plain text message
              html: `<h1>Hello!</h1><p>Welcome back to our service, ${name}.</p>`, // HTML message
            };

            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error("Error sending email:", error);
                return res.status(500).send("Error sending email");
              }
              console.log("Email sent:", info.response);
            });
            res.redirect("/login");
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLoginController = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const db = getDb();
  db.collection("users")
    .findOne({ email: email })
    .then((userDoc) => {
      if (!userDoc) {
        res.redirect("/signIn");
      } else {
        bcrypt
          .compare(password, userDoc.password)
          .then((result) => {
            if (result) {
              req.session.isLoggedIn = true;
              req.session.user = userDoc;

              req.session.save((err) => {
                if (err) {
                  console.log(err);
                } else {
                  res.render("afterLogin", {
                    userName: req.session.user.name,
                    userEmail: req.session.user.email,
                  });
                }
              });
            } else {
              res.redirect("/login");
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
};

exports.getAfterLogin = (req, res, next) => {
  res.render("afterLogin", {
    userName: req.session.user.name,
    userEmail: req.session.user.email,
  });
};

exports.postLogoutController = (req, res, next) => {
  // delete the session
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.clearCookie("connect.sid");
      res.redirect("/");
    }
  });
};

exports.getResetPasswordController = (req, res, next) => {
  res.render("resetPasswordPage");
};

exports.postResetPassword = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset-password");
    } else {
      // we will get a buffer that would be used as a token for security
      const token = buffer.toString("hex");
      const db = getDb();
      db.collection("users")
        .findOne({ email: req.body.email })
        .then((user) => {
          if (!user) {
            req.flash("error", "no account with that email is found");
            return res.redirect("/reset-password");
          }
          const filterId = { _id: new ObjectId(user._id) };
          const update = {
            $set: {
              resetToken: token,
              resetTokenExpiration: Date.now() + 3600000,
            },
          };

          db.collection("users").updateOne(filterId, update);
        })
        .then((result) => {
          res.redirect("/");
          // send the reset mail link
          const mailOptions = {
            from: "iftikarjahan22@gmail.com", // Sender email
            to: req.body.email, // Recipient email
            subject: "Reset Password", // Email subject
            html: `<p>You requested to reset the password<p>
                <p>Click on this <a href="http://localhost:3300/reset-password/${token}">link</a> to reset the password</p>
            `,
          };

          // Send the email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email:", error);
              return res.status(500).send("Error sending email");
            }
            console.log("Email sent:", info.response);
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
};

exports.getResetPasswordForm = (req, res, next) => {
  const token = req.params.token;

  const db = getDb();
  db.collection("users")
    .findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      // console.log("USER: ", user);
      
      res.render("resetPasswordForm", {
        userId: user._id.toString(),
        passToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAfterResetPasswordController = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passToken = req.body.passToken;
  let resetUser;
  // console.log("userId: ",userId," passToken: ",passToken);
  

  const db = getDb();
  db.collection("users")
    .findOne({
      resetToken: passToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: new ObjectId(userId),
    })
    .then((user) => {
      // console.log("xxxXXX:  ", user);
      
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      // now you need to updated the user with the hashed password
      const filterId = { _id: new ObjectId(resetUser._id) };
      const update = {
        $set: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiration: null,
        },
      };
      res.redirect("/login");
      return db.collection("users").updateOne(filterId, update);
    })
    .then((result) => {
      // if the password gets updated, notify the user by sendind an email
      // send the reset mail link
      const mailOptions = {
        from: "iftikarjahan22@gmail.com", // Sender email
        to: resetUser.email, // Recipient email
        subject: "Reset Password", // Email subject
        html: `<p>Your password has been reset🐘🐘🐘<p>
            <p>"${newPassword}" id your new password</p>
        `,
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).send("Error sending email");
        }
        console.log("Email sent:", info.response);
      });

    })
    .catch((err) => {
      console.log(err);
    });
};
