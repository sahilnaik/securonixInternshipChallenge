const express = require("express");
const router = express.Router();
const usersData = require("../data/users");
function hasWhiteSpace(pass) {
  return pass.indexOf(" ") >= 0;
}

router.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/private");
  } else {
    res.render("pages/login", {
      title: "Log In",
    });
  }
});

router.post("/login", async (req, res) => {
  const getData = req.body;
  let username = getData.username;
  let password = getData.password;
  if (username == null || password == null) {
    res.status(400);
    res.render("pages/login", {
      title: "Login Page",
      error: "Input should not be empty",
    });
    return;
  }
  if (typeof username !== "string") {
    res.status(400);
    res.render("pages/login", {
      title: "Login Page",
      error: `Input username not a string`,
    });
    return;
  }
  if (typeof password !== "string") {
    res.status(400);
    res.render("pages/login", {
      title: "Login Page",
      error: `Input password is not a string`,
    });
    return;
  }
  if (username.trim() === "") {
    res.status(400);
    res.render("pages/login", {
      title: "Login Page",
      error: `Empty username`,
    });
    return;
  }
  if (password.trim() === "") {
    res.status(400);
    res.render("pages/login", {
      title: "Login Page",
      error: `Empty password`,
    });
    return;
  }

  username = username.trim();
  username = username.toLowerCase();
  password = password.trim();
  if (!username.match(/^[0-9a-z]+$/)) {
    res.status(400);
    res.render("pages/login", {
      title: "Login Page",
      error: "Username should only contain alphanumeric characters",
    });
    return;
  }

  if (hasWhiteSpace(username)) {
    res.status(400);
    res.render("pages/login", {
      title: "Login Page",
      error: "Username should not contain spaces",
    });
    return;
  }

  if (hasWhiteSpace(password)) {
    res.status(400);
    res.render("pages/login", {
      title: "Login Page",
      error: "Password should not contain spaces",
    });
    return;
  }
  if (username.length < 4) {
    res.status(400);
    res.render("pages/login", {
      title: "Login Page",
      error: "Username should be atleast 4 characters long",
    });
    return;
  }
  if (password.length < 6) {
    res.status(400);
    res.render("pages/login", {
      title: "Login Page",
      error: "Password should be at least 6 characters",
    });
    return;
  }
  try {
    const userValidate = await usersData.checkUser(username, password);
    if (userValidate["authenticated"] === true) {
      req.session.user = { username: username };
      return res.redirect("/private");
    } else {
      res.status(500).json({ error: "Internal Server error" });
      return;
    }
  } catch (e) {
    res.status(400);
    res.render("pages/login", { title: "Login Page", error: e });
    return;
  }
});

router.get("/signup", (req, res) => {
  if (req.session.user) {
    res.redirect("/private");
  } else {
    res.render("pages/signup", {
      title: "Sign Up",
    });
    return;
  }
});
router.post("/signup", async (req, res) => {
  const getData = req.body;
  let username = getData.username;
  let password = getData.password;
  if (username == null || password == null) {
    res.status(400);
    res.render("pages/signup", {
      title: "Signup Page",
      error: "Input should not be empty",
    });
    return;
  }
  if (typeof username !== "string") {
    res.status(400);
    res.render("pages/signup", {
      title: "Signup Page",
      error: `Input username not a string`,
    });
    return;
  }
  if (typeof password !== "string") {
    res.status(400);
    res.render("pages/signup", {
      title: "Signup Page",
      error: `Input password is not a string`,
    });
    return;
  }
  if (username.trim() === "") {
    res.status(400);
    res.render("pages/signup", {
      title: "Signup Page",
      error: `Empty username`,
    });
    return;
  }
  if (password.trim() === "") {
    res.status(400);
    res.render("pages/signup", {
      title: "Signup Page",
      error: `Empty password`,
    });
    return;
  }

  username = username.trim();
  username = username.toLowerCase();
  password = password.trim();
  if (!username.match(/^[0-9a-z]+$/)) {
    res.status(400);
    res.render("pages/signup", {
      title: "Signup Page",
      error: "Username should only contain alphanumeric characters",
    });
    return;
  }

  if (hasWhiteSpace(username)) {
    res.status(400);
    res.render("pages/signup", {
      title: "Signup Page",
      error: "Username should not contain spaces",
    });
    return;
  }

  if (hasWhiteSpace(password)) {
    res.status(400);
    res.render("pages/signup", {
      title: "Signup Page",
      error: "Password should not contain spaces",
    });
    return;
  }
  if (username.length < 4) {
    res.status(400);
    res.render("pages/signup", {
      title: "Signup Page",
      error: "Username should be atleast 4 characters long",
    });
    return;
  }
  if (password.length < 6) {
    res.status(400);
    res.render("pages/signup", {
      title: "Signup Page",
      error: "Password should be at least 6 characters",
    });
    return;
  }
  try {
    const userCreate = await usersData.createUser(username, password);
    if (userCreate["userInserted"] === true) {
      res.redirect("/");
    } else {
      res.status(500);
      res.render("pages/error", {
        title: "Error",
        error: "Internal server error",
      });
      return;
    }
  } catch (e) {
    if (e === "Internal Server Error") {
      res.status(500);
      res.render("pages/error", {
        title: "Error",
        error: "Internal server error",
      });
      return;
    } else {
      res.status(400);
      res.render("pages/signup", {
        title: "Signup Page",
        error: e,
      });
      return;
    }
  }
});

router.get("/private", async (req, res) => {
  if (req.session.user) {
    try {
      const check = await usersData.checkAccessed(req.session.user.username);
      if (check.formAccessed === true) {
        return res.redirect("/dashboard");
      } else {
        return res.render("pages/private", {
          title: "Private",
          user: req.session.user.username,
        });
      }
    } catch (e) {
      return res.render("pages/error", {
        title: "Error",
        error: e,
      });
    }
  } else {
    return res.redirect("/");
  }
});
router.post("/private", async (req, res) => {
  const getData = req.body;
  let username = req.session.user.username;

  try {
    const updatedInfo = await usersData.categories(getData, username);
    if (updatedInfo["updated"] === true) {
      res.redirect("/dashboard");
    } else {
      res.redirect("/private");
    }
  } catch (e) {
    res.status(500);
    res.render("pages/error", {
      title: "Error",
      error: e,
    });
  }
});

router.get("/edit", async (req, res) => {
  if (req.session.user) {
    const getSessionData = await usersData.getSessionData(
      req.session.user.username
    );
    let user = req.session.user.username;
    let est = getSessionData.define[0].est;
    let acq = getSessionData.manage[0].acq;
    let cur = getSessionData.manage[0].cur;
    let fr = getSessionData.manage[0].fr;
    let hir = getSessionData.manage[0].hir;
    let scale = getSessionData.manage[0].scale;
    let soc = getSessionData.manage[0].soc;
    let thr = getSessionData.manage[0].thr;
    let utFull = getSessionData.use[0].utFull;
    let utSys = getSessionData.use[0].utSys;
    let utWin = getSessionData.use[0].utWin;

    return res.render("pages/edit", {
      title: "Edit values",
      user: req.session.user.username,

      est: est,
      acq: acq,
      cur: cur,
      fr: fr,
      hir: hir,

      utFull: utFull,
      utSys: utSys,
      utWin: utWin,

      scale: scale,
      soc: soc,
      thr: thr,
      user: user,
    });
  } else {
    return res.redirect("/");
  }
});

router.get("/dashboard", async (req, res) => {
  if (req.session.user) {
    const getSessionData = await usersData.getSessionData(
      req.session.user.username
    );
    let overallDefine = getSessionData.define[0].overallDefine;
    let user = req.session.user.username;
    let est = getSessionData.define[0].est;
    let acq = getSessionData.manage[0].acq;
    let cur = getSessionData.manage[0].cur;
    let fr = getSessionData.manage[0].fr;
    let hir = getSessionData.manage[0].hir;
    let scale = getSessionData.manage[0].scale;
    let soc = getSessionData.manage[0].soc;
    let thr = getSessionData.manage[0].thr;
    let overallManage = getSessionData.manage[0].overallManage;

    let overall = getSessionData.overall;
    let utFull = getSessionData.use[0].utFull;
    let utSys = getSessionData.use[0].utSys;
    let utWin = getSessionData.use[0].utWin;
    let overallUse = getSessionData.use[0].overallUse;

    return res.render("pages/dashboard", {
      title: "Dashboard",
      user: req.session.user.username,
      overallDefine: overallDefine,
      est: est,
      acq: acq,
      cur: cur,
      fr: fr,
      hir: hir,
      overallManage: overallManage,
      overall: overall,
      utFull: utFull,
      utSys: utSys,
      utWin: utWin,
      overallUse: overallUse,
      scale: scale,
      soc: soc,
      thr: thr,
      user: user,
    });
  } else {
    return res.redirect("/");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.clearCookie("AuthCookie");
  res.render("pages/logout", { title: "Logged out" });
});
module.exports = router;
