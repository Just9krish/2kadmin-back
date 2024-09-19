const mongoose = require('mongoose');

console.log(process.env.DB_URI);

const connetDatabase = () =>
  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`mongodb connected with server ${data.connection.host}`);
    });

module.exports = connetDatabase;
