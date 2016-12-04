var express = require("express");
var passport = require("passport");

var User = require("./models/user");
var Poll = require("./models/poll");
var router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("info", "You must be logged in to see this page.");
    res.redirect("/login");
  }
}

router.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});

router.get("/", function(req, res, next) {
  Poll.find()
  .sort({ createdAt: "descending" })
  .exec(function(err, polls) {
    if (err) { return next(err); }
    res.render("index", { polls: polls });
  });
});

router.get("/login", function(req, res) {
  res.render("login");
});

router.post("/login", passport.authenticate("login", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}));

router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

router.get("/signup", function(req, res) {
  res.render("signup");
});

router.post("/signup", function(req, res, next) {

  console.log(req.body);

  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username }, function(err, user) {

    if (err) { return next(err); }
    if (user) {
      req.flash("error", "User already exists");
      return res.redirect("/signup");
    }

    var newUser = new User({
      username: username,
      password: password
    });
    newUser.save(next);

  });
}, passport.authenticate("login", {
  successRedirect: "/",
  failureRedirect: "/signup",
  failureFlash: true
}));

router.get("/users/:username", function(req, res, next) {
  // User.findOne({ username: req.params.username }, function(err, user) {
  //   if (err) { return next(err); }
  //   if (!user) { return next(404); }
  //   res.render("profile", { user: user });
  // });

});

router.get("/edit", ensureAuthenticated, function(req, res) {
  Poll.find({"creator": res.locals.currentUser._id})
    .populate('creator')
    .exec(function(err, poll) {
        if(err) return err;
        res.json(poll);
    });
  //res.render("edit");
});

router.post("/edit", ensureAuthenticated, function(req, res, next) {
  req.user.displayName = req.body.displayname;
  req.user.bio = req.body.bio;
  req.user.save(function(err) {
    if (err) {
      next(err);
      return;
    }
    req.flash("info", "Profile updated!");
    res.redirect("/edit");
  });
});

router.get('/poll/:id', function(req, res) {
  var id = req.params.id;

  Poll.findById(id).then((poll) => {
    if(!poll) {
      res.status(404).send();
    }
    res.render('poll',{poll: poll} );
  }).catch((e) => res.status(400).send());
});

router.post('/poll/vote/:id', function(req, res ,next) {
    var id = req.params.id;
    var value = req.body.select;
    var newValue = req.body.newpoll;
    console.log(req.body);
    console.log(id);
    if(value === "Choose one...") {
      req.flash("info", "Please choose one option!");
      return res.redirect(`/poll/${id}`);
    };

    Poll.findById(id, function (err, doc) {
      if (err) {return next(err); }

      if(value !== "Choose one...") {
        console.log('Im in value');
        var placeholder;
        //data structe lag..
        for(i=0; i < doc.options.length; i++) {
          console.log(doc.options[i]);
          if(doc.options[i].val === value) {
              placeholder = doc.options[i];
          }
        }
        console.log(placeholder);
        console.log(doc.options[0].num);
        placeholder.num = placeholder.num + 1 ;
        doc.save().then(res.redirect(`/poll/${id}`));

    } else if(newValue) {
        console.log('Im in newpoll');
        doc.options.push({val: newValue, num: 1});
        console.log(doc);
        res.send(doc);
    }
    });


});

router.get('/newpoll', function (req, res) {
  res.render('newpoll');
});

router.post('/newpoll', ensureAuthenticated, function(req, res, next) {
  var title = req.body.title;
  var options = req.body.option.split("\r\n");
  var creator = res.locals.currentUser._id

  var arr = [];
  var len = options.length;
  for (var i = 0; i < len; i++) {
      if(options[i] !== "") {
      arr.push({
          val: options[i],
          num: 0,
      });
    }
  };

  var newPoll = new Poll({
      title: title,
      options: arr,
      creator: creator
    });
    newPoll.save().then(res.redirect('/'));

});

module.exports = router;
