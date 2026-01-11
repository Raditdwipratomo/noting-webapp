import dotenv from "dotenv";
import http from "http";
import app from "./app";
import { connectToDB } from "./config";
import { env } from "./config";

dotenv.config();

async function startServer() {
  await connectToDB();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    console.log(`Server is now listening on port ${env.PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error while starting the server: ", err);
  process.exit(1);
});
