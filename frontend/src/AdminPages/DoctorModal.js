import React, { useState } from 'react';

const DoctorModal = ({ doctor, onClose }) => {
  const [isImageOpen, setIsImageOpen] = useState(false);

  if (!doctor) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full relative">
        {/* Close Button */}
        <button className="absolute top-4 right-4 text-gray-600 text-xl" onClick={onClose}>
          ✖
        </button>

        {/* Doctor Info */}
        <div className="text-center">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-40 h-40 rounded-full object-cover mx-auto"
          />
          <h2 className="text-2xl font-semibold mt-3">{doctor.name}</h2>
          <p className="text-gray-500">{doctor.speciality}</p>
        </div>

        {/* Doctor Details */}
        <div className="mt-4 text-gray-700">
          <p>
            <strong>Experience:</strong> {doctor.experience} years
          </p>
          <p>
            <strong>About:</strong> {doctor.about}
          </p>
          <p>
            <strong>Fees:</strong> ${doctor.fees}
          </p>

          {/* Clickable Degree Image */}
          <img
            src={doctor.degree}
            alt="Doctor's Degree"
            className="w-full h-64 object-contain mx-auto rounded-lg shadow-lg cursor-pointer"
            onClick={() => setIsImageOpen(true)}
          />
        </div>
      </div>

      {/* Full-Screen Image Modal */}
      {isImageOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setIsImageOpen(false)}
          >
            ✖
          </button>
          <img
            src={doctor.degree}
            alt="Doctor's Degree"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default DoctorModal;
