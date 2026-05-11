const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getAllUsers,
} = require('../controllers/projectController');
const { protect, admin } = require('../middleware/auth');

router.get('/members/all', protect, admin, getAllUsers);
router.route('/').get(protect, getProjects).post(protect, admin, createProject);
router
  .route('/:id')
  .get(protect, getProjectById)
  .put(protect, admin, updateProject)
  .delete(protect, admin, deleteProject);

module.exports = router;
