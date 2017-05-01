var express = require("express");
var passport = require("passport");

var ensureAuthenticated = require("./utils/ensureAuthentication");

var pagesController = require("./controllers/pages");
var pollController = require("./controllers/poll");
var authenticationController = require("./controllers/authentication");

var router = express.Router();

router.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});

router.get("/login", pagesController.login);
router.post("/login", authenticationController.login);
router.get("/logout", authenticationController.logout);
router.get("/signup", pagesController.signup);
router.post(
  "/signup",
  authenticationController.signup,
  passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/signup",
    failureFlash: true
  })
);

router.get("/", pollController.getAll);
router.get("/poll/:id", pollController.get);
router.get("/mypoll", ensureAuthenticated, pollController.getMyPoll);
router.get("/newpoll", pollController.newPoll);
router.post("/newpoll", ensureAuthenticated, pollController.postPoll);
router.post("/poll/vote/:id", pollController.votePoll);
router.delete("/mypoll/delete/:id", ensureAuthenticated, pollController.delete);

module.exports = router;
