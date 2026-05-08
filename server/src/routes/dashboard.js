import { Router } from "express";
import prisma from "../prisma.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === "ADMIN";
    const userId = req.user.userId;

    const taskWhere = isAdmin
      ? {}
      : { OR: [{ assigneeId: userId }, { project: { ownerId: userId } }] };

    const [totalProjects, tasks, totalMembers, usersWithTasks] = await Promise.all([
      prisma.project.count(isAdmin ? {} : { where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }, { tasks: { some: { assigneeId: userId } } }] } }),
      prisma.task.findMany({ where: taskWhere, select: { status: true, dueDate: true } }),
      prisma.user.count(),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          _count: { select: { tasks: true } },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    const now = new Date();
    const stats = {
      totalProjects,
      totalMembers,
      totalTasks: tasks.length,
      todoTasks: tasks.filter((t) => t.status === "TODO").length,
      inProgressTasks: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      doneTasks: tasks.filter((t) => t.status === "DONE").length,
      overdueTasks: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE").length,
      tasksPerUser: usersWithTasks.map((u) => ({
        id: u.id,
        name: u.name,
        taskCount: u._count.tasks,
      })),
    };

    res.json({ stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
