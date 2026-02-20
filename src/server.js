const db = require("./models");
const http = require("http");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config();

const startServer = async () => {
  try {
    await db.testConnection();

    const server = http.createServer(app);

    if (process.env.NODE_ENV === "development") {
      await db.syncDatabase();
    }

    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server: ", error);
    process.exit(1);
  }
};

startServer();

process.on("SIGINT", async () => {
  await db.closeConnection();
  process.exit(0);
});
