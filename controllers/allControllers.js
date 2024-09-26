const User = require("../models/user");
const getDb = require("../util/database").getDb;
const bcrypt = require("bcrypt");
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
              text: `Hello ${email}, welcome back to our service!`, // Plain text message
              html: `<h1>Hello!</h1><p>Welcome back to our service, ${email}.</p>`, // HTML message
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
