import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../utils/jsonStore.jsx'
import { useStatus } from '../utils/status.jsx'

export default function Login() {
  const { login } = useAuth()
  const status = useStatus()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const onSubmit = (e) => {
    e.preventDefault()
    try {
      login({ email, pass })
      status.success('Sesión iniciada', `Bienvenido: ${email}`)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
      status.error('Error de acceso', err.message)
    }
  }
  return (
    <div className="container">
      <h2 className="page-title">Ingresar</h2>
      {error && <p className="tag" style={{ borderColor: 'var(--color-danger)', color: '#fff' }}>{error}</p>}
      <form onSubmit={onSubmit} className="form-grid" style={{ maxWidth: 360 }}>
        <label>Email<input value={email} onChange={e => setEmail(e.target.value)} type="email" required /></label>
        <label>Contraseña<input value={pass} onChange={e => setPass(e.target.value)} type="password" required /></label>
        <button className="btn btn-primary" type="submit">Entrar</button>
      </form>
      <p>¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
    </div>
  )
}