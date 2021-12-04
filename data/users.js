const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const bcrypt = require("bcryptjs");
const saltRounds = 16;
let { ObjectId } = require("mongodb");
function hasWhiteSpace(pass) {
  return pass.indexOf(" ") >= 0;
}
function errorHandle(pass) {
  if (typeof pass !== "string") {
    throw `${pass} not a string`;
  }
  if (pass.trim() === "") {
    throw `Empty input`;
  }
}
async function createUser(username, password) {
  if (arguments.length !== 2) {
    throw `Check arguments passed`;
  }
  if (username == null || password == null) {
    throw `Input should not be empty`;
  }
  errorHandle(username);
  errorHandle(password);
  username = username.trim();
  username = username.toLowerCase();
  password = password.trim();
  if (!username.match(/^[0-9a-z]+$/)) {
    throw `Username should only contain alphanumeric characters`;
  }

  if (hasWhiteSpace(username)) {
    throw `Username should not contain spaces`;
  }

  if (hasWhiteSpace(password)) {
    throw `Password should not contain spaces`;
  }
  if (username.length < 4) {
    throw `Username should be atleast 4 characters long`;
  }
  if (password.length < 6) {
    throw `Password should be at least 6 characters`;
  }

  const usersCollection = await users();
  const duplicateUsername = await usersCollection.findOne({
    username: username,
  });

  if (duplicateUsername !== null) {
    throw `Username already exists`;
  }
  const hash = await bcrypt.hash(password, saltRounds);
  let define = [];
  let manage = [];
  let use = [];
  let overall = 0;
  let formAccessed = false;
  let newUser = {
    username: username,
    password: hash,
    define: define,
    manage: manage,
    use: use,
    overall: overall,
    formAccessed: formAccessed,
  };
  let resObj = { userInserted: true };
  const insertInfo = await usersCollection.insertOne(newUser);
  if (insertInfo.insertedCount === 0) {
    throw `Internal Server Error`;
  } else {
    return resObj;
  }
}

async function checkUser(username, password) {
  if (arguments.length !== 2) {
    throw `Check arguments passed`;
  }
  if (username == null || password == null) {
    throw `Input should not be empty`;
  }
  errorHandle(username);
  errorHandle(password);
  username = username.trim();
  username = username.toLowerCase();
  password = password.trim();
  if (!username.match(/^[0-9a-z]+$/)) {
    throw `Username should only contain alphanumeric characters`;
  }
  if (hasWhiteSpace(username)) {
    throw `Username should not contain spaces`;
  }
  if (hasWhiteSpace(password)) {
    throw `Password should not contain spaces`;
  }
  if (username.length < 4) {
    throw `Username should be atleast 4 characters long`;
  }
  if (password.length < 6) {
    throw `Password should be at least 6 characters`;
  }
  const usersCollection = await users();
  const findUser = await usersCollection.findOne({ username: username });
  if (findUser === null) {
    throw `Either the username or password is invalid`;
  }
  const passwordCorrect = await bcrypt.compare(password, findUser.password);
  let resObj = { authenticated: true };
  if (!passwordCorrect) {
    throw `Either the username or password is invalid`;
  } else {
    return resObj;
  }
}

async function categories(formData, username) {
  if (arguments.length !== 2) {
    throw `Check arguments passed`;
  }
  if (formData == null) {
    throw `Input should not be empty`;
  }
  if (typeof formData !== "object") {
    throw `Input should be an object`;
  }
  if (username == null) {
    throw `Input should not be empty`;
  }
  if (typeof username !== "string") {
    throw `Input should be a string`;
  }
  if (username.trim() === "") {
    throw `Input should not be empty`;
  }
  if (hasWhiteSpace(username)) {
    throw `Username should not contain spaces`;
  }
  const usersCollection = await users();
  const findUser = await usersCollection.findOne({ username: username });
  if (findUser === null) {
    throw `Invalid`;
  } else {
    let est = parseInt(formData.est);
    let cur = parseInt(formData.cur);
    let acq = parseInt(formData.acq);
    let hir = parseInt(formData.hir);
    let fr = parseInt(formData.for);
    let scale = parseInt(formData.scale);
    let soc = parseInt(formData.soc);
    let thr = parseInt(formData.thr);
    let utFull = parseInt(formData.utFull);
    let utSys = parseInt(formData.utSys);
    let utWin = parseInt(formData.utWin);

    let total =
      est + cur + acq + hir + fr + scale + soc + thr + utFull + utSys + utWin;
    let avg = total / 11;
    let scaleoFFour = avg / 20 - 1;
    scaleoFFour = round(scaleoFFour);
    let overallDefine = est / 20 - 1;
    overallDefine = round(overallDefine);
    let manageTotal = cur + hir + fr + acq + soc + thr + scale;
    let manageAvg = manageTotal / 7;
    let overallManage = manageAvg / 20 - 1;
    overallManage = round(overallManage);
    let useTotal = utFull + utSys + utWin;
    let useAvg = useTotal / 3;
    let overallUse = useAvg / 20 - 1;
    overallUse = round(overallUse);
    let defineObj = {
      est: est,
      overallDefine: overallDefine,
    };
    let defineArr = [defineObj];
    let manageObj = {
      cur: cur,
      hir: hir,
      fr: fr,
      acq: acq,
      soc: soc,
      thr: thr,
      scale: scale,
      overallManage: overallManage,
    };
    let manageArr = [manageObj];
    let useObj = {
      utFull: utFull,
      utSys: utSys,
      utWin: utWin,
      overallUse: overallUse,
    };
    let useArr = [useObj];
    const updatedInfo = await usersCollection.updateOne(
      { username: username },
      {
        $set: {
          overall: scaleoFFour,
          define: defineArr,
          manage: manageArr,
          use: useArr,
          formAccessed: true,
        },
      }
    );
    
      return { updated: true };
    
  }
}

async function checkAccessed(username) {
  if (arguments.length !== 1) {
    throw `Check arguments passed`;
  }
  if (username == null) {
    throw `Input should not be empty`;
  }
  if (typeof username !== "string") {
    throw `Input should be a string`;
  }
  if (username.trim() === "") {
    throw `Input should not be empty`;
  }
  if (hasWhiteSpace(username)) {
    throw `Username should not contain spaces`;
  }
  const usersCollection = await users();
  const findUser = await usersCollection.findOne({ username: username });
  if (findUser === null) {
    throw `Invalid`;
  }
  if (findUser.formAccessed === true) {
    let obj = {
      formAccessed: true,
    };
    return obj;
  } else {
    let obj = {
      formAccessed: false,
    };
    return obj;
  }
}

async function getSessionData(username) {
  if (arguments.length !== 1) {
    throw `Check arguments passed`;
  }
  if (username == null) {
    throw `Input should not be empty`;
  }
  if (typeof username !== "string") {
    throw `Input should be a string`;
  }
  if (username.trim() === "") {
    throw `Input should not be empty`;
  }
  if (hasWhiteSpace(username)) {
    throw `Username should not contain spaces`;
  }
  const usersCollection = await users();
  const findUser = await usersCollection.findOne({ username: username });
  if (findUser === null) {
    throw `Invalid`;
  } else {
    let overall = findUser.overall;
    let define = findUser.define;
    let manage = findUser.manage;
    let use = findUser.use;
    let formAccessed = findUser.formAccessed;
    let dataObj = {
      overall: overall,
      define: define,
      manage: manage,
      use: use,
      formAccessed: formAccessed,
    };
    return dataObj;
  }
}

function round(num) {
  var m = Number((Math.abs(num) * 100).toPrecision(15));
  return (Math.round(m) / 100) * Math.sign(num);
}
module.exports = {
  createUser,
  checkUser,
  categories,
  getSessionData,
  checkAccessed,
};
