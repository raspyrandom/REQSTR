const express = require('express')
const multer  = require('multer')
const path = require('path');
const fs = require('fs');
// const parse = require('node-html-parser').parse;
// just some definitions
const router = express.Router();
const app = express();
// which folder to store the files
const testFolder = "./uploads/";
//port to be used
const port=8000;
var htmlCode="";

// not used yet, gonna be used to send the files back
function fileLoop(){
  htmlCode="<html>"+
"<head>"+
"<title>Posts</title>"+
'<meta name="description" content="Our first page">'+
'<meta name="keywords" content="html tutorial template">'+
'<style>'+
  'p{font-size:30px;}\n'+
  '.postDiv{border-style:solid;border-color:gray;border-width:2px;border-radius:15px;margin-top:5%;}\n'+
  'img{width:100%;border-top:solid #dedfde;border-radius:15px;}\n'+
'</style>\n'+
"</head>\n"+
"<body>\n\n"+
'<form action="/">'+
'<input type="submit" value="go back"\n>'
"</form>\n\n";
  
  fs.readdir("./views/uploads/", (err, files) => {
    files.forEach(file => {
      htmlCode=htmlCode+'<div class="postDiv">\n';
      htmlCode=htmlCode+'<p>'+file.split(".").shift()+'</p>\n';
      htmlCode=htmlCode+'<img src="uploads/'+file+'"></img>\n';
      htmlCode=htmlCode+'</div>\n\n';
      
  });
    htmlCode=htmlCode+"</body></html>";
    fs.writeFile("./views/imageView.html", htmlCode, (err) => {
  if (err)
    console.log(err);
  else {
    console.log("File written successfully\n");
    console.log("The written has the following contents:");
    console.log(fs.readFileSync("./views/imageView.html", "utf8"));
  }
});
});     
}

//(myarr.indexOf("turtles") > -1);
// tells express which folder to look for html,css,js in
app.use(express.static('views'));


// storage parameters
const storage = multer.diskStorage({
  // shows multer where to put the images
  
  destination: function (req, file, cb) {
    cb(null, './views/uploads');
  },
  // names the files
  filename: function (req, file, cb) {
    if (fs.existsSync(path.join('./views/uploads',req.body.postTitle+".jpg"))) {
      cb(null, false);
    }
    else{
      cb(null, String(req.body.postTitle+".jpg"));
      
    }
  }
});

app.use("/view-posts",(req, res)=> {
  fileLoop();
  res.sendFile(path.join(__dirname+"/views/imageView.html"));
});

// storage thing necessary for multer, doesn't need to be changed
const upload = multer({
    storage: storage
});
// uses the html
router.get('/',function(req,res){

  res.sendFile(path.join(__dirname+"/views/index.html"));
  // __dirname : It will resolve to your project folder.
});

// handles the image downloads
app.post('/submit-form', upload.single("postImage"), function (req, res, next) {
  res.sendFile(path.join(__dirname+"/views/index.html"));
  // req.file is the `submit-form` file
  // req.body will hold the text fields, if there were any
})

// keep it like this

// app.use executes the router function
app.use('/', router);
// app.listen listens on the port
app.listen(process.env.port = port);

console.log('Running at Port '+port);
