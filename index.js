const express = require("express");
const app = express(); //create an express app
const path = require("path"); //for using in express.static
const session = require("express-session");

// for connecting the database
const mongoConnect = require("./util/database").mongoConnect;

// for connecting sessions with mongodb
const MongodbStore = require("connect-mongodb-session")(session); //this is a function that returns a constructor so that we can create a new object using it

// for parsing the request
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

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






const allRoutes = require("./routes/allRoutes");


app.use(allRoutes);

const port = 3300;

mongoConnect((client) => {
  app.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`);
  });
});

