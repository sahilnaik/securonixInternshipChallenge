const usersRoutes = require("./users");
const constructorMethod = (app) => {
  app.use("/", usersRoutes);

  app.use("*", (req, res) => {
    res.status(404).json({ error: "Not found" });
  });
};
module.exports = constructorMethod;
