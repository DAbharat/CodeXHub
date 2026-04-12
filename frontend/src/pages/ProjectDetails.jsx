import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, wprAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Users,
  Calendar,
  FileText,
  Download,
  Plus,
  CheckCircle,
  Clock,
  ArrowLeft,
  Send,
  Upload,
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStudent, isTeacher } = useAuth();
  const [project, setProject] = useState(null);
  const [wprs, setWprs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWPRModal, setShowWPRModal] = useState(false);
  const [showSynopsisModal, setShowSynopsisModal] = useState(false);
  const [synopsisFile, setSynopsisFile] = useState(null);
  const [newWPR, setNewWPR] = useState({
    weekNumber: '',
    progressDescription: '',
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projectRes, wprRes] = await Promise.all([
        projectsAPI.getProject(id),
        wprAPI.getProjectWPRs(id),
      ]);
      setProject(projectRes.data);
      setWprs(wprRes.data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleWPRSubmit = async (e) => {
    e.preventDefault();

    if (!newWPR.weekNumber || !newWPR.progressDescription) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await wprAPI.submit(id, {
        weekNumber: parseInt(newWPR.weekNumber),
        progressDescription: newWPR.progressDescription,
      });
      toast.success('WPR submitted successfully!');
      setShowWPRModal(false);
      setNewWPR({ weekNumber: '', progressDescription: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit WPR');
    }
  };

  const handleCompleteProject = async () => {
    if (!confirm('Mark this project as completed?')) return;

    try {
      await projectsAPI.completeProject(id);
      toast.success('Project marked as completed!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete project');
    }
  };

  const handleDownloadSynopsis = async () => {
    try {
      const response = await projectsAPI.downloadSynopsis(id);
      const contentDisposition = response.headers['content-disposition'];
      let filename = project.synopsisOriginalName || 'synopsis';

      if (contentDisposition) {
        const matches = /filename\*=UTF-8''(.+)|filename="?([^";]+)"?/.exec(contentDisposition);
        if (matches) {
          filename = decodeURIComponent(matches[1] || matches[2]);
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download synopsis');
    }
  };

  const handleSynopsisUpload = async (e) => {
    e.preventDefault();

    if (!synopsisFile) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('synopsis', synopsisFile);

    try {
      await projectsAPI.uploadSynopsis(id, formData);
      toast.success('Synopsis uploaded successfully!');
      setShowSynopsisModal(false);
      setSynopsisFile(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload synopsis');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a PDF, DOC, DOCX, or TXT file');
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSynopsisFile(file);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
          <button onClick={() => navigate(-1)} className="btn-primary mt-4">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const canSubmitWPR =
    isStudent &&
    project.students?.some((s) => s._id === user._id) &&
    project.status === 'approved';

  const canUploadSynopsis =
    isStudent &&
    project.students?.some((s) => s._id === user._id) &&
    project.status === 'approved' &&
    !project.synopsisFile;

  const isGuide = isTeacher && project.guide?._id === user._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </button>

      {/* Project Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-gray-600 mt-2">{project.description}</p>
          </div>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
              project.status
            )}`}
          >
            {project.status}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-semibold">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                project.progress === 100
                  ? 'bg-green-600'
                  : 'bg-primary-600'
              }`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Project Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center text-gray-600">
            <Users className="h-5 w-5 mr-2" />
            <span>
              {Array.isArray(project.students) ? project.students.length : 0} Student
              {Array.isArray(project.students) && project.students.length !== 1
                ? 's'
                : ''}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-2" />
            <span>Semester {project.semester}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FileText className="h-5 w-5 mr-2" />
            <span>Guide: {project.guide?.name || 'N/A'}</span>
          </div>
        </div>

        {/* Synopsis Section */}
        {project.synopsisFile && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-blue-800">
                <FileText className="h-5 w-5 mr-2" />
                <span className="font-medium">Synopsis Uploaded</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadSynopsis}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded text-sm transition-colors flex items-center"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex space-x-3">
          {canSubmitWPR && (
            <button
              onClick={() => setShowWPRModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Submit WPR
            </button>
          )}
          {canUploadSynopsis && (
            <button
              onClick={() => setShowSynopsisModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Synopsis
            </button>
          )}
          {isGuide && project.status === 'approved' && (
            <button
              onClick={handleCompleteProject}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* Students Section (Teacher View) */}
      {isTeacher && project.students && project.students.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Project Students
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.students.map((student) => (
              <div
                key={student._id}
                className="border rounded-lg p-4 flex items-center space-x-3"
              >
                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {student.name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-500">
                    {student.semester} - {student.department}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WPR Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Weekly Progress Reports
          </h2>
          <span className="text-sm text-gray-500">
            {wprs.length} report{wprs.length !== 1 ? 's' : ''} submitted
          </span>
        </div>

        {wprs.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No progress reports submitted yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {wprs.map((wpr, index) => (
              <div
                key={wpr._id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                      Week {wpr.weekNumber}
                    </span>
                    <span className="text-sm text-gray-500">
                      by {wpr.submittedBy?.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(wpr.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{wpr.progressDescription}</p>
                {wpr.file && (
                  <a
                    href={`/uploads/${wpr.file}`}
                    download
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 mt-2 text-sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download Attachment
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WPR Modal */}
      {showWPRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Submit Weekly Progress Report
            </h2>
            <form onSubmit={handleWPRSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Week Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={newWPR.weekNumber}
                  onChange={(e) =>
                    setNewWPR({ ...newWPR, weekNumber: e.target.value })
                  }
                  className="input-field"
                  placeholder="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progress Description
                </label>
                <textarea
                  value={newWPR.progressDescription}
                  onChange={(e) =>
                    setNewWPR({
                      ...newWPR,
                      progressDescription: e.target.value,
                    })
                  }
                  className="input-field"
                  rows={4}
                  placeholder="Describe what you accomplished this week..."
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWPRModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary flex items-center justify-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Synopsis Upload Modal */}
      {showSynopsisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Upload Project Synopsis
            </h2>
            <form onSubmit={handleSynopsisUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Synopsis File
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: PDF, DOC, DOCX, TXT (Max 5MB)
                </p>
              </div>

              {synopsisFile && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    Selected: {synopsisFile.name}
                  </p>
                  <p className="text-xs text-blue-600">
                    Size: {(synopsisFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSynopsisModal(false);
                    setSynopsisFile(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary flex items-center justify-center"
                  disabled={!synopsisFile}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
