import { Router } from "express";
import prisma from "../prisma.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { tasks: true, projects: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
