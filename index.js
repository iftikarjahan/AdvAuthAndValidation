const express = require("express");
const app = express(); //create an express app
const path = require("path"); //for using in express.static

// for connecting the database
const mongoConnect = require("./util/database").mongoConnect;

// for parsing the request
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

// setting the views
app.set("views", "./views");
app.set("view engine", "ejs");

// for serving the static files
app.use(express.static(path.join(__dirname, "public")));

const allRoutes = require("./routes/allRoutes");

app.use(allRoutes);

const port = 3300;

mongoConnect((client) => {
  app.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`);
  });
});
