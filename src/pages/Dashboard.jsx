import { Link } from 'react-router-dom'
import { useAuth, useStore } from '../utils/jsonStore.jsx'

const descuentos = {
  estudiante: 0.3,
  docente: 0.2,
  externo: 0.0,
}

export default function Dashboard() {
  const { currentUser } = useAuth()
  const store = useStore()
  if (!currentUser) return null
  const desc = Math.round((descuentos[currentUser.categoria] || 0) * 100)
  return (
    <div className="container">
      <h2 className="page-title">Dashboard</h2>
      <p>Bienvenido/a {currentUser.nombre}. Categoría: <span className="tag">{currentUser.categoria}</span> — Descuento: <span className="tag">{desc}%</span></p>
      <div className="grid-cards" style={{ marginTop: 12 }}>
        <Card title="Actividades" to="/actividades" desc="Calendario, cupos, precios y requisitos" />
        <Card title="Reservas" to="/reservas" desc="Reservar canchas y salas con pago online" />
        <Card title="Acceso" to="/acceso" desc="Validación de credenciales y registro de entradas/salidas" />
        <Card title="Inventario" to="/inventario" desc="Stock, ventas y órdenes de compra" />
        <Card title="Entrenamientos" to="/entrenamientos" desc="Evaluación inicial y plan personalizado" />
        <Card title="Contratos" to="/contratos" desc="Gestión de contratos con entrenadores externos" />
        <Card title="Incidencias" to="/incidencias" desc="Accidentes, sanciones y reportes legales" />
        <Card title="Reportes" to="/reportes" desc="Finanzas y estadísticas mensuales" />
        <Card title="Notificaciones" to="/notificaciones" desc="Historial de SMS/Email enviados" />
      </div>
      {currentUser.rol !== 'usuario' && (
        <div style={{ marginTop: 24 }}>
          <h3>Panel administrativo ({currentUser.rol})</h3>
          <ul>
            <li>Superadministrador: configuración global</li>
            <li>Administrador de instalaciones: gestiona canchas y mantenimiento</li>
            <li>Administrador financiero: aprueba reembolsos</li>
            <li>Personal de atención: inscripciones presenciales</li>
          </ul>
        </div>
      )}
      <div style={{ marginTop: 24 }}>
        <h3>Resumen rápido</h3>
        <p>Reservas totales: {store.getStore().reservas.length}</p>
        <p>Incidencias: {store.getStore().incidencias.length}</p>
      </div>
    </div>
  )
}

function Card({ title, to, desc }) {
  return (
    <div className="card">
      <h4 style={{ margin: 0 }}>{title}</h4>
      <p style={{ margin: '8px 0' }}>{desc}</p>
      <Link className="btn btn-secondary" to={to}>Ir</Link>
    </div>
  )
}