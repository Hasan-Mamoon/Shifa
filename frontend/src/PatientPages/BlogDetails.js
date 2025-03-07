
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3080/blog/blogs/${id}`);
        const data = await response.json();
        setBlog(data);
      } catch (error) {
        console.error("Error fetching blog details:", error);
      }
    };

    fetchBlogDetails();
  }, [id]);

  if (!blog) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="container mx-auto p-6">
      {/* High-resolution, responsive image */}
      <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-lg">
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-auto object-cover"
          style={{
            maxHeight: "600px",
            width: "100%",
            borderRadius: "10px",
            imageRendering: "auto",
          }}
          loading="lazy"
        />
      </div>

      <h1 className="text-3xl font-bold mt-6">{blog.title}</h1>
      <p className="text-gray-600 mt-2">Category: {blog.category}</p>

      {/* Apply Tailwind Typography for better HTML rendering */}
      <div
        className="prose lg:prose-xl text-gray-800 mt-4"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      ></div>
    </div>
  );
};

export default BlogDetails;
