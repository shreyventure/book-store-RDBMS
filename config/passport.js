const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_DATABASE } = require("./keys");

const mysql = require("mysql");
const DB = mysql.createConnection({
  host: "localhost",
  user: MYSQL_USERNAME,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
});
DB.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("MySQL database connected.");
  }
});

module.exports = function (passport) {
  //LOCAL STRATEGY
  passport.use(
    new LocalStrategy(
      { usernameField: "username" },
      (username, password, done) => {
        const Q = `SELECT * FROM dev WHERE username="${username}"`;
        DB.query(Q, (err, result) => {
          if (err) throw err;

          if (result.length === 0) {
            return done(null, false, {
              message: "Username not registered",
            });
          } else {
            bcrypt.compare(password, result[0].password, function (
              err,
              isMatch
            ) {
              if (err) throw err;
              if (isMatch) {
                return done(null, result[0]);
              } else {
                return done(null, false, { message: "Password incorrect" });
              }
            });
          }
        });
      }
    )
  );

  //SERIAL DESERIAL
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    const Q = `SELECT * FROM dev WHERE id="${id}"`;
    DB.query(Q, (err, result) => {
      done(err, result[0]);
    });
  });
};
