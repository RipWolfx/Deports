import { useState } from 'react'
import { useAuth, useStore } from '../utils/jsonStore.jsx'
import { useStatus } from '../utils/status.jsx'

export default function Reservations() {
  const { currentUser } = useAuth()
  const store = useStore()
  const status = useStatus()
  const reservas = store.getStore().reservas
  const [instalacion, setInstalacion] = useState('Cancha 1')
  const [fechaHora, setFechaHora] = useState('')
  const [monto, setMonto] = useState(30)
  const [pagoOk, setPagoOk] = useState(true)
  const [msg, setMsg] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const reservar = (e) => {
    e.preventDefault()
    setMsg('')
    try {
      const id = store.crearReserva({ userId: currentUser.id, instalacion, fechaHora, pagoOk, monto })
      setMsg(`Reserva creada: ${id} (estado: ${pagoOk ? 'confirmada' : 'pendiente'})`)
      status.success('Reserva creada', `${instalacion} @ ${fechaHora}`)
    } catch (err) {
      setMsg(err.message)
      status.error('Error en reserva', err.message)
    }
  }

  const cancelar = (id) => { store.cancelarReserva({ id }); status.info('Reserva cancelada', id) }
  const noShow = (id) => { store.registrarNoShow({ id }); status.info('No-show registrado', id) }

  const mias = reservas.filter(r => r.userId === currentUser.id)
  const resumen = {
    total: mias.length,
    confirmadas: mias.filter(r => r.estado === 'confirmada').length,
    pendientes: mias.filter(r => r.estado === 'pendiente').length,
    canceladas: mias.filter(r => r.estado === 'cancelada').length,
    noshow: mias.filter(r => r.estado === 'no-show').length,
  }
  const visibles = mias
    .filter(r => filtroEstado === 'todos' ? true : r.estado === filtroEstado)
    .slice().sort((a,b) => String(b.fechaHora).localeCompare(String(a.fechaHora)))

  const EstadoBadge = ({ estado }) => {
    const map = {
      confirmada: 'badge-success',
      pendiente: 'badge-warning',
      cancelada: 'badge-neutral',
      'no-show': 'badge-danger',
    }
    const cls = map[estado] || 'badge-info'
    return <span className={`badge ${cls}`}>{estado}</span>
  }

  return (
    <div className="container">
      <h2 className="page-title">Reservas</h2>
      <form onSubmit={reservar} className="form-grid" style={{ maxWidth: 520 }}>
        <label>Instalación
          <select value={instalacion} onChange={e => setInstalacion(e.target.value)}>
            <option>Cancha 1</option>
            <option>Cancha 2</option>
            <option>Sala Multiusos</option>
          </select>
          <span className="hint">Recomendado: reserva con 48h de anticipación.</span>
        </label>
        <label>Fecha y hora
          <input type="datetime-local" value={fechaHora} onChange={e => setFechaHora(e.target.value)} required />
          <span className="hint">Formato local, se valida límite de 3 reservas por semana.</span>
        </label>
        <label>Monto
          <input type="number" min="0" step="5" value={monto} onChange={e => setMonto(Number(e.target.value))} />
          <span className="hint">Sugerencias: 20, 25, 30 según instalación.</span>
        </label>
        <label>Pago exitoso?
          <input type="checkbox" checked={pagoOk} onChange={e => setPagoOk(e.target.checked)} />
        </label>
        <button className="btn btn-primary" type="submit">Reservar</button>
      </form>
      {msg && <p className="tag" style={{ marginTop: 12 }}>{msg}</p>}
      <h3 style={{ marginTop: 24 }}>Mis reservas</h3>
      {mias.length > 0 && (
        <div className="table-caption">
          <div className="form-row" style={{ justifyContent: 'space-between' }}>
            <span>Totales: {resumen.total} · Confirmadas: {resumen.confirmadas} · Pendientes: {resumen.pendientes} · Canceladas: {resumen.canceladas} · No-show: {resumen.noshow}</span>
            <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              Estado
              <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="confirmada">Confirmada</option>
                <option value="pendiente">Pendiente</option>
                <option value="cancelada">Cancelada</option>
                <option value="no-show">No-show</option>
              </select>
            </label>
          </div>
        </div>
      )}
      {reservas.filter(r => r.userId === currentUser.id).length === 0 ? (
        <p className="empty-state">No tienes reservas todavía.</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Instalación</th>
                <th>Fecha y hora</th>
                <th>Estado</th>
                <th>Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map(r => (
                <tr key={r.id}>
                  <td>{r.instalacion}</td>
                  <td>{r.fechaHora}</td>
                  <td><EstadoBadge estado={r.estado} /></td>
                  <td>{r.pago?.monto} {r.pago?.ok ? 'OK' : 'FALLÓ'} {r.reembolso ? `— reembolso: ${r.reembolso}` : ''} {r.penalizacion ? `— penalización: ${r.penalizacion}` : ''}</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-secondary" onClick={() => cancelar(r.id)}>Cancelar</button>
                      <button className="btn btn-danger" onClick={() => noShow(r.id)}>No-show</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}