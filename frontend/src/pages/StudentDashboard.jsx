import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, analyticsAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import toast from 'react-hot-toast';
import { Plus, Users, FileText, TrendingUp, AlertCircle } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    semester: '',
    guideId: '',
  });

  // Fetch all teachers for project request
  const fetchTeachers = async () => {
    try {
      const response = await projectsAPI.getTeachers();
      setTeachers(response.data);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, analyticsRes, teachersRes] = await Promise.all([
        projectsAPI.getMyProjects(),
        analyticsAPI.getStudentAnalytics(user._id),
        projectsAPI.getTeachers(),
      ]);

      setProjects(projectsRes.data);
      setAnalytics(analyticsRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectRequest = async (e) => {
    e.preventDefault();

    if (!newProject.guideId) {
      toast.error('Please select a teacher guide');
      return;
    }

    try {
      await projectsAPI.submitRequest({
        ...newProject,
        semester: parseInt(newProject.semester),
      });
      toast.success('Project request submitted successfully!');
      setShowRequestModal(false);
      setNewProject({ title: '', description: '', semester: '', guideId: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await projectsAPI.deleteProject(projectId);
      toast.success('Project deleted successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  // Get available teachers
  const getAvailableTeachers = () => {
    return teachers;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user.name} ({user.department})
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Request Project
        </button>
      </div>

      {/* Statistics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.statistics.totalProjects}
                </p>
              </div>
              <FileText className="h-10 w-10 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.statistics.activeProjects}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.statistics.completedProjects}
                </p>
              </div>
              <AlertCircle className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.statistics.avgProgress}%
                </p>
              </div>
              <Users className="h-10 w-10 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Projects Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Projects</h2>
        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
            <p className="text-gray-600 mb-4">
              Request a project to get started with your academic journey
            </p>
            <button onClick={() => setShowRequestModal(true)} className="btn-primary">
              Request Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} role="student" onDelete={handleDeleteProject} />
            ))}
          </div>
        )}
      </div>

      {/* Recent WPRs */}
      {analytics?.recentWPRs && analytics.recentWPRs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Progress Reports</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Week
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.recentWPRs.slice(0, 5).map((wpr) => (
                  <tr key={wpr._id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{wpr.project?.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Week {wpr.weekNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(wpr.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Project Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request New Project</h2>
            <form onSubmit={handleProjectRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject({ ...newProject, title: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  className="input-field"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <select
                  value={newProject.semester}
                  onChange={(e) =>
                    setNewProject({ ...newProject, semester: e.target.value })
                  }
                  className="input-field"
                  required
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teacher Guide
                </label>
                <select
                  value={newProject.guideId}
                  onChange={(e) =>
                    setNewProject({ ...newProject, guideId: e.target.value })
                  }
                  className="input-field"
                  required
                >
                  <option value="">Select a Teacher</option>
                  {getAvailableTeachers().map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
