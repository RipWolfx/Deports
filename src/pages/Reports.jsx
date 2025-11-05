import { useState, useEffect } from 'react'
import { useStore } from '../utils/jsonStore.jsx'
import { useStatus } from '../utils/status.jsx'
import { formatSoles } from '../core/shared/currency.js'
import { createInMemoryStoreRepository } from '../core/infrastructure/InMemoryStoreRepository.js'
import { generateMonthlyReport } from '../core/application/GenerateMonthlyReport.js'

export default function Reports() {
  const store = useStore()
  const status = useStatus()
  const [periodo, setPeriodo] = useState(new Date().toISOString().slice(0,7))
  const reportes = store.getStore().reportes
  // Auto-generar reporte para 10/03/2025 (periodo 2025-03)
  useEffect(() => {
    const objetivoPeriodo = '2025-03'
    const yaExiste = reportes.some(r => r.periodo === objetivoPeriodo)
    if (!yaExiste) {
      const repo = createInMemoryStoreRepository(store)
      const r = generateMonthlyReport(repo, objetivoPeriodo)
      status.info('Reporte auto-generado', `10/03/2025 — periodo ${r.periodo}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const generar = (e) => {
    e.preventDefault()
    const repo = createInMemoryStoreRepository(store)
    const r = generateMonthlyReport(repo, periodo)
    status.success('Reporte generado', r.periodo)
  }
  const exportar = (rep) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rep, null, 2))
    const a = document.createElement('a')
    a.setAttribute('href', dataStr)
    a.setAttribute('download', `reporte_${rep.periodo}_${rep.id}.json`)
    a.click()
  }
  const exportarCSV = (rep) => {
    const filas = []
    // Resumen
    const totalIngresos = Object.values(rep.ingresosPorActividad || {}).reduce((a, b) => a + Number(b), 0)
    const totalOcupacion = Object.values(rep.ocupacionPorInstalacion || {}).reduce((a, b) => a + Number(b), 0)
    const totalPenal = (rep.sanciones || []).reduce((a, s) => a + Number(s.penalizacion || 0), 0)
    const promReserva = totalOcupacion ? totalIngresos / totalOcupacion : 0
    filas.push(['tipo','label','valor'])
    filas.push(['resumen','periodo', rep.periodo])
    filas.push(['resumen','ingresos_total', totalIngresos])
    filas.push(['resumen','ocupacion_total', totalOcupacion])
    filas.push(['resumen','promedio_por_reserva', promReserva])
    filas.push(['resumen','penalizaciones_total', totalPenal])
    // Ingresos por instalación
    Object.entries(rep.ingresosPorActividad || {}).forEach(([inst, val]) => filas.push(['ingresos', inst, val]))
    // Ocupación por instalación
    Object.entries(rep.ocupacionPorInstalacion || {}).forEach(([inst, val]) => filas.push(['ocupacion', inst, val]))
    // Sanciones
    (rep.sanciones || []).forEach(s => filas.push(['sancion', s.reservaId, s.penalizacion || 0]))
    const csv = filas.map(f => f.map(v => typeof v === 'string' ? '"' + v.replace(/"/g, '""') + '"' : v).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_${rep.periodo}_${rep.id}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  const exportarPDF = (rep) => {
    const totalIngresos = Object.values(rep.ingresosPorActividad || {}).reduce((a, b) => a + Number(b), 0)
    const totalOcupacion = Object.values(rep.ocupacionPorInstalacion || {}).reduce((a, b) => a + Number(b), 0)
    const totalPenal = (rep.sanciones || []).reduce((a, s) => a + Number(s.penalizacion || 0), 0)
    const promReserva = totalOcupacion ? totalIngresos / totalOcupacion : 0
    const topIng = Object.entries(rep.ingresosPorActividad || {}).sort((a,b) => b[1]-a[1]).slice(0,3)
    const topOcc = Object.entries(rep.ocupacionPorInstalacion || {}).sort((a,b) => b[1]-a[1]).slice(0,3)
    const w = window.open('', '_blank')
    if (!w) return
    const estilos = `
      <style>
        body { font-family: system-ui, Arial; padding: 24px; }
        h1 { margin: 0 0 8px; }
        h2 { margin: 16px 0 8px; }
        .summary { display: flex; gap: 12px; flex-wrap: wrap; }
        .chip { padding: 6px 10px; border-radius: 16px; background: #f0f4ff; border: 1px solid #d0dcff; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        .muted { color: #666; }
        .section { margin-top: 12px; }
      </style>
    `
    const html = `
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Reporte ${rep.periodo}</title>
        ${estilos}
      </head>
      <body>
        <h1>Centro Deportivo Arete — Reporte mensual</h1>
        <p class="muted">Fecha objetivo: 10/03/2025 — Periodo: ${rep.periodo}</p>
        <div class="summary">
          <span class="chip">Ingresos: ${formatSoles(totalIngresos)}</span>
          <span class="chip">Reservas: ${totalOcupacion}</span>
          <span class="chip">Promedio por reserva: ${formatSoles(promReserva)}</span>
          <span class="chip">Sanciones: ${(rep.sanciones||[]).length} (${formatSoles(totalPenal)})</span>
        </div>
        <div class="section">
          <h2>Top instalaciones por ingresos</h2>
          <table>
            <thead><tr><th>Instalación</th><th>Ingresos</th></tr></thead>
            <tbody>
              ${topIng.map(([k,v]) => `<tr><td>${k}</td><td>${formatSoles(v)}</td></tr>`).join('') || `<tr><td colspan="2" class="muted">Sin datos</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="section">
          <h2>Top instalaciones por ocupación</h2>
          <table>
            <thead><tr><th>Instalación</th><th>Reservas</th></tr></thead>
            <tbody>
              ${topOcc.map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('') || `<tr><td colspan="2" class="muted">Sin datos</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="section">
          <h2>Ingresos por instalación</h2>
          <table>
            <thead><tr><th>Instalación</th><th>Ingresos</th></tr></thead>
            <tbody>
              ${Object.entries(rep.ingresosPorActividad || {}).map(([k,v]) => `<tr><td>${k}</td><td>${formatSoles(v)}</td></tr>`).join('') || `<tr><td colspan="2" class="muted">Sin datos</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="section">
          <h2>Ocupación por instalación</h2>
          <table>
            <thead><tr><th>Instalación</th><th>Reservas</th></tr></thead>
            <tbody>
              ${Object.entries(rep.ocupacionPorInstalacion || {}).map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('') || `<tr><td colspan="2" class="muted">Sin datos</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="section">
          <h2>Detalle de sanciones</h2>
          <table>
            <thead><tr><th>Reserva</th><th>Penalización</th></tr></thead>
            <tbody>
              ${(rep.sanciones || []).map(s => `<tr><td>${s.reservaId}</td><td>${formatSoles(s.penalizacion || 0)}</td></tr>`).join('') || `<tr><td colspan="2" class="muted">Sin sanciones</td></tr>`}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `
    w.document.write(html)
    w.document.close()
    w.focus()
    w.print()
  }
  const money = (n) => formatSoles(n)

  const HBarChart = ({ title, data, color = '#2e7d32', formatValue = (v) => v }) => {
    const entries = Object.entries(data || {})
    if (entries.length === 0) {
      return (
        <div className="chart">
          <div className="chart-title">{title}</div>
          <p className="muted">Sin datos para mostrar.</p>
        </div>
      )
    }
    const max = Math.max(...entries.map(([, v]) => Number(v))) || 1
    return (
      <div className="chart">
        <div className="chart-title">{title}</div>
        <div className="chart-body">
          {entries.map(([label, value]) => {
            const pct = Math.round((Number(value) / max) * 100)
            return (
              <div key={label} className="bar-row">
                <span className="bar-label">{label}</span>
                <div className="bar-track" aria-hidden>
                  <div className="bar" style={{ width: pct + '%', backgroundColor: color }} />
                </div>
                <span className="bar-value">{formatValue(value)}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
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
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" onClick={() => exportar(r)}>Exportar JSON</button>
                  <button className="btn btn-secondary" onClick={() => exportarCSV(r)}>Exportar CSV</button>
                  <button className="btn btn-secondary" onClick={() => exportarPDF(r)}>Exportar PDF</button>
                </div>
              </div>
              {/* Resumen del periodo */}
              {(() => {
                const totalIngresos = Object.values(r.ingresosPorActividad || {}).reduce((a, b) => a + Number(b), 0)
                const totalOcupacion = Object.values(r.ocupacionPorInstalacion || {}).reduce((a, b) => a + Number(b), 0)
                const totalPenal = (r.sanciones || []).reduce((a, s) => a + Number(s.penalizacion || 0), 0)
                const promReserva = totalOcupacion ? totalIngresos / totalOcupacion : 0
                return (
                  <div className="section" style={{ marginTop: 8 }}>
                    <div className="subtitle">Resumen del periodo</div>
                    <div className="summary-row">
                      <span className="badge badge-primary">Ingresos: {money(totalIngresos)}</span>
                      <span className="badge badge-info">Reservas: {totalOcupacion}</span>
                      <span className="badge badge-success">Promedio por reserva: {money(promReserva)}</span>
                      <span className="badge badge-danger">Sanciones: {r.sanciones.length} ({money(totalPenal)})</span>
                    </div>
                    {(() => {
                      const topIng = Object.entries(r.ingresosPorActividad || {}).sort((a,b) => b[1]-a[1]).slice(0,3)
                      const topOcc = Object.entries(r.ocupacionPorInstalacion || {}).sort((a,b) => b[1]-a[1]).slice(0,3)
                      return (
                        <div className="grid-cards" style={{ marginTop: 8 }}>
                          <div className="card">
                            <div className="subtitle">Top ingresos</div>
                            <ul>
                              {topIng.length > 0 ? topIng.map(([k,v]) => <li key={k}>{k} — {money(v)}</li>) : <li className="muted">Sin datos</li>}
                            </ul>
                          </div>
                          <div className="card">
                            <div className="subtitle">Top ocupación</div>
                            <ul>
                              {topOcc.length > 0 ? topOcc.map(([k,v]) => <li key={k}>{k} — {v}</li>) : <li className="muted">Sin datos</li>}
                            </ul>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )
              })()}

              {/* Gráficos */}
              <div className="section" style={{ marginTop: 8 }}>
                <div className="subtitle">Gráficos</div>
                <HBarChart title="Ingresos por instalación" data={r.ingresosPorActividad} color="#2e7d32" formatValue={money} />
                <HBarChart title="Ocupación por instalación" data={r.ocupacionPorInstalacion} color="#1976d2" formatValue={(v) => v} />
              </div>

              {/* Detalle en tablas */}
              <p className="muted">Sanciones registradas: <span className="tag tag-danger">{r.sanciones.length}</span></p>
              <div className="table-responsive" style={{ marginTop: 8 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Instalación</th>
                      <th>Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(r.ingresosPorActividad).map(([k, v]) => (
                      <tr key={k}><td>{k}</td><td>{money(v)}</td></tr>
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
              <div className="table-responsive" style={{ marginTop: 12 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Reserva</th>
                      <th>Penalización</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(r.sanciones || []).map((s, idx) => (
                      <tr key={idx}><td>{s.reservaId}</td><td>{money(s.penalizacion || 0)}</td></tr>
                    ))}
                    {(r.sanciones || []).length === 0 && (
                      <tr><td colSpan={2} className="muted">Sin sanciones en el periodo.</td></tr>
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