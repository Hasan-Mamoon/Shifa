import { useState, useEffect } from "react";

const AdminApproval = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Retrieve token from localStorage
  const storedData = JSON.parse(localStorage.getItem("user")); // Assuming 'adminToken' is the key
  const token = storedData?.token; // Extract the token

  useEffect(() => {
    if (!token) {
      setError("Admin token is missing");
      setLoading(false);
      return;
    }

    // Fetch the pending doctors
    fetch("/api/admin/pending-doctors", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Add token to Authorization header
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch doctors");
        }
        return response.json(); // Parse the response as JSON
      })
      .then((data) => {
        setPendingDoctors(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors");
        setLoading(false);
      });
  }, [token]); // Runs whenever token changes

  // Handle Approve
  const handleApprove = async (doctorId) => {
    try {
      const response = await fetch(`/api/admin/approve-doctor/${doctorId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Approval failed");
      }

      setPendingDoctors((prev) =>
        prev.filter((doctor) => doctor._id !== doctorId)
      );

      alert("Doctor approved successfully");
    } catch (err) {
      console.error(err);
      alert("Error approving doctor");
    }
  };

  // Handle Delete
  const handleReject = async (doctorId) => {
    try {
      const response = await fetch(`/api/admin/reject-doctor/${doctorId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Rejection failed");
      }

      setPendingDoctors((prev) =>
        prev.filter((doctor) => doctor._id !== doctorId)
      );

      alert("Doctor rejected successfully");
    } catch (err) {
      console.error(err);
      alert("Error rejecting doctor");
    }
  };

  return (
    <div className="admin-approval-container">
      <h2 className="text-xl font-bold">Pending Doctors</h2>
      {loading && <p>Loading doctors...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="doctors-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingDoctors.length > 0 ? (
          pendingDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="doctor-card border rounded p-4 shadow-md hover:shadow-lg"
            >
              <img
                src={doctor.licensePictureURL}
                alt={doctor.email}
                className="doctor-image w-full h-40 object-cover rounded mb-4"
              />
              <h3 className="doctor-name text-lg font-semibold">
                {doctor.email}
              </h3>
              <p className="doctor-specialty text-gray-600">
                LicenseNo: {doctor.licenseNo}
              </p>
              <div className="buttons flex justify-between mt-4">
                <button
                  className="approve-button bg-green-500 text-white p-2 rounded hover:bg-green-600"
                  onClick={() => handleApprove(doctor._id)}
                >
                  Approve
                </button>
                <button
                  className="delete-button bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  onClick={() => handleReject(doctor._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No pending doctors.</p>
        )}
      </div>
    </div>
  );
};

export default AdminApproval;
