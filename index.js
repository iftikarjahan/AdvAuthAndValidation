const express = require("express");
const app = express(); //create an express app
const path = require("path"); //for using in express.static
const session = require("express-session");
const multer=require("multer");
// const flash=require("connect-flash");

// for connecting the database
const mongoConnect = require("./util/database").mongoConnect;

// for connecting sessions with mongodb
const MongodbStore = require("connect-mongodb-session")(session); //this is a function that returns a constructor so that we can create a new object using it

// configuring storage for multer
const fileStorage=multer.diskStorage({
  /*
  ->This file storage gives us more control as we can use it to validate that we support
  only certain file types like png and jpg
  */ 
  destination:(req,file,cb)=>{
    cb(null,"papa/");
  },
  filename:(req,file,cb)=>{
    cb(null, new Date().toISOString().replace(/:/g, '-') + "-" + file.originalname);
  }
})
// configuring file filters 
const fileFilter=(req,file,cb)=>{
  if(file.mimetype==="image/jpeg" || file.mimetype==="image/jpg" || file.mimetype==="image/png" ){
    cb(null,true);
  }
  else{
    cb(null,false);
  }
}


// for parsing the request
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single("image"));

// setting the views
app.set("views", "./views");
app.set("view engine", "ejs");

// for serving the static files
app.use(express.static(path.join(__dirname, "public")));

const store = new MongodbStore({
  uri: "mongodb+srv://iftikarjahan22:mj8snvDwnzrbQWZr@cluster0.11hbt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  collection: "sessions",
});

// setting up the session middleware
app.use(
  session({
    secret: "papa", // A secret key to sign the session ID cookie
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create a session until something is stored
    cookie: { secure: false }, // Set to true if using HTTPS
    store: store,
  })
);

const flash=require("connect-flash");
app.use(flash());




const allRoutes = require("./routes/allRoutes");


app.use(allRoutes);

const port = 3300;

mongoConnect((client) => {
  app.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`);
  });
});

