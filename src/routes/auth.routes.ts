import { Router } from "express";
import {
  loginHandler,
  registerHandler,
  verifyEmailHandler,
} from "../controllers/auth/auth.controller";


const router = Router();

router.post("/login", loginHandler);
router.post("/register", registerHandler);
router.get("/verify-email", verifyEmailHandler);
router.get("/get-sectionsByRoadmapId:/:roadmapId",)

export default router;
