/** Database setup for BizTime. */

// const { Client } = require("pg");

// const client = new Client({
//   connectionString: "postgresql:///biztime"
// });

// client.connect();

// module.exports = client;

const { Client } = require("pg");

const DB_URI = (process.env.NODE_ENV === "test")
  ? "postgresql:///biztime_test"
  : "postgresql:///biztime";

let db = new Client({
  connectionString: DB_URI
});

db.connect();

module.exports = db;