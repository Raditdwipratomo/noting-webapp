const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const pertumbuhanRoutes = require("./routes/pertumbuhanRoutes");
// const giziRoutes = require("./routes/giziRoutes");
// const anakRoutes = require("./routes/anakRoutes");
const alergiRoutes = require("./routes/alergiRoutes");
const diagnosaRoutes = require("./routes/diagnosaRoutes");

const app = express();

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/anak/:anakId/pertumbuhan", pertumbuhanRoutes);

// app.use("/api/anak/:anakId/gizi", giziRoutes);

// app.use("/api/anak/:anakId/anak", anakRoutes);

app.use("/api/anak/:anakId/alergi", alergiRoutes);

app.use("/api/anak/:anakId/diagnosa", diagnosaRoutes);


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
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

module.exports = app;
