import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Mail, Building, Hash } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    semester: '',
    department: '',
    rollNo: '',
    password: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        semester: user.semester || '',
        department: user.department || '',
        rollNo: user.rollNo || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSaving(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      department: formData.department,
    };

    if (user.role === 'student') {
      payload.rollNo = formData.rollNo;
      payload.semester = formData.semester;
    }

    if (formData.password) {
      payload.password = formData.password;
    }

    const result = await updateProfile(payload);

    if (result.success) {
      toast.success('Profile updated successfully');
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } else {
      toast.error(result.message);
    }

    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Update your personal details and account settings.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-gray-700 font-medium">Full Name</span>
              <div className="mt-1 relative rounded-md shadow-sm">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="John Doe"
                  required
                />
              </div>
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Email</span>
              <div className="mt-1 relative rounded-md shadow-sm">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user?.role === 'student' && (
              <label className="block">
                <span className="text-gray-700 font-medium">Roll No.</span>
                <input
                  type="text"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="CSE23/069"
                  required
                />
              </label>
            )}

            {user?.role === 'student' && (
              <label className="block">
                <span className="text-gray-700 font-medium">Semester</span>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Hash className="h-4 w-4" />
                  </span>
                  <input
                    type="number"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="3"
                    min="1"
                    max="8"
                    required
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="text-gray-700 font-medium">Department</span>
              <div className="mt-1 relative rounded-md shadow-sm">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Building className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Computer Science"
                />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-gray-700 font-medium">New Password</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Leave blank to keep current password"
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Confirm Password</span>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field"
                placeholder="Confirm new password"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              to={user?.role === 'student' ? '/student/dashboard' : '/teacher/dashboard'}
              className="inline-flex justify-center px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex justify-center px-6 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
