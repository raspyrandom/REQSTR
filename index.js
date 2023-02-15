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


// not used yet, gonna be used to send the files back
function fileLoop(){
  fs.readdir("./uploads/", (err, files) => {
    files.forEach(file => {
    socket.send(file)
      
  });
});     
};


// tells express which folder to look for html,css,js in
app.use(express.static('views'));

// storage parameters
const storage = multer.diskStorage({
  // shows multer where to put the images
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  // names the files
  filename: function (req, file, cb) {
    cb(null, String(req.body.postTitle+".jpg"))
  }
});

/*function fileEdit(file){
  fs.readFile('./views/index.html', 'utf8', (err,html)=>{
    if(err){
      throw err;
    }
    
    const root = parse(html);
    
    const body = root.querySelector('document');
    //body.set_content('<div id = "asdf"></div>');
    const image = body.createElement("img");
    const div=body.createElement("div");
    image.setAttribute("src",file)
    div.appendChild("image");
    body.appendChild(div);
    
    console.log(root.toString()); // This you can write back to file!
  });
}
*/

// storeage thing neccicary for multer doesn't need to be changed
const upload = multer({ storage: storage });

// uses the html
router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+"/views/index.html"));
  // __dirname : It will resolve to your project folder.
});

// handles the image downloads
app.post('/submit-form', upload.single("postImage"), function (req, res, next) {
  // req.file is the `submit-form` file
  // req.body will hold the text fields, if there were any
})

// keep it like this

// app.use executes the router function
app.use('/', router);
// app.listen listens on the port
app.listen(process.env.port = port);

console.log('Running at Port '+port);
