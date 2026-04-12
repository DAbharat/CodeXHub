import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, ArrowRight, Trash2 } from 'lucide-react';

const ProjectCard = ({ project, role, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDeleteClick = async () => {
    if (onDelete) {
      await onDelete(project._id);
    }
    setShowDeleteConfirm(false);
  };

  const studentCount = Array.isArray(project.students) ? project.students.length : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{project.title}</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
          {project.status}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

      <div className="space-y-2 mb-4">
        {role === 'student' && project.guide && (
          <div className="flex items-center text-sm text-gray-500">
            <span className="font-medium">Guide:</span>
            <span className="ml-2">{project.guide.name}</span>
          </div>
        )}

        {role === 'teacher' && (
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            <span>{studentCount} student{studentCount !== 1 ? 's' : ''}</span>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Semester {project.semester}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <Link
        to={`/project/${project._id}`}
        className="flex items-center justify-center w-full btn-primary"
      >
        View Details
        <ArrowRight className="h-4 w-4 ml-2" />
      </Link>

      {/* Delete Button */}
      {role === 'student' && (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="mt-3 w-full flex items-center justify-center px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Project
        </button>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{project.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClick}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
