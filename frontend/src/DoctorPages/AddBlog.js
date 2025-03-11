// import React, { useState } from "react";
// import axios from "axios";
// import Layout from "../DoctorComponents/Layout";
// import { useAuth } from "../context/AuthContext";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css"; // Import Quill styles

// const AddBlog = () => {
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [category, setCategory] = useState("");
//   const [image, setImage] = useState(null);
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const { user } = useAuth();
//   const doctorId = user?.id;

//   const handleImageChange = (e) => {
//     setImage(e.target.files[0]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!doctorId) {
//       setMessage("You must be logged in to add a blog.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("content", content); // Rich text content
//     formData.append("category", category);
//     formData.append("author", doctorId);
//     formData.append("image", image);

//     try {
//       setLoading(true);
//       const response = await axios.post(
//         "${process.env.REACT_APP_SERVER_URL}/blog/add-blog",
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       setMessage(response.data.message || "Blog added successfully!");
//       setTitle("");
//       setContent("");
//       setCategory("");
//       setImage(null);
//       setLoading(false);
//     } catch (error) {
//       setMessage("Error adding blog. Please try again.");
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
//         <h1 className="text-3xl font-bold mb-4">Add New Blog</h1>
//         {message && <p className="mb-4 text-red-600">{message}</p>}
//         <form onSubmit={handleSubmit}>
//           <input
//             type="text"
//             placeholder="Blog Title"
//             className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             required
//           />
//           {/* Rich Text Editor */}
//           <ReactQuill
//             theme="snow"
//             value={content}
//             onChange={setContent}
//             className="mb-4 bg-white"
//             placeholder="Write your blog content here..."
//           />
//           <input
//             type="text"
//             placeholder="Category"
//             className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             required
//           />
//           <input
//             type="file"
//             accept="image/*"
//             className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
//             onChange={handleImageChange}
//             required
//           />
//           <button
//             type="submit"
//             className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700"
//             disabled={loading}
//           >
//             {loading ? "Publishing..." : "Publish Blog"}
//           </button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default AddBlog;

import React, { useState } from 'react';
import axios from 'axios';
import Layout from '../DoctorComponents/Layout';
import { useAuth } from '../context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

const AddBlog = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const doctorId = user?.id;

  const categories = [
    'Healthy Lifestyle',
    'Women’s Health',
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
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorId) {
      setMessage('You must be logged in to add a blog.');
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

      setMessage(response.data.message || 'Blog added successfully!');
      setTitle('');
      setContent('');
      setCategory('');
      setImage(null);
      setLoading(false);
    } catch (error) {
      setMessage('Error adding blog. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Add New Blog</h1>
        {message && <p className="mb-4 text-red-600">{message}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Blog Title"
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          {/* Rich Text Editor */}
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            className="mb-4 bg-white"
            placeholder="Write your blog content here..."
          />
          {/* Category Dropdown */}
          <select
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            type="file"
            accept="image/*"
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
            onChange={handleImageChange}
            required
          />
          <button
            type="submit"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish Blog'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AddBlog;
