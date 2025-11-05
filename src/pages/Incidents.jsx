import { useState } from 'react'
import { useAuth, useStore } from '../utils/jsonStore.jsx'
import { useStatus } from '../utils/status.jsx'

export default function Incidents() {
  const { currentUser } = useAuth()
  const store = useStore()
  const status = useStatus()
  const incidencias = store.getStore().incidencias
  const [detalle, setDetalle] = useState('')
  const [notificar, setNotificar] = useState(false)
  const registrar = (e) => {
    e.preventDefault()
    store.registrarAccidente({ userId: currentUser.id, detalle, notificarFamilia: notificar })
    status.success('Incidente registrado', detalle.slice(0, 40))
    setDetalle(''); setNotificar(false)
  }
  return (
    <div className="container">
      <h2 className="page-title">Incidencias</h2>
      <form onSubmit={registrar} className="form-grid" style={{ maxWidth: 600 }}>
        <label>Detalle<textarea value={detalle} onChange={e => setDetalle(e.target.value)} /></label>
        <label>
          <input type="checkbox" checked={notificar} onChange={e => setNotificar(e.target.checked)} /> Notificar a familia (si autorizado)
        </label>
        <button className="btn btn-primary">Registrar accidente</button>
      </form>
      <h3 style={{ marginTop: 16 }}>Historial</h3>
      {incidencias.length === 0 ? (
        <p className="empty-state">Aún no hay incidencias registradas.</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Detalle</th>
                <th>Reporte Legal</th>
                <th>Familia</th>
              </tr>
            </thead>
            <tbody>
              {incidencias.slice().reverse().map(i => (
                <tr key={i.id}>
                  <td>{i.fecha}</td>
                  <td>{i.tipo}</td>
                  <td>{i.detalle}</td>
                  <td>{i.legal?.reporteId || 'N/A'}</td>
                  <td>{i.notificacionFamilia?.activada ? 'Notificada' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}