import { useState } from 'react'
import { useAuth, useStore } from '../utils/jsonStore.jsx'
import { useStatus } from '../utils/status.jsx'

export default function AccessControl() {
  const { currentUser } = useAuth()
  const store = useStore()
  const status = useStatus()
  const accesos = store.getStore().accesos
  const [zona, setZona] = useState('Piscina')
  const [tipo, setTipo] = useState('entrada')

  const registrar = (e) => {
    e.preventDefault()
    store.registrarAcceso({ userId: currentUser.id, zona, tipo })
    status.info('Acceso registrado', `${zona} — ${tipo}`)
  }
  return (
    <div className="container">
      <h2 className="page-title">Control de Acceso</h2>
      <p className="subtitle">Registra entradas, salidas o intentos denegados. Los denegados crean una incidencia automática.</p>
      <form onSubmit={registrar} className="form-row">
        <select value={zona} onChange={e => setZona(e.target.value)}>
          <option>Piscina</option>
          <option>Gimnasio</option>
          <option>Cancha 1</option>
          <option>Laboratorio</option>
          <option>Zona restringida</option>
        </select>
        <select value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
          <option value="denegado">Denegado</option>
        </select>
        <button className="btn btn-primary">Registrar</button>
      </form>
      <p className="hint">Consejo: marca "Denegado" para intentos sin autorización.</p>
      <h3 style={{ marginTop: 16 }}>Historial</h3>
      {accesos.length === 0 ? (
        <p className="empty-state">Sin registros de acceso aún.</p>
      ) : (
        <div className="table-responsive">
          <div className="table-caption">
            {(() => {
              const tot = accesos.length
              const en = accesos.filter(a => a.tipo === 'entrada').length
              const sa = accesos.filter(a => a.tipo === 'salida').length
              const de = accesos.filter(a => a.tipo === 'denegado').length
              return <span>Totales: {tot} · Entradas: {en} · Salidas: {sa} · Denegados: {de}</span>
            })()}
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Zona</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {accesos.slice().reverse().map(a => (
                <tr key={a.id}>
                  <td>{a.fecha}</td>
                  <td>{a.zona}</td>
                  <td>
                    {a.tipo === 'denegado' ? (
                      <span className="badge badge-danger">{a.tipo}</span>
                    ) : a.tipo === 'entrada' ? (
                      <span className="badge badge-success">{a.tipo}</span>
                    ) : (
                      <span className="badge badge-neutral">{a.tipo}</span>
                    )}
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