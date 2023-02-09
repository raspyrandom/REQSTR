const express = require("express");
const path = require("path");
const fs = require("fs");
const http = require("http")
let app = express();
const port = 3000;
const router = express.Router()
const multer = require("multer")
const upload = multer({ dest: 'images/' })

const httpServer = http.createServer(app);

const cpUpload = upload.fields([{ name: "postImage"])

app.use(express.static(path.join(__dirname,'views')))
app.get('/',(req,res)=>{
  res.sendFile('index.html');
})

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

app.use(express.urlencoded({
  extended: true
}))

app.use("/",router);
app.post('/submit-form', (req, res) => {
  let titleCurrent =  req.body.postTitle;
  let imageCurrent = req.body.postImage;
  let imageName = "./images/"+titleCurrent+".jpg";
  //...
  
    res.redirect("https://reqstr-server.alexkomissarch1.repl.co/");
  const targetPath = path.join(__dirname, imageName);
   fs.rename(tempPath, targetPath, err => {
        if (err) return handleError(err, res);
        res
          .status(200)
          .contentType("text/plain")
          .end("File uploaded!");
   })
fs.writeFile(imageName, imageCurrent, function (err) {
  if (err) throw err;
  console.log('Saved!');
});
  res.end();
})

app.listen(port, () => {
  console.log(`Express is running on port ${port}`);
});