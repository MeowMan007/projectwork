const prisma = require('../prisma');

// @desc    Get all projects for logged-in user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    let projects;

    if (role === 'ADMIN') {
      // Admin sees all projects they created
      projects = await prisma.project.findMany({
        where: { createdBy: userId },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          members: { select: { id: true, name: true, email: true, role: true } },
          tasks: { select: { id: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Member sees only projects they are in
      projects = await prisma.project.findMany({
        where: {
          members: { some: { id: userId } },
        },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          members: { select: { id: true, name: true, email: true, role: true } },
          tasks: { select: { id: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true, role: true } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  try {
    const { title, description, memberIds = [] } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        createdBy: req.user.id,
        members: {
          connect: memberIds.map((id) => ({ id })),
        },
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
  try {
    const { title, description, memberIds } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updatedData = {
      title: title || project.title,
      description: description !== undefined ? description : project.description,
    };

    if (memberIds !== undefined) {
      updatedData.members = {
        set: memberIds.map((id) => ({ id })),
      };
    }

    const updatedProject = await prisma.project.update({
      where: { id: req.params.id },
      data: updatedData,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await prisma.project.delete({ where: { id: req.params.id } });

    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all members (for admin to add to project)
// @route   GET /api/projects/members/all
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getAllUsers,
};
