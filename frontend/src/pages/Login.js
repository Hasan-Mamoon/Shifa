import {useState} from 'react'
import { useLogin } from '../hooks/useLogin'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const {login, error, isLoading} = useLogin()


    const handleSubmit = async (e)=>{
        e.preventDefault()

        await login(email, password)
        
    }

    return (
        <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <form className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md" onSubmit={handleSubmit}>
            <h3 className="text-center text-2xl font-bold text-gray-900">Login</h3>

            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
            </label>

            <input
             type="email"
             required
             onChange={(e)=> setEmail(e.target.value)}
             value={email}
             className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
             />

             <label htmlFor="password" className="block text-sm font-medium text-gray-700">
             Password
             </label>
            <input
             type="password"
             required
             onChange={(e)=> setPassword(e.target.value)}
             value={password}
             className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
             />

<button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300"
        >
          Login
        </button>
             {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

        </form>
        </div>
    )
}


export default Login