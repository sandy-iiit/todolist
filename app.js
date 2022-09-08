//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://dattasandeep000:13072003@sandy.p06ijgx.mongodb.net/todolistDB?retryWrites=true&w=majority");

const itemSchmea={
  name:String
};

const Item=mongoose.model("Item",itemSchmea);

const item1=new Item({

  name:"Welcom to your ToDoList"
});

const item2=new Item({

  name:"Hit the + button to add an item."
});

const item3=new Item({
     name:"<-- Hit this to delete an item."
})

const defaultItems=[item2];

const listSchema={
  name:String,
  items:[itemSchmea]
}

const List=mongoose.model("List",listSchema)

app.get("/", function(req, res) {

  Item.find({},function(err,founditems){
    if(founditems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Items have been succefully inserted into the database");
        }
      })
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: founditems});

    }
  })

});



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:listname",function(req,res){

  const listname= _.capitalize(req.params.listname);

  List.findOne({name:listname},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:listname,
          items:defaultItems
        })
      
        list.save();     
        res.redirect("/"+listname);

       }
      else
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
  }
})

  
   
});


app.post("/",function(req,res){

  const itemName=req.body.newItem;
  const listname=req.body.list;

  const item=new Item({

    name:itemName,
  });

  if(listname==="Today"){
    item.save();

    res.redirect("/");
  }
  else{
      List.findOne({name:listname},function(err,foundList){

        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listname);
      });
  }
 

});

app.post("/delete",function(req,res){
  const id=(req.body.checkbox);
  const listName=req.body.listName;
  

  if(listName==="Today"){
    Item.findByIdAndRemove(id,function(err){
      if(!err){
        console.log("Successfully deleted checked item");
        res.redirect("/");
      }
      else{
        console.log(err);
      }
    });
  }
 else{
     List.findOneAndUpdate({name:listName},{$pull:{items:{_id:id}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
     });
 }

})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
