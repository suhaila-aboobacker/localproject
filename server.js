

//requiring express and puts new express application inside app variable 
const express = require('express')
const connection = require('./db')
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser')
const app = express()

// middle wares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Registration endpoint
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!req.body) {
      res.status(400).send('empty fields !')
  }

  connection.query(`SELECT * FROM users WHERE username='${username}' `,
      (err, rows) => {
          if (!err) {
              if (rows.length !== 0) {
                  return res.status(409).send("User already Exist.")
              }

              registration();

          }
          else {
              console.log(err);
          }
      }
  );

  const registration = async() => {

      const encryptedPassword =  await bcrypt.hash(password, 10);
      const newUser = {
          username:username,
          password: encryptedPassword
      };

      connection.query(
          `INSERT INTO users SET ?`, newUser,
          (err, rows) => {
              if (!err) {
                  res.send('successfully registered')
                  console.log('Successfully registered !')
              }
              else { console.log(err) };
          }
      );

  };
});

app.post('/login', (req, res) => {

  const { username, password } = req.body;

  if (!req.body) {
    res.status(400).send("All input is required");
  }

  connection.query(`SELECT * FROM users WHERE username='${username}' `,
    (err, rows) => {
      if (!err) {

        if (rows.length === 0) {
          return res.send("User doesn't Exist.")
        }
        userLogin(rows);

      }
      else {
        console.log(err);
      }
    }
  );

  const userLogin = async (rows) => {

    if (await bcrypt.compare(password, rows[0].password)) {
      // Create token
      res.send({ msg: 'Login successfully!' })
    } else {
      res.status(400).send('Invalid credentials')
    }

  }
})
app.get('/', (req, res) => {
  res.status(200).send('welcome')
})
app.listen(3000, () => {
  console.log(`server is  running on port ${3000}`);
})