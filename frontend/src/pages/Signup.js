import { useState } from "react"
import { useSignup } from "../hooks/useSignup"

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('patient');
  const [licenseNo, setlicenseNo] = useState('');
  const [licenseImage, setLicenseImage] = useState(null);
  const {signup, error, isLoading} = useSignup()

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log({ email, password, role, licenseNo, licenseImage });
    await signup(email, password, role, licenseNo, licenseImage)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLicenseImage(file);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <form className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md" onSubmit={handleSubmit}>
      <h3 className="text-center text-2xl font-bold text-gray-900">Sign Up</h3>
      
      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
      </label>
      <input 
        type="email" 
        required
        onChange={(e) => setEmail(e.target.value)} 
        value={email} 
        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
      </label>
      <input 
        type="password" 
        onChange={(e) => setPassword(e.target.value)} 
        value={password} 
        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />

       <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
       </label>
      <select onChange={(e) => setRole(e.target.value)} value={role} className="mt-1 w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
        <option value="patient">Patient</option>
        <option value="doctor">Doctor</option>
        <option value="admin">Admin</option>
      </select>
      
      {role === 'doctor' && (
          <>
            <label htmlFor="licenseNo" className="block text-sm font-medium text-gray-700">
            licenseNo
            </label>
            <input
              type="text"
              required
              onChange={(e) => setlicenseNo(e.target.value)}
              value={licenseNo}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <label htmlFor="licenseImage" className="block text-sm font-medium text-gray-700">
              Upload License Picture
            </label>
            <input
              type="file"
              required
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </>
        )}

      <button type="submit" disabled={isLoading} className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300">Sign up</button>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </form>
    </div>
  )
}

export default Signup