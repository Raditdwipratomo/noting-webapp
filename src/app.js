const express = require("express");
const cookieParser = require("cookie-parser");

const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", require("./routes"));

// app.use((err, req, res, next) => {
//   console.error("ERROR MESSAGE:", err.message);
//   console.error("SQL MESSAGE:", err.parent?.sqlMessage);
//   console.error("SQL QUERY:", err.parent?.sql);

//   res.status(500).json({
//     success: false,
//     message: err.message,
//     sqlMessage: err.parent?.sqlMessage,
//   });
// });
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({
//     success: false,
//     message: "Something went wrong!",
//   });
// });

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
