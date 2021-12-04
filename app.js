const express = require("express");
const session = require("express-session");
const app = express();
const static = express.static(__dirname + "/public");
const { engine } = require("express-handlebars");
const mongoose = require("mongoose");
const configRoutes = require("./routes");
//await mongoose.connect("mongodb://localhost/my_database");
app.use("/public", static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: "AuthCookie",
    secret: "some secret string!",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/private", (req, res, next) => {
  if (!req.session.user) {
    //return res.redirect("/");
    //  return res.render("pages/login", { title: "Login" });
    return res.status(403).render("pages/error", {
      title: "Unauthorized Access",
      error: "Login to access private page",
    });
  } else {
    next();
  }
});
app.use((req, res, next) => {
  date = new Date();
  console.log(
    `[${date.toUTCString()}]:\t${req.method}\t${req.originalUrl}\t\t${
      req.session.user ? "(Authenticated User)" : "(Non-Authenticated User)"
    }`
  );
  next();
});

app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
