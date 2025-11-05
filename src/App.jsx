import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Activities from './pages/Activities'
import Reservations from './pages/Reservations'
import AccessControl from './pages/AccessControl'
import Inventory from './pages/Inventory'
import TrainingPrograms from './pages/TrainingPrograms'
import Contracts from './pages/Contracts'
import Incidents from './pages/Incidents'
import Reports from './pages/Reports'
import Notifications from './pages/Notifications'
import { useAuth } from './utils/jsonStore.jsx'
import { StatusToasts } from './utils/status.jsx'

function App() {
  const { currentUser } = useAuth()
  return (
    <div className="app">
      <NavBar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/dashboard" element={currentUser ? <Dashboard /> : <Navigate to="/login" replace />} />
          <Route path="/actividades" element={currentUser ? <Activities /> : <Navigate to="/login" replace />} />
          <Route path="/reservas" element={currentUser ? <Reservations /> : <Navigate to="/login" replace />} />
          <Route path="/acceso" element={currentUser ? <AccessControl /> : <Navigate to="/login" replace />} />
          <Route path="/inventario" element={currentUser ? <Inventory /> : <Navigate to="/login" replace />} />
          <Route path="/entrenamientos" element={currentUser ? <TrainingPrograms /> : <Navigate to="/login" replace />} />
          <Route path="/contratos" element={currentUser ? <Contracts /> : <Navigate to="/login" replace />} />
          <Route path="/incidencias" element={currentUser ? <Incidents /> : <Navigate to="/login" replace />} />
          <Route path="/reportes" element={currentUser ? <Reports /> : <Navigate to="/login" replace />} />
          <Route path="/notificaciones" element={currentUser ? <Notifications /> : <Navigate to="/login" replace />} />
        </Routes>
      </div>
      <StatusToasts />
    </div>
  )
}

export default App
