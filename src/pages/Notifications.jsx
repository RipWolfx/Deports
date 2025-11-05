import { useStore } from '../utils/jsonStore.jsx'

export default function Notifications() {
  const store = useStore()
  const ntf = store.getStore().notificaciones
  return (
    <div className="container">
      <h2 className="page-title">Notificaciones</h2>
      {ntf.length === 0 ? (
        <p className="empty-state">No hay notificaciones todavía.</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Canal</th>
                <th>Para</th>
                <th>Asunto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ntf.slice().reverse().map(n => (
                <tr key={n.id}>
                  <td>{n.fecha}</td>
                  <td>{n.canal}</td>
                  <td>{n.para}</td>
                  <td>{n.asunto}</td>
                  <td>{n.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}