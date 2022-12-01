//Generates a 6 char long alphanumeric string using: a-z, A-Z, and 0-9.
const generateRandomString = function () {
  let randSixCharStr = "";
  let alphaNumCharSet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
  for (let x = 0; x < 6; x++) {
      randSixCharStr += alphaNumCharSet.charAt(Math.floor(Math.random() * alphaNumCharSet.length));
  } return randSixCharStr;
};
//Checks if inputted email and ID match existing entries.
const doesInputExist = function (usersDatabase, inputEmail, inputID) {
  for (const key in usersDatabase) {   
    if (inputEmail === usersDatabase[key].email || inputID === usersDatabase[key].id) {
      return true;
    }
  } return false;
};
//Checks if the inputted URL matches existing entries.
const doesShortURLExist = function (urlDatabase, inputURL) {
  for (const key in urlDatabase) {
    if (key === inputURL) {
      return true;
    }
  } return false;
}
//Returns the user ID associated with the inputted email.
const getUserByEmail = function (usersDatabase, inputEmail) {
  for (const user in usersDatabase) {
    if (usersDatabase[user].email === inputEmail) {
      return usersDatabase[user].id;
    }
  } return false;
};
//Checks if the cookie matches existing entries. 
const userCookieLoggedIn = function (usersDatabase, cookie) {
  for (const user in usersDatabase) {
    if (cookie === user) {
      return true;
    }
  } return false;
}
//Returns all shortURLs associated with the inputted user ID. 
const urlsForUser = function (urlDatabase, inputID) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === inputID) {
      userURLs[shortURL] = urlDatabase[shortURL]
    }
  } return userURLs;
} 

module.exports = {
  generateRandomString,
  doesInputExist,
  doesShortURLExist,
  getUserByEmail,
  userCookieLoggedIn,
  urlsForUser
};