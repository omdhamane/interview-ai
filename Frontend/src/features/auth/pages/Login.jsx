import React,{useState} from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {

    const { loading, error, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        const success = await handleLogin({ email, password })
        if (success) {
            navigate('/')
        }
    }

    if (loading) {
        return (<main className='auth-page'><p className='auth-loading'>Signing you in…</p></main>)
    }

    return (
        <main className='auth-page'>
            <section className="auth-card" aria-labelledby='login-heading'>
                <div className='auth-brand' aria-hidden='true'>AI</div>
                <div className='auth-heading'>
                    <p className='auth-eyebrow'>Interview AI</p>
                    <h1 id='login-heading'>Welcome back</h1>
                    <p>Sign in to continue building your interview strategy.</p>
                </div>
                {error && <div className="error-banner" role='alert'>{error}</div>}
                <form className='auth-form' onSubmit={handleSubmit}>
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
                    <button className='button primary-button' type='submit'>Sign in</button>
                </form>
                <p className='auth-switch'>New to Interview AI? <Link to={"/register"}>Create an account</Link></p>
            </section>
        </main>
    )
}

export default Login
