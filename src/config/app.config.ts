import { env } from "./env.config";

export const appConfig = {
  name: "AI EduMentor",
  env: env.NODE_ENV,
  port: env.PORT,

  cors: {
    origin: "*",
    credentials: true,
  },

  pagination: {
    defaultLimit: 10,
    maxLimit: 50,
  },
};
