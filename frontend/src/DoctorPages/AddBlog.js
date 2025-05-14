import React, { useState } from 'react';
import axios from 'axios';
import Layout from '../DoctorComponents/Layout';
import { useAuth } from '../context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FaImage, FaTags, FaHeading, FaCheck, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 }
};

const formControls = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const AddBlog = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const { user } = useAuth();
  const doctorId = user?.id;

  const categories = [
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorId) {
      setMessage('You must be logged in to add a blog.');
      setMessageType('error');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    formData.append('author', doctorId);
    formData.append('image', image);

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/blog/add-blog`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      setMessage(response.data.message || 'Blog published successfully!');
      setMessageType('success');
      setTitle('');
      setContent('');
      setCategory('');
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      setMessage('Error publishing blog. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full p-3"
      >
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white"
          >
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold"
            >
              Create New Blog Post
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2 opacity-90"
            >
              Share your medical knowledge and insights
            </motion.p>
          </motion.div>

          {/* Message Toast */}
          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-4 ${
                  messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                } flex items-center justify-between`}
              >
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex items-center"
                >
                  {messageType === 'success' ? (
                    <FaCheck className="mr-2" />
                  ) : (
                    <FaTimes className="mr-2" />
                  )}
                  {message}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            onSubmit={handleSubmit} 
            className="p-6 space-y-6"
          >
            {/* Title Input */}
            <motion.div variants={formControls} className="space-y-2">
              <div className="flex items-center text-gray-700 mb-2">
                <FaHeading className="mr-2" />
                <label className="font-medium">Blog Title</label>
              </div>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                placeholder="Enter an engaging title..."
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </motion.div>

            {/* Rich Text Editor */}
            <motion.div variants={formControls} className="space-y-2">
              <label className="font-medium text-gray-700">Content</label>
              <motion.div 
                whileFocus={{ scale: 1.01 }}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  className="bg-white h-64"
                  placeholder="Start writing your blog content..."
                />
              </motion.div>
            </motion.div>

            {/* Category Selection */}
            <motion.div variants={formControls} className="space-y-2">
              <div className="flex items-center text-gray-700 mb-2">
                <FaTags className="mr-2" />
                <label className="font-medium">Category</label>
              </div>
              <motion.select
                whileFocus={{ scale: 1.01 }}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </motion.select>
            </motion.div>

            {/* Image Upload */}
            <motion.div variants={formControls} className="space-y-2">
              <div className="flex items-center text-gray-700 mb-2">
                <FaImage className="mr-2" />
                <label className="font-medium">Cover Image</label>
              </div>
              <motion.div className="flex items-center space-x-4">
                <motion.label 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 cursor-pointer"
                >
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 ${
                    imagePreview ? 'border-blue-500' : 'border-gray-300 hover:border-blue-500'
                  }`}>
                    <AnimatePresence mode="wait">
                      {imagePreview ? (
                        <motion.div 
                          key="preview"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="relative"
                        >
                          <motion.img
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-40 mx-auto rounded-lg"
                          />
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mt-2 text-sm text-gray-600"
                          >
                            Click to change image
                          </motion.p>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="upload"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="py-8"
                        >
                          <motion.div
                            animate={{ 
                              scale: [1, 1.1, 1],
                              transition: { 
                                repeat: Infinity, 
                                duration: 2,
                                ease: "easeInOut"
                              }
                            }}
                          >
                            <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                          </motion.div>
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mt-2 text-sm text-gray-600"
                          >
                            Click to upload an image
                          </motion.p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      required
                    />
                  </div>
                </motion.label>
              </motion.div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              variants={formControls}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl text-white font-medium shadow-lg
                transform transition-all duration-300 
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl'
                }`}
            >
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center"
                >
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Publishing...
                </motion.div>
              ) : (
                'Publish Blog'
              )}
            </motion.button>
          </motion.form>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default AddBlog;
