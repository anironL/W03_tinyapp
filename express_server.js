// DEPENDENCIES //
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const { response } = require("express");
const cookieParser = require('cookie-parser');
const e = require("express");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  testUser01: {
    id: "testUser01",
    email: "test@test.com",
    password: "irrelephant"
  }
};



// FUNCTIONS //
const generateRandomString = function () {
  let randSixCharStr = "";
  let alphaNumCharSet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
  for (let x = 0; x < 6; x++) {
      randSixCharStr += alphaNumCharSet.charAt(Math.floor(Math.random() * alphaNumCharSet.length));
  } return randSixCharStr;
};

const doesInputExist = function (inputEmail, inputID) {
  for (const key in users) {   
    if (inputEmail === users[key].email || inputID === users[key].id) {
      return true;
    }
  } return false;
};

const doesShortURLExist = function (urlDatabase, inputURL) {
  for (const key in urlDatabase) {
    if (key === inputURL) {
      return true;
    }
  } return false;
}

const userIdFromEmail = function (users, inputEmail) {
  for (const user in users) {
    if (users[user].email === inputEmail) {
      return users[user].id;
    }
  } return false;
};

const userCookieLoggedIn = function (users, cookie) {
  for (const user in users) {
    if (cookie === user) {
      return true;
    }
  } return false;
}




// CODE  //
app.get("/", (req, res) => {
  res.redirect("/login")
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"]
  
  const templateVars = 
  { 
    urls: urlDatabase,
    user: users[user_id], 
  };

  if (userCookieLoggedIn(users, user_id) === false) {
    res.redirect("/login");
  } else {
  res.render("urls_index", templateVars);
  }
});

app.get("/login", (req, res) => {
  const user_id = req.cookies["user_id"]
  const templateVars = 
  { 
    user: ""
  };
  
  if (userCookieLoggedIn(users, user_id) === true) {
    res.redirect("/urls");
  } else {
  res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email
  const userPassword = req.body.password 
  let loginUserID = "";

  if (doesInputExist(userEmail, 0) === false || userEmail.length === 0 || userPassword.length === 0) {
    res.status(403).send("Invalid Parameters");
  } else {
    loginUserID = userIdFromEmail(users, userEmail)
    if (users[loginUserID].password === userPassword) {
      res.cookie('user_id', users[loginUserID].id);
      res.redirect("/urls");
    } else {
      res.status(403).send("Invalid Parameters");
    }
  }
});

app.post("/logout", (req, res) => {
  console.log("logout post event firing");
  res.clearCookie('user_id');
  console.log('Cookie (cleared) should return undefined: ', req.cookies)  
  res.redirect("/")
});

app.get("/register", (req, res) => {
  const user_id = req.cookies["user_id"]
  const templateVars = 
  { 
    user: "" 
  };
  if (userCookieLoggedIn(users, user_id) === true) {
    res.redirect("/urls");
  } else {
  res.render("urls_registration", templateVars);
  }
});

app.post("/register", (req, res) => {
  const randUserID = generateRandomString();
  const userEmail = req.body.email
  const userPassword = req.body.password

  if (doesInputExist (userEmail, randUserID) === true || userEmail.length === 0 || userPassword.length === 0) {
    res.status(400).send("Invalid Request.");
  } else {
    users[randUserID] = {
      id: randUserID,
      email: userEmail,
      password: userPassword,
    }
    console.log (users);
    res.cookie('user_id', users[randUserID].id);
    res.redirect('/urls');
  }
});

//Renders page for new URL requests: urls_new.ejs
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"]
  const templateVars = 
  { 
    urls: urlDatabase,
    user: users[user_id], 
  };
  if (userCookieLoggedIn(users, user_id) === false) {
    res.redirect("/login");
  } else { 
  res.render("urls_new", templateVars);
  }
});

//Post a new URL & generate shortURL then redirect to the summary page
app.post("/urls", (req, res) => {
  // console.log(req.params); // Log the POST request body to the console
  const user_id = req.cookies["user_id"]
  
  if (userCookieLoggedIn(users, user_id) === false) {
    res.redirect("/login");
  } else { 
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
  }
});

//Default page, shows indexed URLs in urlDatabase
app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies["user_id"]
  const templateVars = 
  { 
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[user_id], 
  };
  res.render("urls_show", templateVars);
});

//Redirect from shortURL to longURL site
app.post("/urls/:id", (req, res) => {
  const user_id = req.cookies["user_id"]
  
  if (userCookieLoggedIn(users, user_id) === false) {
    res.status(401).send("Insufficient authorization. Please log in.");
  } else {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect("/urls");
  }
});

//Redirect URL GET requests to the longURL
app.get("/u/:shortURL", (req, res) => {
  let inputURL = req.params.shortURL;
  if (doesShortURLExist(urlDatabase, inputURL) === false) {
    res.status(404).send("Requested resource not found.");
  } else {
    res.redirect(urlDatabase[req.params.shortURL]);
  }
});

//Delete urlDatabase entry for specified shortURL key
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.cookies["user_id"]

  if (userCookieLoggedIn(users, user_id) === false) {
    res.status(401).send("Insufficient authorization. Please log in.");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  }
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});