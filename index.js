// Imports
const express = require('express')
const multer  = require('multer')
const path = require('path')
const fs = require('fs')

console.log("Initializing server backend")

// Enums for the Storage class
const AccessType = Object.freeze({
	Public: Symbol("public"), // Access by externals allowed
	Protected: Symbol("protected"), // Readable but not modifiable
	Private: Symbol("private"), // Not accessible or readable in any way
})

const NodeType = Object.freeze({
	File: Symbol("file"), // File - final node
	Directory: Symbol("directory"), // Directory - contains other files/directories
})

// Stores files in a designated directory
class Storage {
	// Tree is an object with symbols denoting the file structure

	name = ""
	type = null
	nodeType = null
	access = null
	children = null
	path = null
	file = null

	// Path does not include own name
	// Ex: "USER/documents/" if the root dir is USER/documents/posts
	constructor (path, tree) {
		this.name = tree.name
		this.path = path + '/' + this.name
		this.type = tree.type
		this.nodeType = tree.nodeType
		this.access = tree.access
		console.log("\nConstructing Storage Node")
		console.log(tree)
		if (this.type == ".jpg" && this.nodeType == NodeType.Directory) {
			this.file = new JpgPluralInterface(this.path, this.access)
		}
		if (tree.children == null) {
			this.children = null
			return
		}
		if (this.nodeType == NodeType.File) {
			return
		}
		this.children = []
		for (var i = 0; i < tree.children.length; i ++) {
			var child = tree.children[i]
			this.children.push(new Storage(this.path, child))
		}
	}

	setName (name) {
		this.path = this.path.subString(0, this.path.length - name.length)
		this.path += name
		this.name = name
	}
}

class JpgPluralInterface {
	multerStorage = null
	access = null
	path = null

	constructor (path, access) {
		this.path = path
		this.access = access
		this.multerStorage = null
		console.log('jpgpluralinterface constructed')
	}

	defineMulterStorage(multerStorage) {
		this.multerStorage = multerStorage
	}
	
	addImage (path) {
		if (this.access != AccessType.Public) {
			throw new Error('Access denied')
		}

		if (this.type != ".jpg") {
			throw new Error('Incorrect file type')
		}

		
	}
}

// const parse = require('node-html-parser').parse;
// just some definitions
const router = express.Router();
const app = express();
// which folder to store the files
const testFolder = "./uploads/";
//port to be used
const port=8000;
var htmlCode="";
tree = {
	name: "posts",
	type: "null",
	nodeType: NodeType.Directory,
	access: AccessType.Protected,
	children: [
		{
			name: "photos",
		 	type: ".jpg",
			nodeType: NodeType.Directory,
	 		access: AccessType.Public,
			children: null
		},
		{
			name: "metadata",
		 	type: ".json",
			nodeType: NodeType.File,
	 		access: AccessType.Public,
	 		children: null
		}
	]
}
var storage = new Storage("./views", tree)

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
'<input type="submit" value="Go back"\n>'
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


// tells express which folder to look for html,css,js in
app.use(express.static('views'));

// returns random integer between 0 and max (exclusive)
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// storage parameters
storage.children[0].file.multerStorage = multer.diskStorage({
  // shows multer where to put the images
  destination: function (req, file, cb) {
    cb(null, storage.children[0].path)
  },
  // names the files
  filename: function (req, file, cb) {
    // postname-timestamp-randomnumber.jpg
		if (req.body.postTitle === "") {
			cb(null, String("[untitled]" + '-' + Date.now() + '-' + getRandomInt(99999999) + ".jpg"))
		}
    else {
			cb(null, String(req.body.postTitle + '-' + Date.now() + '-' + getRandomInt(99999999) + ".jpg"))
		}
  }
});

app.use("/view-posts",(req, res)=> {
  fileLoop();
  res.sendFile(path.join(__dirname+"/views/imageView.html"));
});

// storage thing necessary for multer, doesn't need to be changed
const upload = multer({ storage: storage.children[0].file.multerStorage });

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

console.log('\nRunning at Port '+port);
