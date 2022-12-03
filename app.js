const express = require("express");
const app = express();
const path = require("path");
const database = require("./config/database");
const bodyParser = require("body-parser"); // pull information from HTML POST (express4)
const exphbs = require("express-handlebars");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, query, param, validationResult } = require("express-validator");
const db = require("./models/db");

var HTTP_PORT = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ extended: "true" })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json

// Set up Handlebars as the template engine
const HBS = exphbs.create({
  helpers: {
    dateFormat: function (date) {
      return date.toISOString().split("T")[0];
    },
  },
  extname: "hbs",
});
app.engine(".hbs", HBS.engine);
app.set("view engine", ".hbs");
app.use(express.static(path.join(__dirname, "public")));

// Connecting with DB
db.initialize(database.url);

// Initializing User Model
const User = require("./models/user");

// Middleware validate JWT
const validateJWT = function (req, res, next) {
  const token = req.header('authorization')?.split(" ").length == 2 ? req.header('authorization').split(" ")[1] : "";
  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err) {
      res.json(err)
    } else {
      req.userEmail = decoded.email
      next();
    }
  });
};

// *! ROUTES

// Register a user
app.post(
  "/register",
  [
    check("name").exists().bail().isString(),
    check("email").exists().bail().normalizeEmail().isEmail(),
    check("password").exists().bail().isString(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      let password = req.body.password;
      let salt = 10;
      // Hashing the password
      bcrypt
        .hash(password, salt)
        .then((hash) => {
          let data = {
            name: req.body.name,
            email: req.body.email,
            password: hash,
          };
          db.registerUser(data)
            .then((data) => {
              res.status(201).json(data);
            })
            .catch((err) => {
              res.send(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
);

// Login User
app.post(
  "/login",
  [check("email").exists().bail().normalizeEmail().isEmail(), check("password").bail().isString(),],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      let email = req.body.email;
      let password=req.body.password;

      db.getUser(email, req, res)
        .then((data) => {
          if (data === null) {
            res.json({ 'msg': "Unable to find email" });
          } else if(data.email === email) { // Checking if user email matches in DB
            // Checking if the pasword is correct
            bcrypt.compare(password,data.password).then((result)=>{
              if(result==true){
                const user = { email: data.email };
                const accessToken = jwt.sign(user, process.env.SECRET);
                res.json({ accessToken: accessToken });
              }else{
                res.json({'msg':'Invalid Credentials'})
              }
            })
          } else {
            res.json({ 'msg': "Unable to find email" });
          }
        })
        .catch((err) => {
          res.send(err);
        });
    }
  }
);

// Get Record By id
app.get(
  "/api/restaurants/:id",
  [param("id").exists().isString()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      let id = req.params.id;
      db.getRestaurantById(id)
        .then((data) => {
          res.json(data);
        })
        .catch((err) => {
          res.send(err);
        });
    }
  }
);

app.get(
  "/api/restaurants",
  [
    query("page").isNumeric({ min: 1 }),
    query("perPage").isNumeric({ min: 1 }),
    query("borough").optional().isString(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let page = req.query.page;
    let perPage = req.query.perPage;
    let borough = req.query.borough;
    db.getAllRestaurants(page, perPage, borough)
      .then((data) => {
        if (data.message) {
          res.status(204).json(data);
        } else {
          res.json(data);
        }
      })
      .catch((err) => {
        res.send(err);
      });
  }
);

// Add a New Record
app.post(
  "/api/restaurants",
  [
    validateJWT,
    check("address").exists().bail().isObject(),
    check("address.building").exists().bail().isString(),
    check("address.coord").exists().bail().isArray(),
    check("address.street").exists().bail().isString(),
    check("address.zipcode").exists().bail().isString(),
    check("borough").exists().bail().isString(),
    check("cuisine").exists().bail().isString(),
    check("grades").exists().bail().isArray(),
    check("grades.*.date").exists().bail().isISO8601().toDate(),
    check("grades.*.grade").exists().bail().isString(),
    check("grades.*.score").exists().bail().isNumeric({ min: 0 }),
    check("name").exists().bail().isString(),
    check("restaurant_id").exists().bail().isString(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      let data = req.body;
      db.addNewRestaurant(data)
        .then((data) => {
          res.status(201).json(data);
        })
        .catch((err) => {
          res.send(err);
        });
    }
  }
);

// Update a Record

app.put(
  "/api/restaurants/:id",
  [
    validateJWT,
    check("address").isObject(),
    check("address.building").isString(),
    check("address.coord").isArray(),
    check("address.street").isString(),
    check("address.zipcode").isString(),
    check("borough").isString(),
    check("cuisine").isString(),
    check("grades").isArray(),
    check("grades.*.date").isISO8601().toDate(),
    check("grades.*.grade").isString(),
    check("grades.*.score").isNumeric(),
    check("name").isString(),
    check("restaurant_id").isString(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      let data = req.body;
      let id = req.params.id;
      db.updateRestaurantById(data, id)
        .then((data) => {
          res.status(200).json(data);
        })
        .catch((err) => {
          res.send(err);
        });
    }
  }
);

// Delete a record
app.delete("/api/restaurants/:id", [validateJWT], (req, res) => {
  let id = req.params.id;
  db.deleteRestaurantById(id, req, res)
    .then((data) => {
      res.send(`Record has been deleted successfully`);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get all employee data from db
app.get("/api/results", function (req, res) {
  let page = req.query.page === "" || req.query.page === undefined || req.query.page === null ? 1 : req.query.page;
  let perPage = req.query.perPage === "" || req.query.perPage === undefined || req.query.perPage === null  ? 10 : req.query.perPage;
  let borough = req.query.borough === "" || req.query.borough === undefined || req.query.borough === null  ? undefined : req.query.borough;

  db.getAllRestaurants(page, perPage, borough)
    .then((data) => {
      res.render("restaurantsTable", {
        title: "Restaurants",
        restaurants: data,
      });
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get("*", (req, res) => {
  res.status(404).render("error", { layout: false });
});

app.listen(HTTP_PORT);
