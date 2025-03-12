import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const DoctorBlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/blog/blogs/${id}`)
      .then((response) => {
        setBlog(response.data);
      })
      .catch((error) => console.error('Error fetching blog details:', error));
  }, [id]);

  if (!blog) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading blog details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        {blog.image && (
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-auto object-cover"
            style={{
              maxHeight: '600px',
              width: '100%',
              borderRadius: '10px',
              imageRendering: 'auto',
            }}
            loading="lazy"
          />
        )}
        <div className="p-6">
          <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>

          <p className="text-gray-500 mt-4">
            <strong>Category:</strong> {blog.category}
          </p>
        </div>
      </div>

      <div
        className="prose lg:prose-xl text-gray-800 mt-4"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      ></div>
    </div>
  );
};

export default DoctorBlogDetails;
