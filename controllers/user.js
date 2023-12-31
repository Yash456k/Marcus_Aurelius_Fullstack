require("dotenv").config();
const collection = require("../model/mongodb");
const bcrypt = require("bcrypt");
const { setUser } = require("../service/auth");

async function handleUserLogin(req, res) {
  try {
    const check = await collection.findOne({ name: req.body.name });
    if (!check) return res.render("login", { error: "User does not exist" });
    if (await bcrypt.compare(req.body.password, check.password)) {
      const token = setUser(check);
      res.cookie("uid", token, {
        httpOnly: true,
        maxAge: 1.44e7,
        secure: true,
      });

      return res.redirect("/");
    } else
      return res.render("login", { error: "Wrong password buddy, try again" });
  } catch (error) {
    return res.send("problem logging in");
  }
}

async function handleUserSignup(req, res) {
  const UserExist = await collection.findOne({ name: req.body.name });
  if (UserExist) {
    return res.render("signup", { error: "Username already exists !" });
  }
  if (req.body.password.length < 7) {
    return res.render("signup", {
      error: "Password should be atleast 8 characters",
    });
  } else if (req.body.name.length <= 5) {
    return res.render("signup", {
      error: "Username should be atleast 5 characters",
    });
  } else {
    const hashPass = await bcrypt.hash(req.body.password, 10);
    const data = {
      name: req.body.name,
      password: hashPass,
      quotesViewed: [],
      bookmarks: [],
    };

    await collection.insertMany([data]);

    return res.redirect("/user/login");
  }
}

function handleUserLogout(req, res) {
  try {
    res.cookie("uid", "", { maxAge: 0 });
    req.user = null;
    return res.redirect("/");
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  handleUserLogin,
  handleUserSignup,
  handleUserLogout,
};
