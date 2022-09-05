let express = require("express")
let {MongoClient, ObjectId} = require('mongodb')
let sanitizeHTML = require("sanitize-html")

/* 
This is the MongoClient object which we are interested in.
We use {} because we can change this into an array for future files we might need from mongodb package.
*/

let app = express()
let db

app.use(express.static('public'))

async function go() {
  let client = new MongoClient('mongodb+srv://XJSng:9ynTImHAxj7qGEYZ@cluster0.yfzmesm.mongodb.net/ToDoApp?retryWrites=true&w=majority')
  //MongoDB password was incorrect
  await client.connect()
  db = client.db()
  app.listen(3000)
}

go()

app.use(express.json())
app.use(express.urlencoded({extended: false}))
//The express framework to include a body object that is added on the request object

// Security precaution added to the application line on app.get() and then next() function
function passwordProtected(req, res, next) {
  res.set("WWW-Authenticate", 'Basic realm="Simple Todo App"')
 console.log(req.headers.authorization)
  if (req.headers.authorization == "Basic eGpzbmc6amF2YXNjcmlwdA==") { //user:xjsng ps:javascript
    next()
  } else {
    res.status(401).send("Authentication Required")
  }
}

app.use(passwordProtected)
// Password protection for all pages.

app.get('/', function(req, res) {
  db.collection('items').find().toArray(function(err, items) {
    res.send(`<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Simple To-Do App</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
    </head>
    <body>
      <div class="container">
        <h1 class="display-4 text-center py-1">To-Do App</h1>
        <p class="text-sm text-center py-0.5">Created by Brad Schiff, followed by Xu Jie</p>
        <div class="jumbotron p-3 shadow-sm">
          <form id="create-form" action="/create-item" method="POST">
            <div class="d-flex align-items-center">
              <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
              <button class="btn btn-primary">Add New Item</button>
            </div>
          </form>
        </div>
        
        <ul id="item-list" class="list-group pb-5">  
        </ul>
        
      </div>
      
      <script>
      let items = ${JSON.stringify(items)} // JSON = JavaScript Object Notation
      </script>

      <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
      <script src="/browser.js"></script>
    </body>
    </html>`)
  })
//.find means to read the database.
//.toArray makes data from Mongodb easier to read for JavaScript
  
})


app.post('/create-item', function(req, res) {
let safeText = sanitizeHTML(req.body.text, {allowTags: [], allowedAttributes: {}})
  db.collection("items").insertOne({text: safeText}, function(err, info) {
    res.json({_id: info.insertedId, text: safeText})
    //JavaScript object mutation
  })
})


app.post("/update-item", function(req, res) {
  let safeText = sanitizeHTML(req.body.text, {allowTags: [], allowedAttributes: {}})
  db.collection("items").findOneAndUpdate({_id: new ObjectId(req.body.id)}, {$set: {safeText}}, function() {
   res.send("Success")
 })
})

app.post("/delete-item", function(req, res) {
  db.collection('items').deleteOne({_id: new ObjectId(req.body.id)}, function() {
    res.send("Success")
  })
})


// EVIL JS REFERENCE <a href='#' onclick='(()=>{alert}("Evil JS here")})()'>Click this</a>
