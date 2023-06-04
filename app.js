//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose
  .connect(
    "mongodb+srv://ibrahimbajepade555:0y4L0IwAvmQE9Srb@cluster1.5vthbfj.mongodb.net/todolistDB",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const itemsSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Buy Food",
});
const item2 = new Item({
  name: "Cook Food",
});
const item3 = new Item({
  name: "Eat Food",
});
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({})
    .then(function (foundItem) {
      if (foundItem.length === 0) {
        Item.insertMany(defaultItems);
        console.log("SuccessFully save all the items to todolistDB");
      } else {
        console.log("Already contain an item!");
        return foundItem;
      }
    })
    .then(function (savedItem) {
      res.render("list", {
        listTitle: "Today",
        newListItems: savedItem,
      });
    })
    .catch((err) => console.log(err));
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item4 = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item4.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((foundList) => {
      foundList.items.push(item4);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    if (checkedItemId != undefined) {
      await Item.findByIdAndRemove(checkedItemId)
        .then(() => console.log(checkedItemId))
        .catch((err) => console.log(err));
      res.redirect("/");
    }
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    ).then((foundList) => {
      res.redirect("/" + listName);
    });
  }
});
app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }).then((value) => {
    if (!value) {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", { listTitle: value.name, newListItems: value.items });
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
