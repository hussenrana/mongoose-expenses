const express = require("express");
const moment = require("moment");
const router = express.Router();
const app = express();
const Expense = require("../model/Expense");

router.get("/expenses", function (req, res) {
  const d1 = req.query.d1;
  const d2 = req.query.d2
    ? req.query.d2
    : moment(req.query.d2).format("YYYY-MM-DD");
  if (d1) {
    Expense.find({
      $and: [{ date: { $gt: d1 } }, { date: { $lt: d2 } }],
    })
      .sort({ date: -1 })
      .then(function (expenses) {
        res.send(expenses);
      });
  }

  //   if (d1 || d2) {
  //     const dToday = d1 ? d1 : d2;
  //     const d = moment(dToday).format("LLLL");
  //     Expense.find({
  //       date: { $gt: d },
  //     })
  //       .sort({ date: -1 })
  //       .then(function (expenses) {
  //         res.send(expenses);
  //       });
  //   }
  else {
    Expense.find({})
      .sort({ date: -1 })
      .then(function (expenses) {
        res.send(expenses);
      });
  }
});

router.get("/expenses/:group", function (req, res) {
  const total = req.query.total;
  const group = req.params.group;
  if (total === "true") {
    Expense.aggregate([
      {
        $match: { group: group },
      },
      {
        $group: {
          _id: "$group",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]).then(function (totalAmount) {
      res.send(totalAmount);
    });
  } else {
    Expense.find({
      group: group,
    }).then(function (expenses) {
      res.send(expenses);
    });
  }
});

router.post("/expense", function (req, res) {
  let e = new Expense(req.body);
  let date = req.body.date
    ? moment(req.body.date).format("LLLL")
    : moment().format("LLLL");
  e.date = date;
  e.save().then(function () {
    console.log(`amount of Expense: ${e.amount} we spent money on ${e.item}`);
  });
  res.status(201).send(e);
});

router.put("/update/:group1/:group2", function (req, res) {
  Expense.findOneAndUpdate(
    { group: req.params.group1 },
    { group: req.params.group2 }
  )
    .then(function (expense) {
      res.send(`Expense ${expense.item} updated to group ${req.params.group2}`);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

module.exports = router;
