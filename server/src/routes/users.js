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
        _count: { select: { tasks: true, projects: true, projectMembers: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    const formattedUsers = users.map((u) => ({
      ...u,
      _count: {
        tasks: u._count.tasks,
        projects: u._count.projects + u._count.projectMembers,
      },
    }));
    res.json({ users: formattedUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
