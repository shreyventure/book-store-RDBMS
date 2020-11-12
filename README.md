# book-store-rdbms

### Steps to setup
 - Create a mySQL user, navigate to `config/keys.js` and `devloper/config/keys.js`, update the user information.
 - In mySQL create four tables, `products`, `users`, `dev`, `transactions` .
 - This is how your database should look:
 
![](https://github.com/shreyventure/book-store-rdbms/blob/master/images/DATABASE.png)
 - Make sure to add the following descriptions to your table:
 
![](https://github.com/shreyventure/book-store-rdbms/blob/master/images/TABLES1.png)
![](https://github.com/shreyventure/book-store-rdbms/blob/master/images/TABLES2.png)

At this point we are pretty much setup with the database.

### Steps to install packages
 - Open up a terminal/command prompt in the project's directory.
 - Type in 
 ```sh 
 $ npm install
 ```
 once done type in 
 ```sh
 $ npm run devloper-install
 ```
 - Setup your stripes sandbox profile, copy the private and secret keys, head to `config/keys.js` and `devloper/config/keys.js`, and paste those in.
 - In your terminal/command prompt hit 
 ```sh
 $ npm start
 ```
 If everything goes fine, on your browser navigate to `localhost:5000` to buy books, and for admins navigate to `localhost:8000` to add, update, delete books.

