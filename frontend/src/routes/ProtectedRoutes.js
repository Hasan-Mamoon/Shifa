// import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const ProtectedRoute = ({ element, allowedRoles }) => {
//   const { user } = useAuth();
//   const location = useLocation();

//   if (!user) {
//     return (
//       <Navigate
//         to="/login"
//         state={{ message: 'Please sign in to continue.', from: location }}
//         replace
//       />
//     );
//   }

//   if (!allowedRoles.includes(user.role)) {
//     return (
//       <Navigate
//         to="/login"
//         state={{
//           message: 'You do not have permission to access this page.',
//           from: location,
//         }}
//         replace
//       />
//     );
//   }

//   return element;
// };

// export default ProtectedRoute;

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ element, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ message: 'Please sign in to continue.', from: location }}
        replace
      />
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to="/login"
        state={{
          message: 'You do not have permission to access this page.',
          from: location,
        }}
        replace
      />
    );
  }

  return element;
};

export default ProtectedRoute;
