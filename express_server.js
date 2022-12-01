// DEPENDENCIES //
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const { response } = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const e = require("express");
const { 
  generateRandomString,
  doesInputExist,
  doesShortURLExist,
  getUserByEmail,
  userCookieLoggedIn,
  urlsForUser
} = require("./helpers");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieSession({
  name: 'session',
  keys: ['testKey546328aqeg'], //secret
  maxAge: 24 * 60 * 60 * 1000 // Cookie Options: 24 hours
}))

const urlDatabase = {};
const users = {};

// CODE  //
//Redirects traffic from homepage to /login.
app.get("/", (req, res) => {
  res.redirect("/login");
});
//Render index page for URLs: urls_index.ejs
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = 
  { 
    urls: urlsForUser(urlDatabase, user_id),
    user: users[user_id], 
  };

  if (userCookieLoggedIn(users, user_id) === false) {
    res.redirect("/login");
  } else {
  res.render("urls_index", templateVars);
  }
});
//Render page for login: urls_login.ejs; redirect logged in users to urls page. 
app.get("/login", (req, res) => {
  const user_id = req.session.user_id
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
//Post user login credentials and generate session cookie if they match an entry in users
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  let loginUserID = "";

  if (doesInputExist(users, userEmail, 0) === false || userEmail.length === 0 || userPassword.length === 0) {
    res.status(403).send("Invalid Parameters");
  } else {
    loginUserID = getUserByEmail(users, userEmail);

    if (bcrypt.compareSync(userPassword, users[loginUserID].password) === true) {
      req.session.user_id = loginUserID;
      res.redirect("/urls");
    } else {
      res.status(403).send("Invalid Parameters");
    }
  }
});
//Log out the currently logged in user and deletes session cookies. 
app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect("/");
});
//Render page for new registrations: urls_registration.ejs
app.get("/register", (req, res) => {
  const user_id = req.session.user_id;
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
//Post a new user object to users if it does not already exist
app.post("/register", (req, res) => {
  const randUserID = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);

  if (doesInputExist (users, userEmail, randUserID) === true || userEmail.length === 0 || userPassword.length === 0) {
    res.status(400).send("Invalid Request.");
  } else {
    users[randUserID] = {
      id: randUserID,
      email: userEmail,
      password: hashedPassword,
    };
    req.session.user_id = randUserID;
    res.redirect('/urls');
  }
});
//Render page for new URL requests: urls_new.ejs
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = 
  { 
    urls: urlsForUser(urlDatabase, user_id),
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
  const user_id = req.session.user_id;
  if (userCookieLoggedIn(users, user_id) === false) {
    res.redirect("/login");
  } else { 
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: user_id
  };
    res.redirect(`/urls/${shortURL}`);
  }
});
//Default page, shows indexed URLs in urlDatabase
app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = 
  { 
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[user_id], 
    urls: urlDatabase
  };
  res.render("urls_show", templateVars);
});
//Edit the longURL associated with a shortURL
app.post("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  const urls = urlsForUser(urlDatabase, user_id);

  if (userCookieLoggedIn(users, user_id) === false) {
    res.status(401).send("Insufficient authorization. Please log in.");
  } else if (Object.keys(urls).includes(req.params.id)) {
    let shortURL = req.params.id;

    urlDatabase[shortURL] = {
      longURL: req.body.newURL,
      userID: user_id
    };
    res.redirect("/urls");
  } else {
    res.status(401).send("Account not authorized.");
  }
});
//Redirect URL GET requests to the longURL
app.get("/u/:shortURL", (req, res) => {
  let inputURL = req.params.shortURL;
  if (doesShortURLExist(urlDatabase, inputURL) === false) {
    res.status(404).send("Requested resource not found.");
  } else {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
});
//Delete urlDatabase entry for specified shortURL key
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session.user_id;
  const urls = urlsForUser(urlDatabase, user_id);
  
  if (userCookieLoggedIn(users, user_id) === false) {
    res.status(401).send("Insufficient authorization. Please log in.");
  } else if (Object.keys(urls).includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(401).send("Account not authorized.");
  }
});
//Server active message
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});