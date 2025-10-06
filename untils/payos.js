// require("dotenv").config();
// const { PayOS } = require("@payos/node");

// const payos = new PayOS(
//   process.env.PAYOS_CLIENT_ID,
//   process.env.PAYOS_API_KEY,
//   process.env.PAYOS_CHECKSUM_KEY
// );

// console.log("✅ PayOS SDK đã khởi tạo thành công");

// module.exports = payos;
require("dotenv").config();

const PayOS = require("@payos/node").PayOS;

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

console.log("✅ PayOS SDK v2.0.3 đã khởi tạo thành công");

module.exports = payos;
