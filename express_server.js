// DEPENDENCIES //
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const { response } = require("express");
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const templateVars = {
  username: req.cookies["username"]
  // ... any other vars
};
res.render("urls_index", templateVars);

const users = {};


// FUNCTIONS //
const generateRandomString = function () {
  let randSixCharStr = "";
  let alphaNumCharSet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
  for (let x = 0; x < 6; x++) {
      randSixCharStr += alphaNumCharSet.charAt(Math.floor(Math.random() * alphaNumCharSet.length));
  }
  return randSixCharStr;
};

// CODE  //
app.get("/", (req, res) => {
  res.redirect("/urls");
  console.log("Cookie Set")
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


app.post("/login", (req, res) => {
  console.log("login post event is executing");
  res.cookie('username', req.body.userID);
  console.log('Cookies: ', req.cookies)  
  res.redirect("/urls")
});



app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase }
  res.render("urls_new", templateVars);
});

//Post a new URL & generate shortURL
app.post("/urls", (req, res) => {
  console.log(req.params); // Log the POST request body to the console
  //res.send(req.body.longURL); // confirmed that the longURL is posted
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] } //req.body.newURL }; //href="#" };
  res.render("urls_show", templateVars);
  //res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect("/urls");
});


//Redirect URL GET requests to the longURL
app.get("/u/:shortURL", (req, res) => {
  //const longURL = urlDatabase[req.params.shortURL]; 
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  //console.log (req.params.shortURL, "will be deleted.");
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});