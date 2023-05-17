// Imports
const express = require('express')
const multer  = require('multer')
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode')
const assert = require('assert');

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
	parent = null

	removeTrailingSlash () {
		if (this.path[this.path.length - 1] == "/" && this.nodeType == NodeType.File) {
			this.path = this.path.slice(0, -1)
			if (this.type != null) {
				this.path = this.path + this.type
			}
		}
	}

	// Path does not include own name
	// Ex: "USER/documents/" if the root dir is USER/documents/posts
	constructor (path, tree, parent) {
		this.name = tree.name
		this.path = path + this.name + '/'
		this.type = tree.type
		this.nodeType = tree.nodeType
		this.access = tree.access
		this.parent = parent
		
		console.log("\nConstructing Storage Node")
		console.log(tree)
		
		this.children = []
		if (tree.children != null) {
			for (var i = 0; i < tree.children.length; i ++) {
				var child = tree.children[i]
				this.children.push(new Storage(this.path, child, this))
			}
		} else if (tree.children == null) {
			this.children = null
			this.removeTrailingSlash()
		}
		
		if (this.nodeType == NodeType.File) {
			this.removeTrailingSlash()
		}
		
		if (this.type == ".jpg" && this.nodeType == NodeType.Directory) {
			this.file = new JpgPluralInterface(this.path, this.access)
		}
		if (this.type == ".json" && this.nodeType == NodeType.File) {
			this.file = new JsonFileInterface(this.path, this.access)
		}
	}

	setName (name) {
		this.path = this.path.subString(0, this.path.length - name.length)
		this.path += name
		this.name = name
	}

	getTruncatedPath () {
		if (this.parent == null) {
			return this.name
		} else {
			return this.parent.getTruncatedPath() + '/' + this.name
		}
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
}

class JsonFileInterface {
	access = null
	path = null

	constructor (path, access) {
		this.path = path
		this.access = access
		console.log('jsonfileinterface constructed')
	}

	getObject () {
		return JSON.parse(fs.readFileSync(this.path))
	}

	setObject (object) {
		fs.writeFileSync(this.path, JSON.stringify(object))
	}

	// Runs Operation on object, sets object to result of Operation
	// Operation takes one input: Object
	mutateObject(Operation) {
		this.setObject(Operation(this.getObject()))
	}
}

// const parse = require('node-html-parser').parse;
// just some definitions
const router = express.Router();
const app = express();

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

// Reduce magic references
var storage = new Storage("./views/", tree, null)
var indexHtml = "/views/index.html"
var photosStorage = storage.children[0]
var metadataStorage = storage.children[1]
assert(photosStorage.name == "photos")
assert(metadataStorage.name == "metadata")

console.log(metadataStorage.file.getObject())

// Code beyond this point is significantly less abstract
// And thus less readable
// Procees with caution and thoroughness





// Used to send the files back
function fileLoop(){
  //I made the comment as an easter egg
  htmlCode = fs.readFileSync("views/imageViewTemplate.html")
	
	// Somehow, encapsulating the code in this irrelevant function makes it run, clientside!
	// Please fix in 2024 :)
	
	// Start block
	fs.readdir(photosStorage.path, (err, files) => {
	
	var posts = metadataStorage.file.getObject().posts
	posts.forEach(post => {
		console.log(post)
		htmlCode = htmlCode + 
			'	<div class="postDiv">\n'
			+'	<p class=postTitle>' + post.title.split("-").shift() + '</p>\n'
			+'	<p class=postDescription>' + post.description + '</p>\n'
			+'	<img class=postImage src="' + photosStorage.getTruncatedPath() + '/' + post.fileName + '"></img>\n'
			+'</div>\n\n';
	})
	htmlCode = htmlCode + "</body></html>";
  fs.writeFile("./views/imageView.html", htmlCode, (err) => {
  	if (err)
    	console.log(err);
  	else {
	    console.log("File written successfully\n");
	    console.log("The written has the following contents:");
  	  console.log(fs.readFileSync("./views/imageView.html", "utf8"));
	  }
	});

	// End block
	});
}

//(myarr.indexOf("turtles") > -1);
// tells express which folder to look for html,css,js in
app.use(express.static('views'));

// returns random integer between 0 and max (exclusive)
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// storage parameters
photosStorage.file.multerStorage = multer.diskStorage({
  // shows multer where to put the images
  
  destination: function (req, file, cb) {
    cb(null, photosStorage.path)
  },
  // names the files
  filename: function (req, file, cb) {
		// File name structure:
    // postname-timestamp-randomnumber.jpg
		let title = req.body.postTitle
		if (title === "") {
			title = "[untitled]" + '-' + Date.now() + '-' + getRandomInt(99999999) + ".jpg"
		}
	  else {
	    title = title.replace("-","_");
			title = title + '-' + Date.now() + '-' + getRandomInt(99999999) + ".jpg"
		}
		console.log(req.body)
		metadataStorage.file.mutateObject((object => {
			console.log("adding post")
			console.log(req.body)
			var nextPost = {
				title: req.body.postTitle,
				fileName: title,
				description: req.body.postDescription
			}
			console.log(nextPost)
			object.posts.push(nextPost)
			return object
		}))
		
    cb(null, title)
  }
});

app.use("/view-posts",(req, res)=> {
  fileLoop();
  res.sendFile(path.join(__dirname+"/views/imageView.html"));
});

// storage thing necessary for multer, doesn't need to be changed
const upload = multer({ storage: photosStorage.file.multerStorage });

// uses the html
router.get('/',function(req,res){

  res.sendFile(path.join(__dirname+indexHtml));
  // __dirname : It will resolve to your project folder.
});

// handles the image downloads
app.post('/submit-form', upload.single("postImage"), function (req, res, next) {
  res.sendFile(path.join(__dirname+indexHtml));
  // req.file is the `submit-form` file
  // req.body will hold the text fields, if there were any
})

// keep it like this

// app.use executes the router function
app.use('/', router);
// app.listen listens on the port
app.listen(process.env.port = port);

console.log(storage)
console.log('Running at Port '+port);

QRCode.toFile('views/QRCODE.png', prompt("URL: "), function (err) {
  if (err) throw err
  console.log('QR Code done')
});
