import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Project from '../models/Project.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Submit project request
// @route   POST /api/projects/request
// @access  Private/Student
export const submitProjectRequest = async (req, res) => {
  try {
    const { title, description, semester, guideId, synopsisFile } = req.body;

    // Check if teacher exists
    const teacher = await User.findById(guideId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Create project
    const project = await Project.create({
      title,
      description,
      guide: guideId,
      students: [req.user._id],
      semester,
      synopsisFile,
      status: 'pending',
      progress: 0,
    });

    // Add project to student's projects
    await User.findByIdAndUpdate(req.user._id, {
      $push: { projects: project._id },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Submit project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get student's projects
// @route   GET /api/projects/student
// @access  Private/Student
export const getStudentProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      students: req.user._id,
    }).populate('guide', 'name email');

    res.json(projects);
  } catch (error) {
    console.error('Get student projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get teacher's projects
// @route   GET /api/projects/teacher
// @access  Private/Teacher
export const getTeacherProjects = async (req, res) => {
  try {
    const projects = await Project.find({ guide: req.user._id })
      .populate('students', 'name email semester department')
      .populate('guide', 'name email');

    res.json(projects);
  } catch (error) {
    console.error('Get teacher projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('guide', 'name email')
      .populate('students', 'name email semester department');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to the project
    const isStudent = project.students.some(
      s => s._id.toString() === req.user._id.toString()
    );
    const isGuide = project.guide._id.toString() === req.user._id.toString();

    if (!isStudent && !isGuide && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve project
// @route   POST /api/projects/:id/approve
// @access  Private/Teacher
export const approveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the guide
    if (project.guide.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to approve this project' });
    }

    project.status = 'approved';
    project.startDate = new Date();
    await project.save();

    res.json(project);
  } catch (error) {
    console.error('Approve project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject project
// @route   POST /api/projects/:id/reject
// @access  Private/Teacher
export const rejectProject = async (req, res) => {
  try {
    const { reason } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the guide
    if (project.guide.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this project' });
    }

    project.status = 'rejected';
    if (reason) {
      project.description += `\n\nRejection Reason: ${reason}`;
    }
    await project.save();

    res.json(project);
  } catch (error) {
    console.error('Reject project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update project progress
// @route   PATCH /api/projects/:id/progress
// @access  Private
export const updateProjectProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization
    const isStudent = project.students.some(
      s => s.toString() === req.user._id.toString()
    );
    const isGuide = project.guide.toString() === req.user._id.toString();

    if (!isStudent && !isGuide) {
      return res.status(403).json({ message: 'Not authorized to update progress' });
    }

    if (progress !== undefined) {
      project.progress = Math.min(100, Math.max(0, progress));
    }

    await project.save();

    res.json(project);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add student to project
// @route   POST /api/projects/:id/students
// @access  Private/Teacher
export const addStudentToProject = async (req, res) => {
  try {
    const { studentId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the guide
    if (project.guide.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this project' });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Add student if not already in project
    if (!project.students.includes(studentId)) {
      project.students.push(studentId);
      await project.save();

      // Update student's projects
      await User.findByIdAndUpdate(studentId, {
        $push: { projects: project._id },
      });
    }

    res.json(project);
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark project as completed
// @route   POST /api/projects/:id/complete
// @access  Private/Teacher
export const completeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the guide
    if (project.guide.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to complete this project' });
    }

    project.status = 'completed';
    project.progress = 100;
    project.endDate = new Date();
    await project.save();

    res.json(project);
  } catch (error) {
    console.error('Complete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload synopsis file
// @route   POST /api/projects/:id/synopsis
// @access  Private/Student
export const uploadSynopsis = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is a student in this project
    const isStudent = project.students.some(
      s => s.toString() === req.user._id.toString()
    );

    if (!isStudent) {
      return res.status(403).json({ message: 'Not authorized to upload synopsis for this project' });
    }

    // Check if project is approved
    if (project.status !== 'approved') {
      return res.status(400).json({ message: 'Project must be approved before uploading synopsis' });
    }

    // Check if synopsis already uploaded
    if (project.synopsisFile) {
      return res.status(400).json({ message: 'Synopsis already uploaded for this project' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    project.synopsisFile = req.file.filename;
    project.synopsisOriginalName = req.file.originalname;
    await project.save();

    res.json({
      message: 'Synopsis uploaded successfully',
      project: {
        _id: project._id,
        synopsisFile: project.synopsisFile,
        synopsisOriginalName: project.synopsisOriginalName,
      },
    });
  } catch (error) {
    console.error('Upload synopsis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Download synopsis file
// @route   GET /api/projects/:id/synopsis/download
// @access  Private
export const downloadSynopsis = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('guide', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isStudent = project.students.some(
      s => s.toString() === req.user._id.toString()
    );
    const isGuide = project.guide && project.guide._id.toString() === req.user._id.toString();

    if (!isStudent && !isGuide) {
      return res.status(403).json({ message: 'Not authorized to download this synopsis' });
    }

    if (!project.synopsisFile) {
      return res.status(404).json({ message: 'Synopsis not uploaded' });
    }

    const filePath = path.join(__dirname, '../../uploads', project.synopsisFile);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Synopsis file not found' });
    }

    return res.download(filePath, project.synopsisOriginalName || project.synopsisFile);
  } catch (error) {
    console.error('Download synopsis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
