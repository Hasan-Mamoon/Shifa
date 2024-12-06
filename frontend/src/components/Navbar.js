import { Link } from 'react-router-dom'
import { useLogout } from '../hooks/useLogout'
import { useAuthContext } from '../hooks/useAuthContext'

const Navbar = () => {
  const {logout} = useLogout()
  const {user} = useAuthContext()

  const handleClick = () => {
    logout()
  }

  return (
    <header className="bg-gray-800 text-white">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-2xl font-bold">SHIFA</h1>
        <nav>
         {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">{user.email}</span>
            {user.role === 'admin' && (
                <Link
                  to="/admin/approve"
                  className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Approve Doctors
                </Link>
              )}
            <button 
              onClick={handleClick}
              className="rounded bg-red-600 px-3 py-2 text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                Log out
            </button>
          </div>
         )}
         {!user && (
          <div className="flex space-x-4">
            <Link to="/login" className="rounded px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Login</Link>
            <Link to="/signup"  className="rounded px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Signup</Link>
          </div>
         )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar