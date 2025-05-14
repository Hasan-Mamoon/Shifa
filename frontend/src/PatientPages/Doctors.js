import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Doctors = () => {
  const { speciality } = useParams();
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter((doc) => doc.speciality === speciality));
    } else {
      setFilterDoc(doctors);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality]);
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <p className="text-gray-600 text-lg font-medium mb-4">Browse through the doctors speciality</p>
      <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
        <button
          className={`py-2 px-4 border rounded-lg text-sm font-medium transition-all duration-300 
            flex items-center gap-2 hover:shadow-md sm:hidden
            ${showFilter 
              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
              : 'bg-white hover:bg-gray-50'
            }`}
          onClick={() => setShowFilter((prev) => !prev)}
        >
          <svg 
            className={`w-4 h-4 transition-transform duration-300 ${showFilter ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
          </svg>
          Filters
        </button>
        
        <div
          className={`flex-col gap-4 text-sm text-gray-600 transition-all duration-300 transform
            ${showFilter 
              ? 'flex opacity-100 translate-y-0' 
              : 'hidden sm:flex sm:opacity-100 opacity-0 -translate-y-4'
            }`}
        >
          {[
            'Gastroenterologist',
            'General physician',
            'Gynecologist',
            'Dermatologist',
            'Pediatricians',
            'Neurologist'
          ].map((spec) => (
            <div
              key={spec}
              onClick={() => navigate(speciality === spec ? '/doctors' : `/doctors/${spec}`)}
              className={`w-[94vw] sm:w-64 pl-4 py-2.5 pr-16 
                border rounded-lg transition-all duration-300 cursor-pointer
                hover:shadow-md group relative
                ${speciality === spec 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'hover:border-blue-200 hover:bg-blue-50/50'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full transition-all duration-300
                  ${speciality === spec 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300 group-hover:bg-blue-400'
                  }`}
                />
                <span className="font-medium transition-all duration-300 group-hover:text-blue-600">
                  {spec}
                </span>
              </div>
              {speciality === spec && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500">
                  ✓
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="w-full grid grid-cols-auto gap-4 gap-y-6">
          {filterDoc.map((item, index) => (
            <div
              onClick={() => navigate(`/appointment/${item._id}`)}
              className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer 
                hover:translate-y-[-10px] hover:shadow-lg transition-all duration-500"
              key={index}
            >
              <img className="bg-blue-50 w-full h-48 object-cover" src={item.image} alt={item.name} />
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-green-500 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p>Available</p>
                </div>
                <p className="text-gray-900 text-lg font-medium mb-1">{item.name}</p>
                <p className="text-gray-600 text-sm">{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
