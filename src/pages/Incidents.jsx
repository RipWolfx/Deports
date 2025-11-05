import { useState } from 'react'
import { useAuth, useStore } from '../utils/jsonStore.jsx'
import { useStatus } from '../utils/status.jsx'

export default function Incidents() {
  const { currentUser } = useAuth()
  const store = useStore()
  const status = useStatus()
  const incidencias = store.getStore().incidencias
  const [tipo, setTipo] = useState('accidente')
  const [detalle, setDetalle] = useState('')
  const [notificar, setNotificar] = useState(false)
  const registrar = (e) => {
    e.preventDefault()
    if (tipo === 'accidente') {
      store.registrarAccidente({ userId: currentUser.id, detalle, notificarFamilia: notificar })
    } else {
      store.registrarIncidencia({ userId: currentUser.id, tipo, detalle, notificarFamilia: false })
    }
    status.success('Incidente registrado', `${tipo} — ${detalle.slice(0, 40)}`)
    setDetalle(''); setNotificar(false)
  }
  return (
    <div className="container">
      <h2 className="page-title">Incidencias</h2>
      <p className="subtitle">Registra accidentes, sanciones o accesos denegados para llevar control y reportes.</p>
      <form onSubmit={registrar} className="form-grid" style={{ maxWidth: 600 }}>
        <label>Tipo
          <select value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="accidente">Accidente</option>
            <option value="sancion">Sanción</option>
            <option value="acceso_denegado">Acceso denegado</option>
          </select>
          <span className="hint">Selecciona el tipo adecuado para clasificar el evento.</span>
        </label>
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
          <div className="table-caption">
            {(() => {
              const tot = incidencias.length
              const acc = incidencias.filter(i => i.tipo === 'accidente').length
              const sanc = incidencias.filter(i => i.tipo === 'sancion').length
              const den = incidencias.filter(i => i.tipo === 'acceso_denegado').length
              return <span>Totales: {tot} · Accidentes: {acc} · Sanciones: {sanc} · Accesos denegados: {den}</span>
            })()}
          </div>
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
                  <td>
                    {i.tipo === 'accidente' ? (
                      <span className="badge badge-warning">accidente</span>
                    ) : i.tipo === 'sancion' ? (
                      <span className="badge badge-neutral">sanción</span>
                    ) : (
                      <span className="badge badge-danger">acceso denegado</span>
                    )}
                  </td>
                  <td>{i.detalle}</td>
                  <td>{i.legal?.reporteId || 'N/A'}</td>
                  <td>{i.notificacionFamilia?.activada ? <span className="badge badge-info">Notificada</span> : <span className="badge badge-neutral">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}