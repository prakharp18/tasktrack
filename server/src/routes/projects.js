import { Router } from "express";
import prisma from "../prisma.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    const where =
      req.user.role === "ADMIN"
        ? {}
        : {
            OR: [
              { ownerId: req.user.userId },
              { members: { some: { userId: req.user.userId } } },
              { tasks: { some: { assigneeId: req.user.userId } } },
            ],
          };

    const projects = await prisma.project.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true } },
        _count: { select: { tasks: true, members: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.json({ projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: {
          include: { assignee: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) return res.status(404).json({ error: "Not found" });

    const isMember = project.members.some((m) => m.userId === req.user.userId);
    const isAssigned = project.tasks.some((t) => t.assigneeId === req.user.userId);
    if (req.user.role !== "ADMIN" && project.ownerId !== req.user.userId && !isMember && !isAssigned) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description?.trim() || "",
        ownerId: req.user.userId,
      },
    });

    res.status(201).json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Not found" });

    if (req.user.role !== "ADMIN" && existing.ownerId !== req.user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const data = {};
    if (req.body.title !== undefined) data.title = req.body.title.trim();
    if (req.body.description !== undefined) data.description = req.body.description.trim();
    if (req.body.status !== undefined) data.status = req.body.status;

    const project = await prisma.project.update({ where: { id: req.params.id }, data });
    res.json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Not found" });

    if (req.user.role !== "ADMIN" && existing.ownerId !== req.user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/members", auth, adminOnly, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: req.params.id } },
    });
    if (existing) return res.status(400).json({ error: "Already a member" });

    const member = await prisma.projectMember.create({
      data: { userId, projectId: req.params.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({ member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id/members/:userId", auth, adminOnly, async (req, res) => {
  try {
    const record = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.params.userId, projectId: req.params.id } },
    });
    if (!record) return res.status(404).json({ error: "Not a member" });

    await prisma.projectMember.delete({ where: { id: record.id } });
    res.json({ message: "Removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
