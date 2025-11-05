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
        </label>
        <label>Fecha y hora<input type="datetime-local" value={fechaHora} onChange={e => setFechaHora(e.target.value)} required /></label>
        <label>Monto<input type="number" value={monto} onChange={e => setMonto(Number(e.target.value))} /></label>
        <label>Pago exitoso?
          <input type="checkbox" checked={pagoOk} onChange={e => setPagoOk(e.target.checked)} />
        </label>
        <button className="btn btn-primary" type="submit">Reservar</button>
      </form>
      {msg && <p className="tag" style={{ marginTop: 12 }}>{msg}</p>}
      <h3 style={{ marginTop: 24 }}>Mis reservas</h3>
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
              {reservas.filter(r => r.userId === currentUser.id).map(r => (
                <tr key={r.id}>
                  <td>{r.instalacion}</td>
                  <td>{r.fechaHora}</td>
                  <td>{r.estado}</td>
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