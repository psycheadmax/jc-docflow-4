// TODO later
// add require('express').Router() https://dev.to/albertofdzm/mongoose-mongodb-and-express-596
// add morgan logger
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const router = express.Router();
const path = require("path");
const cors = require("cors");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const authMiddleware = require("./middleware/authMiddleware");
const sessionStorage = require("sessionstorage-for-nodejs");

const dbURI = process.env["DB_URI"];
const SERVER_PORT = process.env["SERVER_PORT"];
const SECRET_KEY = process.env["SECRET_KEY"];
const ALLOWED_IPS = process.env["ALLOWED_IPS"];
const PUBLIC_URL = process.env["PUBLIC_URL"];
const CORS_ORIGIN = process.env["CORS_ORIGIN"]
const CORS_METHODS = process.env["CORS_METHODS"]
const CORS_ALLOWED_HEADERS = process.env["CORS_ALLOWED_HEADERS"]

// As of this edit, Mongoose is now at v5.4.13. Per their docs, these are the fixes for the deprecation warnings...
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Import Model
const Person = require("./models/Person");
const Case = require("./models/Case");
const AnyDoc = require("./models/AnyDoc");
const User = require("./models/User");
const Role = require("./models/Role");
const DocTemplate = require("./models/DocTemplate");

const generateAccessToken = (id, username, roles) => {
	const payload = {
		id,
		username,
		roles,
	};
	return jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
};

// Enable CORS
const corsOptions = {
	origin: CORS_ORIGIN,
	methods: CORS_METHODS,
	allowedHeaders: CORS_ALLOWED_HEADERS,
  };

app.use(cors(corsOptions));

// // old CORS enabling
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", PUBLIC_URL);
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//     );
//     next();
//   });

//  auth check
// app.use('/api', authMiddleware, (req, res, next) => {
//   next()
// })

// const allowedIPs = process.env["ALLOWED_IPS"].split(' ');
// let clientIP
// app.use((req, res, next) => {
//		console.log(`Your IP is: ${clientIP}`);
//     clientIP = req.ip;
//     if (allowedIPs.includes(clientIP)) {
// 		console.log('client is OK')
//         next();
//     } else {
// 		console.log('client is BLOCKED')
//         res.status(403).send('Forbidden');
//     }
// });

// NEXT Here insert use authRouter and authController !!!
app.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		if (!user) {
			return res
				.status(400)
				.json({ message: `Пользователь ${username} не найден` });
		}
		const validPassword = bcrypt.compareSync(password, user.password);
		if (!validPassword) {
			return res.status(400).json({ message: `Введен неверный пароль` });
		}
		const token = generateAccessToken(user._id, username, user.roles);
		sessionStorage.setItem("token", token);
		return res.json({ token });
	} catch (e) {
		console.log(e);
		res.status(400).json({ message: "Login error" });
	}
});

app.post("/registration", async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res
				.status(400)
				.json({ message: "Ошибка при регистрации", errors });
		}
		const { username, password } = req.body;
		console.log(req.body);
		const candidate = await User.findOne({ username });
		if (candidate) {
			return res.status(400).json({
				message: "Пользователь с таким именем уже существует",
			});
		}
		const hashPassword = bcrypt.hashSync(password, 7);
		const userRole = await Role.findOne({ value: "USER" });
		const user = new User({
			username,
			password: hashPassword,
			roles: [userRole.value],
		});
		await user.save();
		return res.json({ message: "Пользователь успешно зарегистрирован" });
	} catch (e) {
		console.log(e);
		res.status(400).json({ message: "Registration error" });
	}
});

app.post("/logout", (req, res) => {
	sessionStorage.removeItem("token");
	return res.json({ message: "Пользователь вышел" });
});

app.get("/users", (req, res) => {
	const users = User.find();
	res.json(users);
});

// just to create roles in DB once
app.get("/createRoles", async (req, res) => {
	try {
		const userRole = new Role();
		const adminRole = new Role({ value: "ADMIN" });
		await adminRole.save();
		await userRole.save();
		res.json("roles created");
	} catch (error) {
		console.log(error);
		res.status(400).json({ message: error });
	}
});

// PERSONS =======================================
// Get all of our persons
//  NOT IN USE
app.get("/api/persons/all", (req, res) => {
	Person.find({})
		.populate("cases")
		.then((persons) => {
			res.json(persons);
		});
});

// Search persons
// <CheckBeforeCreate /> <SearchAndResults />
app.post("/api/persons/search", (req, res) => {
	const data = {
		...req.body,
	};
	Person.find(data)
		.populate("cases")
		.then((persons) => {
			res.json(persons);
		});
});

// Get One of Our persons
app.get("/api/persons/:id", (req, res) => {
	const id = req.params.id.replace("id", "");
	Person.findOne({ _id: id })
		.populate("cases")
		.then((person) => {
			res.json(person);
		});
});

// Create and Update person
app.post("/api/persons/write", (req, res) => {
	const data = {
		// id: req.body.id,
		...req.body,
	};
	Person.findOne({ _id: req.body._id }, (err, person) => {
		if (person) {
			Person.findByIdAndUpdate(req.body._id, data, {
				upsert: false,
			}).then((updated) => {
				res.json(updated);
			});
		} else {
			Person.create(data).then((created) => {
				res.json(created);
			});
		}
	});
});

// Delete selected person
app.post("/api/persons/delete/:id", (req, res) => {
	const id = req.params.id.replace("id", "");
	Person.findByIdAndDelete(id).then((person) => {
		res.json({ message: "Person was deleted!" });
	});
});
// END OF PERSONS =======================================

// CASES =======================================
app.post("/api/cases/write", (req, res) => {
	const data = {
		// id: req.body.id,
		...req.body,
	};

	Case.findOne({ _id: req.body._id }, (err, caseItem) => {
		if (caseItem) {
			Case.findByIdAndUpdate(req.body._id, data, { upsert: false }).then(
				(updated) => {
					res.json(updated);
				}
			);
		} else {
			Case.create(data).then((created) => {
				res.json(created);
			});
		}
	});
});

app.post("/api/cases/search", (req, res) => {
	const data = {
		...req.body,
	};
	Case.find(data).then((cases) => {
		res.json(cases);
	});
});

app.get("/api/cases/:id", (req, res) => {
	const id = req.params.id.replace("id", "");
	Case.findOne({ _id: id })
		.populate("idPerson")
		.then((caseData) => {
			res.json(caseData);
		});
});

// Delete selected case
app.post("/api/cases/delete/:id", (req, res) => {
	const id = req.params.id.replace("id", "");
	Case.findByIdAndDelete(id).then((item) => {
		res.json({ message: "Case was deleted!" });
	});
});
// END OF CASES =======================================

// DOCS ================================================
// Give receipt MB DELETE?
app.get("/api/docs/receipt/html", function (req, res) {
	const pathToHTML = path.join(
		__dirname,
		"/client/doctemplates/receipt/receipt.html"
	);
	res.sendFile(pathToHTML);
});

// check doctemplate
app.post("/api/docs/check", (req, res) => {
	AnyDoc.findOne(req.body).then((doc) => {
		res.json(doc);
	});
});

// Create and Update doc
app.post("/api/docs/write", (req, res) => {
if (req.body._id) {
	AnyDoc.findByIdAndUpdate(req.body._id, req.body, {
			upsert: false,
		}).then((updated) => {
			res.json(updated);
		});
} else {
	AnyDoc.create(req.body).then((created) => {
			res.json(created);
		});
}
});

// Get One of Docs
app.get("/api/docs/:id", (req, res) => {
	const id = req.params.id.replace("id", "");
	AnyDoc.findOne({ _id: id })
		.populate("cases")
		.then((doc) => {
			res.json(doc);
		});
});

// Delete selected DOC
app.post("/api/docs/delete/:id", (req, res) => {
	const id = req.params.id.replace("id", "");
	AnyDoc.findByIdAndDelete(id).then((doc) => {
		res.json({ message: "Document was deleted!" });
	});
});

// Get docs on Docs page
app.get("/api/docs/all", (req, res) => {
	AnyDoc.find({}).then((docs) => {
		res.json(docs);
	});
});

// Search docs
app.post("/api/docs/search", (req, res) => {
	const data = {
		...req.body,
	};
	AnyDoc.find(data)
		.populate("cases")
		.then((docs) => {
			res.json(docs);
		});
});

// END OF DOCS ================================================

// DOCTEMPLATES ==============================================
// get all doctemplates
app.get("/api/doctemplates/all", (req, res) => {
	DocTemplate.find().then((doctemplates) => {
		res.json(doctemplates);
	});
});

// check doctemplate
app.post("/api/doctemplates/check", (req, res) => {
	DocTemplate.findOne(req.body).then((doctemplate) => {
		res.json(doctemplate);
	});
});

// search doctemplate
app.post("/api/doctemplates/search", (req, res) => {
	DocTemplate.findOne(req.body).then((doctemplate) => {
		res.json(doctemplate);
	});
});

app.get("/api/doctemplates/:id", (req, res) => {
	const id = req.params.id.replace("id", "");
	DocTemplate.findOne({ _id: id }).then((doctemplate) => {
		res.json(doctemplate);
	});
});

// write new doctemplate or save current
app.post("/api/doctemplates/write", (req, res) => {
	if (req.body._id) {
			DocTemplate.findByIdAndUpdate(req.body._id, req.body, {
				upsert: false,
			}).then((updated) => {
				res.json(updated);
			});
		} else {
			req.body.title = req.body.title + ' КОПИЯ'
			DocTemplate.create(req.body).then((created) => {
				res.json(created);
			});
		}
	// DocTemplate.findOne(req.body.title, (err, doctemplate) => {
	// 	console.log(doctemplate);
		// if (doctemplate) {
		// 	DocTemplate.findByIdAndUpdate(doctemplate._id, req.body, {
		// 		upsert: false,
		// 	}).then((updated) => {
		// 		res.json(updated);
		// 	});
		// } else {
		// 	delete req.body._id;
		// 	DocTemplate.create(req.body).then((created) => {
		// 		res.json(created);
		// 	});
		// }
	// });
});

// delete doctemplate
app.post("/api/doctemplate/delete/:id", (req, res) => {
	const id = req.params.id.replace("id", "");
	DocTemplate.findByIdAndDelete(id).then((doctemplate) => {
		res.json(doctemplate);
	});
});

// END OF DOCTEMPLATES ========================================

async function serverStart() {
	try {
		mongoose.connect(
			dbURI,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useFindAndModify: false,
			}, //TODO MB remove useFindAndModify: false
			() => console.log("Connected to MongoDB")
		);
		app.listen(SERVER_PORT, () =>{
			console.log(`Server is running on port ${SERVER_PORT}`)
		});
	} catch (error) {
		console.log("Server error", error.message);
		process.exit(1);
	}
}

serverStart();
