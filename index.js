const express = require('express')
const multer  = require('multer')
const path = require('path');

const router = express.Router();
const app = express()

const port=8000;
app.use(express.static('views'));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, String(req.body.postTitle+".jpg"))
  }
})

const upload = multer({ storage: storage });

const uploadFields = upload.fields([{ name: 'postTitle', maxCount: 1 }, { name: 'postImage', maxCount: 1 }]);

router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+"/views/index.html"));
  //__dirname : It will resolve to your project folder.
});

app.post('/submit-form', upload.single("postImage"), function (req, res, next) {
  // req.file is the `sumbmit-form` file
  // req.body will hold the text fields, if there were any
})


app.use('/', router);
app.listen(process.env.port || port);
 
console.log('Running at Port '+port);