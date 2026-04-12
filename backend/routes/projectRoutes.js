import express from 'express';
import {
  submitProjectRequest,
  getStudentProjects,
  getTeacherProjects,
  getProjectById,
  approveProject,
  rejectProject,
  updateProjectProgress,
  addStudentToProject,
  completeProject,
  uploadSynopsis,
  downloadSynopsis,
  deleteProject,
} from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/request', protect, authorize('student'), submitProjectRequest);
router.get('/student', protect, authorize('student'), getStudentProjects);
router.get('/teacher', protect, authorize('teacher'), getTeacherProjects);
router.get('/:id', protect, getProjectById);
router.post('/:id/approve', protect, authorize('teacher'), approveProject);
router.post('/:id/reject', protect, authorize('teacher'), rejectProject);
router.delete('/:id', protect, deleteProject);
router.patch('/:id/progress', protect, updateProjectProgress);
router.post('/:id/students', protect, authorize('teacher'), addStudentToProject);
router.post('/:id/complete', protect, authorize('teacher'), completeProject);
router.post('/:id/synopsis', protect, authorize('student'), upload.single('synopsis'), uploadSynopsis);
router.get('/:id/synopsis/download', protect, downloadSynopsis);

export default router;
