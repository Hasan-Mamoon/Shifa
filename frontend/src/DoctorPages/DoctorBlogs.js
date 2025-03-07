// // src/pages/DoctorBlogs.jsx
// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";
// import Layout from "../DoctorComponents/Layout";
// const DoctorBlogs = () => {
//   const [blogs, setBlogs] = useState([]);
//   const { user } = useAuth();
//   const doctorId =  user?.id;

//   useEffect(() => {
//     axios
//       .get(`${process.env.REACT_APP_SERVER_URL}/blog/blogs`)
//       .then((response) => {
//         const doctorBlogs = response.data.filter(
//           (blog) => blog.author._id === doctorId
//         );
//         setBlogs(doctorBlogs);
//       })
//       .catch((error) => console.error("Error fetching blogs:", error));
//   }, []);

//   return (
//     <Layout>
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-semibold text-center mb-6">My Blogs</h1>

//       {blogs.length === 0 ? (
//         <p className="text-center text-gray-500">No blogs created yet.</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           {blogs.map((blog) => (
//             <Link
//             to={`../blogs/${blog._id}`}
//               key={blog._id}
//               className="block bg-white shadow-md rounded-lg overflow-hidden transform hover:scale-105 transition duration-300"
//             >
//               <img
//                 src={blog.image}
//                 alt={blog.title}
//                 className="w-full h-48 object-cover"
//               />
//               <div className="p-4">
//                 <h2 className="text-lg font-semibold">{blog.title}</h2>
//               </div>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//     </Layout>
//   );
// };

// export default DoctorBlogs;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../DoctorComponents/Layout';
import { assets } from '../assets/assets';
import binIcon from '../assets/img1.png'; // Adjust the path as needed

const DoctorBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const { user } = useAuth();
  const doctorId = user?.id;

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/blog/blogs`)
      .then((response) => {
        const doctorBlogs = response.data.filter((blog) => blog.author._id === doctorId);
        setBlogs(doctorBlogs);
      })
      .catch((error) => console.error('Error fetching blogs:', error));
  }, [doctorId]);

  const handleDelete = async (blogId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_URL}/blog/delete-blog/${blogId}`, {
        data: { author: doctorId },
      });

      // Remove the deleted blog from the state
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== blogId));
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-center mb-6">My Blogs</h1>

        {blogs.length === 0 ? (
          <p className="text-center text-gray-500">No blogs created yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="relative block bg-white shadow-md rounded-lg overflow-hidden transform hover:scale-105 transition duration-300"
              >
                <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover" />
                <div className="p-4 flex items-center justify-between">
                  <Link to={`../blogs/${blog._id}`}>
                    <h2 className="text-lg font-semibold">{blog.title}</h2>
                  </Link>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="p-2 rounded-full hover:bg-red-100 transition duration-200"
                  >
                    <img
                      src={binIcon}
                      alt="Delete"
                      className="w-8 h-8 min-w-6 min-h-6 max-w-6 max-h-6"
                    />
                  </button>
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
