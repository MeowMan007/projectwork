const prisma = require('../prisma');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const now = new Date();

    let taskWhere = {};
    let projectWhere = {};

    if (role === 'MEMBER') {
      taskWhere.assignedTo = userId;
      projectWhere = { members: { some: { id: userId } } };
    } else {
      projectWhere = { createdBy: userId };
    }

    // Aggregate task counts
    const [totalTasks, completedTasks, inProgressTasks, overdueTasks] = await Promise.all([
      prisma.task.count({ where: taskWhere }),
      prisma.task.count({ where: { ...taskWhere, status: 'COMPLETED' } }),
      prisma.task.count({ where: { ...taskWhere, status: 'IN_PROGRESS' } }),
      prisma.task.count({
        where: {
          ...taskWhere,
          dueDate: { lt: now },
          status: { not: 'COMPLETED' },
        },
      }),
    ]);

    const pendingTasks = totalTasks - completedTasks;

    // Per-project stats
    const projects = await prisma.project.findMany({
      where: projectWhere,
      select: {
        id: true,
        title: true,
        tasks: {
          where: role === 'MEMBER' ? { assignedTo: userId } : {},
          select: { status: true },
        },
        members: { select: { id: true } },
      },
    });

    const projectStats = projects.map((p) => ({
      id: p.id,
      title: p.title,
      total: p.tasks.length,
      completed: p.tasks.filter((t) => t.status === 'COMPLETED').length,
      inProgress: p.tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      todo: p.tasks.filter((t) => t.status === 'TODO').length,
      memberCount: p.members.length,
    }));

    // Recent activity (last 5 tasks created/updated)
    const recentTasks = await prisma.task.findMany({
      where: taskWhere,
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        project: { select: { title: true } },
        assignee: { select: { name: true } },
      },
    });

    res.json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      projectStats,
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
