import React,{useState} from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import '../auth.form.scss'

const Register = () => {

    const navigate = useNavigate()
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    const { loading, error, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const success = await handleRegister({ username, email, password })
        if (success) {
            navigate("/")
        }
    }

    if (loading) {
        return (<main className='auth-page'><p className='auth-loading'>Creating your account…</p></main>)
    }

    return (
        <main className='auth-page'>
            <section className="auth-card" aria-labelledby='register-heading'>
                <div className='auth-brand' aria-hidden='true'>AI</div>
                <div className='auth-heading'>
                    <p className='auth-eyebrow'>Interview AI</p>
                    <h1 id='register-heading'>Create your account</h1>
                    <p>Start preparing for your next great opportunity.</p>
                </div>
                {error && <div className="error-banner" role='alert'>{error}</div>}

                <form className='auth-form' onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => { setUsername(e.target.value) }}
                            type="text" id="username" name='username' placeholder='Enter username' required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => { setEmail(e.target.value) }}
                            type="email" id="email" name='email' placeholder='Enter email address' required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => { setPassword(e.target.value) }}
                            type="password" id="password" name='password' placeholder='Enter password' required />
                    </div>

                    <button className='button primary-button' type='submit'>Create account</button>

                </form>

                <p className='auth-switch'>Already have an account? <Link to={"/login"}>Sign in</Link></p>
            </section>
        </main>
    )
}

export default Register
