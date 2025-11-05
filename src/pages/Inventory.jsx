import { useStore } from '../utils/jsonStore.jsx'
import { useStatus } from '../utils/status.jsx'

export default function Inventory() {
  const store = useStore()
  const inv = store.getStore().inventario
  const oc = store.getStore().ordenesCompra
  const status = useStatus()
  const ajustar = (itemId, delta) => { store.ajustarStock({ itemId, delta }); status.info('Stock ajustado', `${itemId} ${delta > 0 ? '+1' : '-1'}`) }
  return (
    <div className="container">
      <h2 className="page-title">Inventario</h2>
      <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Item</th>
            <th>Stock</th>
            <th>Umbral</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {inv.map(i => (
            <tr key={i.id} className={i.stock < i.umbral ? 'row-danger' : ''}>
              <td>{i.nombre}</td>
              <td style={{ textAlign: 'center' }}>{i.stock}</td>
              <td style={{ textAlign: 'center' }}>{i.umbral}</td>
              <td style={{ textAlign: 'center' }}>
                <button className="btn btn-secondary" onClick={() => ajustar(i.id, +1)}>+1</button>
                <button className="btn btn-secondary" onClick={() => ajustar(i.id, -1)}>-1</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <h3 style={{ marginTop: 24 }}>Órdenes de compra</h3>
      <ul>
        {oc.map(o => (
          <li key={o.id} className="card">{o.fecha} — {o.id} — item:{o.itemId} — cant:{o.cantidad} — {o.estado}</li>
        ))}
      </ul>
    </div>
  )
}