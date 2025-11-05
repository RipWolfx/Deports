import { Link, useNavigate } from 'react-router-dom'
import { useAuth, useStore } from '../utils/jsonStore.jsx'

export default function NavBar() {
  const { currentUser, logout } = useAuth()
  const store = useStore()
  const navigate = useNavigate()
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  const handleReset = () => {
    if (window.confirm('¿Restablecer datos de demostración?')) {
      store.resetStore()
    }
  }
  return (
    <nav className="nav">
      <strong>Centro Deportivo Areté</strong>
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/actividades">Actividades</Link>
        <Link to="/reservas">Reservas</Link>
        <Link to="/acceso">Acceso</Link>
        <Link to="/inventario">Inventario</Link>
        <Link to="/entrenamientos">Entrenamientos</Link>
        <Link to="/contratos">Contratos</Link>
        <Link to="/incidencias">Incidencias</Link>
        <Link to="/reportes">Reportes</Link>
        <Link to="/notificaciones">Notificaciones</Link>
      </div>
      <div className="nav-actions">
        {currentUser ? (
          <>
            <span>Hola, {currentUser.nombre} ({currentUser.rol})</span>
            <button className="btn btn-secondary" onClick={handleReset}>Reset datos</button>
            <button className="btn btn-secondary" onClick={handleLogout}>Salir</button>
          </>
        ) : (
          <>
            <Link to="/login">Ingresar</Link>
            <Link to="/registro">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  )
}