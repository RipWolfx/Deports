import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../utils/jsonStore.jsx'
import { useStatus } from '../utils/status.jsx'

export default function Register() {
  const { register } = useAuth()
  const status = useStatus()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [categoria, setCategoria] = useState('estudiante')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const onSubmit = (e) => {
    e.preventDefault()
    try {
      register({ nombre, email, pass, categoria })
      status.success('Cuenta creada', `Usuario: ${email}`)
      navigate('/login')
    } catch (err) {
      setError(err.message)
      status.error('Error de registro', err.message)
    }
  }
  return (
    <div className="container">
      <h2 className="page-title">Registro de cuenta</h2>
      {error && <p className="tag" style={{ borderColor: 'var(--color-danger)', color: '#fff' }}>{error}</p>}
      <form onSubmit={onSubmit} className="form-grid" style={{ maxWidth: 420 }}>
        <label>Nombre<input value={nombre} onChange={e => setNombre(e.target.value)} required /></label>
        <label>Email<input value={email} onChange={e => setEmail(e.target.value)} type="email" required /></label>
        <label>Contraseña<input value={pass} onChange={e => setPass(e.target.value)} type="password" required /></label>
        <label>Categoría
          <select value={categoria} onChange={e => setCategoria(e.target.value)}>
            <option value="estudiante">Estudiante</option>
            <option value="docente">Docente</option>
            <option value="externo">Externo</option>
          </select>
        </label>
        <button className="btn btn-primary" type="submit">Crear cuenta</button>
      </form>
      <p>¿Ya tienes cuenta? <Link to="/login">Ingresa</Link></p>
    </div>
  )
}