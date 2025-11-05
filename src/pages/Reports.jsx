import { useState } from 'react'
import { useStore } from '../utils/jsonStore.jsx'
import { useStatus } from '../utils/status.jsx'

export default function Reports() {
  const store = useStore()
  const status = useStatus()
  const [periodo, setPeriodo] = useState(new Date().toISOString().slice(0,7))
  const reportes = store.getStore().reportes
  const generar = (e) => {
    e.preventDefault()
    const r = store.generarReportesMensuales({ periodo })
    status.success('Reporte generado', r.periodo)
  }
  const exportar = (rep) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rep, null, 2))
    const a = document.createElement('a')
    a.setAttribute('href', dataStr)
    a.setAttribute('download', `reporte_${rep.periodo}_${rep.id}.json`)
    a.click()
  }
  return (
    <div className="container">
      <h2 className="page-title">Reportes Mensuales</h2>
      <form onSubmit={generar} className="form-row">
        <label>Periodo (YYYY-MM)
          <input value={periodo} onChange={e => setPeriodo(e.target.value)} />
          <span className="hint">Ejemplos: 2025-11 (actual), 2025-10 (anterior)</span>
        </label>
        <button className="btn btn-primary">Generar</button>
      </form>
      <h3 style={{ marginTop: 16 }}>Historial</h3>
      {reportes.length === 0 ? (
        <p className="empty-state">No hay reportes generados para mostrar.</p>
      ) : (
        <div className="grid-cards" style={{ marginTop: 8 }}>
          {reportes.slice().reverse().map(r => (
            <div key={r.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <strong>Periodo: {r.periodo}</strong>
                <button className="btn btn-secondary" onClick={() => exportar(r)}>Exportar JSON</button>
              </div>
              <p className="muted">Sanciones registradas: <span className="tag tag-danger">{r.sanciones.length}</span></p>
              <div className="table-responsive" style={{ marginTop: 8 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Actividad</th>
                      <th>Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(r.ingresosPorActividad).map(([k, v]) => (
                      <tr key={k}><td>{k}</td><td>{v}</td></tr>
                    ))}
                    {Object.keys(r.ingresosPorActividad).length === 0 && (
                      <tr><td colSpan={2} className="muted">Sin datos de ingresos para este periodo.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="table-responsive" style={{ marginTop: 12 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Instalación</th>
                      <th>Ocupación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(r.ocupacionPorInstalacion).map(([k, v]) => (
                      <tr key={k}><td>{k}</td><td>{v}</td></tr>
                    ))}
                    {Object.keys(r.ocupacionPorInstalacion).length === 0 && (
                      <tr><td colSpan={2} className="muted">Sin ocupación registrada en el periodo.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}