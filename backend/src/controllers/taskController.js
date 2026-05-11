const prisma = require('../prisma');

// @desc    Get all tasks (with filtering)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const { status, priority, projectId, assignedTo, overdue } = req.query;

    const where = {};

    // Role-based filtering
    if (role === 'MEMBER') {
      where.assignedTo = userId;
    }

    // Apply filters
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = projectId;
    if (assignedTo) where.assignedTo = assignedTo;
    if (overdue === 'true') {
      where.dueDate = { lt: new Date() };
      where.status = { not: 'COMPLETED' };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate, assignedTo, projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and projectId are required' });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        createdBy: req.user.id,
        assignedTo: assignedTo || null,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
      },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // MEMBER can only update status of tasks assigned to them
    if (role === 'MEMBER') {
      if (task.assignedTo !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      // Members can only update status
      const updatedTask = await prisma.task.update({
        where: { id: req.params.id },
        data: { status: req.body.status || task.status },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          creator: { select: { id: true, name: true } },
          project: { select: { id: true, title: true } },
        },
      });
      return res.json(updatedTask);
    }

    // ADMIN can update everything
    const { title, description, priority, status, dueDate, assignedTo } = req.body;

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title: title || task.title,
        description: description !== undefined ? description : task.description,
        priority: priority || task.priority,
        status: status || task.status,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : task.dueDate,
        assignedTo: assignedTo !== undefined ? assignedTo : task.assignedTo,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
      },
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await prisma.task.delete({ where: { id: req.params.id } });

    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
