









import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const categories = [
  "Healthy Lifestyle",
  "Women’s Health",
  "Skin Care",
  "Fitness & Exercise",
  "Health News",
  "Dental Health",
  "Sonology",
  "Mental Well-Being",
  "Health Fact Check",
  "New Health Researches",
];

const HealthBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("http://localhost:3080/blog/blogs");
        const data = await response.json();
        setBlogs(data);
        setFilteredBlogs(data); // Show all blogs initially
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

  // Filter blogs based on selected category
  useEffect(() => {
    if (selectedCategory) {
      setFilteredBlogs(blogs.filter((blog) => blog.category === selectedCategory));
    } else {
      setFilteredBlogs(blogs);
    }
  }, [selectedCategory, blogs]);

  return (
    <div className="container mx-auto p-6">
      {/* Hero Section */}
      <div className="relative w-full h-64 bg-primary text-white flex flex-col items-center justify-center rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold">Health Blogs</h1>
        <p className="text-lg mt-2">Stay updated with the latest health insights and trends.</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-5 py-2 rounded-full border transition-all ${
              selectedCategory === category
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-primary hover:text-white"
            }`}
            onClick={() => setSelectedCategory(category === selectedCategory ? "" : category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Blog List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
            <div
              key={blog._id}
              className="relative border rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition duration-300"
              onClick={() => navigate(`/blog/${blog._id}`)}
            >
              <img src={blog.image} alt={blog.title} className="w-full h-52 object-cover" />
              <div className="p-4 bg-white">
                <h2 className="text-xl font-semibold text-gray-900">{blog.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{blog.category}</p>
                <button
                  className="mt-3 bg-primary text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
                  onClick={() => navigate(`/blog/${blog._id}`)}
                >
                  Read More
                </button>
              </div>
              {/* Overlay effect */}
              <div className="absolute inset-0 bg-black bg-opacity-5 hover:bg-opacity-10 transition"></div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-3">No blogs found.</p>
        )}
      </div>
    </div>
  );
};

export default HealthBlogs;
