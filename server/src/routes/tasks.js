import { Router } from "express";
import prisma from "../prisma.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.post("/", auth, async (req, res) => {
  try {
    const { title, description, priority, projectId, assigneeId, dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ error: "Title and project are required" });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (req.user.role !== "ADMIN" && project.ownerId !== req.user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
      if (!assignee) return res.status(404).json({ error: "Assignee not found" });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || "",
        priority: priority || "MEDIUM",
        projectId,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: { assignee: { select: { id: true, name: true } } },
    });

    res.status(201).json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const existing = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });
    if (!existing) return res.status(404).json({ error: "Not found" });

    const isAdmin = req.user.role === "ADMIN";
    const isOwner = existing.project.ownerId === req.user.userId;
    const isAssignee = existing.assigneeId === req.user.userId;

    if (!isAdmin && !isOwner && !isAssignee) {
      return res.status(403).json({ error: "Access denied" });
    }

    const data = {};
    if (isAdmin || isOwner) {
      if (req.body.title !== undefined) data.title = req.body.title.trim();
      if (req.body.description !== undefined) data.description = req.body.description.trim();
      if (req.body.priority !== undefined) data.priority = req.body.priority;
      if (req.body.assigneeId !== undefined) data.assigneeId = req.body.assigneeId || null;
      if (req.body.dueDate !== undefined) data.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    }
    if (req.body.status !== undefined) data.status = req.body.status;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data,
      include: { assignee: { select: { id: true, name: true } } },
    });

    res.json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const existing = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });
    if (!existing) return res.status(404).json({ error: "Not found" });

    if (req.user.role !== "ADMIN" && existing.project.ownerId !== req.user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
