import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../DoctorComponents/Layout';
import { FaTrash, FaEdit, FaPlus, FaSearch } from 'react-icons/fa';

const DoctorBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { user } = useAuth();
  const doctorId = user?.id;

  const categories = [
    'All',
    'Healthy Lifestyle',
    "Women's Health",
    'Skin Care',
    'Fitness & Exercise',
    'Health News',
    'Dental Health',
    'Sonology',
    'Mental Well-Being',
    'Health Fact Check',
    'New Health Researches',
  ];

  useEffect(() => {
    fetchBlogs();
  }, [doctorId]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/blog/blogs`);
      const doctorBlogs = response.data.filter((blog) => blog.author._id === doctorId);
      setBlogs(doctorBlogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_URL}/blog/delete-blog/${blogId}`, {
        data: { author: doctorId },
      });
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== blogId));
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || selectedCategory === '' || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Blog Posts</h1>
            <p className="text-gray-600 mt-2">Manage and organize your medical articles</p>
          </div>
          <Link
            to="/doctor/blogs"
            className="mt-4 md:mt-0 flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            <FaPlus className="mr-2" />
            Create New Blog
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-64 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Blog Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FaEdit className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Blogs Found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'All' 
                ? 'Try adjusting your filters'
                : 'Start creating your first blog post'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={blog.image} 
                    alt={blog.title} 
                    className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-gray-700">
                      {blog.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <Link to={`../blogs/${blog._id}`}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors duration-300">
                      {blog.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 text-sm mb-4">
                    {new Date(blog.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <div className="flex justify-between items-center">
                    <Link
                      to={`../blogs/${blog._id}`}
                      className="text-blue-600 font-medium hover:text-blue-700 transition-colors duration-300"
                    >
                      Read More
                    </Link>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-300"
                      title="Delete Blog"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DoctorBlogs;
