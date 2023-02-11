const express = require("express")
const path = require("path")
const multer = require("multer")
const app = express()
	
// View Engine Setup
app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")
	
// var upload = multer({ dest: "Upload_folder_name" })
// If you do not want to use diskStorage then uncomment it


  



	
// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
//const maxSize = 1 * 1000 * 1000;
	
var storage = multer.diskStorage({
	//limits: { fileSize: maxSize },
	fileFilter: function (req, file, cb){
	
		// Set the filetypes, it is optional
		var filetypes = /jpeg|jpg/;
		var mimetype = filetypes.test(file.mimetype);

		var extname = filetypes.test(path.extname(
					file.originalname).toLowerCase());
		
		if (mimetype && extname) {
			return cb(null, true);
		}
// mypic is the name of file attribute
}});
const upload = multer({ storage: storage })

app.get("/",function(req,res) {
	res.render("index");
})
	
app.post("/submit-form-image",function (req, res, next) {
		
	// Error MiddleWare for multer file upload, so if any
	// error occurs, the image would not be uploaded!
	upload(req,res,err) {

		if(err) {

			// ERROR occurred (here it can be occurred due
			// to uploading image of size greater than
			// 1MB or uploading different file type)
			res.send(err)
		}
		else {

			// SUCCESS, image successfully uploaded
			res.send("Success, Image uploaded!")
		}
	})
})
	
// Take any port number of your choice which
// is not taken by any other process
app.listen(8080,function(error) {
	if(error) throw error
		console.log("Server created Successfully on PORT 8080")
})
