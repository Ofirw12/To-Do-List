const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin:KQ4KJ9APGaay-5V@cluster0.weootq2.mongodb.net/todolistDB");
//"mongodb://localhost:27017/todolistDB" localDB
const itemsSchema = {
  name: String
};

const Item = new mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Get food"
});

const item2 = new Item({
  name: "Cook food"
});



const defaultItems = [item1, item2];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find(function(err, items) {
    if (err) {
      console.log(err);
    } else {
      if (items.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("items successfully added");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: items
        })
      }
    }

  });
});


app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name: itemName
  });

  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {

      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }


});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err){
        console.log("Successfully removed item with id: " + checkedItemId);
        res.redirect("/");
      }
    });

  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/:topic", function(req, res) {
  const customListName = _.capitalize(req.params.topic);
  List.findOne({
    name: customListName
  }, function(err, list) {
    if (!list) {
      //create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + list.name);
    } else {
      //show existing list
      res.render("List", {
        listTitle: list.name,
        newListItems: list.items
      })
    }
  });



});


app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
