import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from './DoctorModal'; // Import modal for detailed view

const ManageDoctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/admin/pending-doctors`)
      .then((response) => setDoctors(response.data))
      .catch((error) => console.error('Error fetching pending doctors', error));
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`${process.env.REACT_APP_SERVER_URL}/admin/update-doctor-status/${id}`, {
        status,
      });
      setDoctors(doctors.filter((doc) => doc._id !== id));
      alert(`Doctor has been ${status}`);
    } catch (error) {
      console.error('Error updating doctor status', error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-6">Pending Doctor Approvals</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div
            key={doctor._id}
            className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl cursor-pointer transition"
            onClick={() => {
              setSelectedDoctor(doctor);
              setIsModalOpen(true);
            }}
          >
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-32 h-32 rounded-full object-cover mx-auto"
            />
            <h3 className="text-lg font-semibold text-center mt-3">{doctor.name}</h3>
            <p className="text-center text-gray-600">{doctor.speciality}</p>
            <div className="mt-4 flex gap-2">
              <button
                className="bg-primary text-white px-4 py-2 rounded-full flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(doctor._id, 'approved');
                }}
              >
                Approve
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-full flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(doctor._id, 'rejected');
                }}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && <Modal doctor={selectedDoctor} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default ManageDoctor;
