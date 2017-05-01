var Poll = require("../models/poll");

var Poll = require("../models/poll");

exports.getAll = function(req, res, next) {
  Poll.find().sort({ createdAt: "descending" }).exec(function(err, polls) {
    if (err) {
      return next(err);
    }
    res.render("index", { polls: polls });
  });
};

exports.get = function(req, res) {
  var id = req.params.id;

  Poll.findById(id)
    .then(poll => {
      if (!poll) {
        res.status(404).send();
      }
      var data = [];
      var label = [];
      poll.options.forEach(option => {
        data.push(option.val);
        label.push(option.num);
      });
      res.render("poll", {
        poll: poll,
        data: JSON.stringify(data),
        label: label
      });
    })
    .catch(e => res.status(400).send());
};

exports.getMyPoll = function(req, res) {
  Poll.find({ creator: res.locals.currentUser._id })
    .populate("creator")
    .sort({ createdAt: "descending" })
    .exec(function(err, polls) {
      if (err) {
        return next(err);
      }
      res.render("mypoll", { polls: polls });
    });
};

exports.delete = function(req, res, next) {
  var id = req.params.id;
  Poll.findById(id).remove().exec();
  req.flash("info", "Delete successful!");
  res.redirect("/mypoll");
};

exports.votePoll = function(req, res, next) {
  var id = req.params.id;
  var value = req.body.select;
  var newValue = req.body.newpoll;
  if (value === "Choose one..." && newValue === "") {
    req.flash("info", "Please choose one option!");
    return res.redirect(`/poll/${id}`);
  }

  Poll.findById(id, function(err, doc) {
    if (err) {
      return next(err);
    }

    if (value !== "Choose one...") {
      var placeholder;
      //data structe lag..
      for (i = 0; i < doc.options.length; i++) {
        console.log(doc.options[i]);
        if (doc.options[i].val === value) {
          placeholder = doc.options[i];
        }
      }

      placeholder.num = placeholder.num + 1;
      doc.save().then(res.redirect(`/poll/${id}`));
    } else if (newValue) {
      doc.options.push({ val: newValue, num: 1 });
      doc.save().then(res.redirect(`/poll/${id}`));
    }
  });
};

exports.newPoll = function(req, res) {
  res.render("newpoll");
};

exports.postPoll = function(req, res, next) {
  var title = req.body.title;
  var options = req.body.option.split("\r\n");
  var creator = res.locals.currentUser._id;

  var arr = [];
  var len = options.length;
  for (var i = 0; i < len; i++) {
    if (options[i] !== "") {
      arr.push({
        val: options[i],
        num: 0
      });
    }
  }

  var newPoll = new Poll({
    title: title,
    options: arr,
    creator: creator
  });
  newPoll.save().then(poll => res.redirect(`/poll/${poll._id}`));
};
