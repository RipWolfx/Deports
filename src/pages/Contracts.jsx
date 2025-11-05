import { useState } from 'react'
import { useStore } from '../utils/jsonStore.jsx'
import { useStatus } from '../utils/status.jsx'
import Modal from '../components/Modal.jsx'

export default function Contracts() {
  const store = useStore()
  const status = useStatus()
  const contratos = store.getStore().contratos
  const [entrenadorId, setEntrenadorId] = useState('ent-externo-001')
  const [actividadId, setActividadId] = useState('')
  const [honorarios, setHonorarios] = useState(100)
  const [editId, setEditId] = useState(null)
  const [edit, setEdit] = useState({ entrenadorId: '', actividadId: '', honorarios: 0, retenciones: 0.1, comisiones: 0.05 })
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const crear = (e) => {
    e.preventDefault()
    store.crearContrato({ entrenadorId, actividadId, honorarios })
    status.success('Contrato creado', `${entrenadorId} / ${actividadId}`)
    setActividadId('')
    setShowCreate(false)
  }
  const pagar = (id) => { store.registrarPagoContrato({ contratoId: id }); status.success('Pago registrado', id) }
  const startEdit = (c) => { setEditId(c.id); setEdit({ entrenadorId: c.entrenadorId, actividadId: c.actividadId, honorarios: c.honorarios, retenciones: c.retenciones, comisiones: c.comisiones }) }
  const applyEdit = (e) => { e.preventDefault(); store.actualizarContrato({ id: editId, cambios: { ...edit, honorarios: Number(edit.honorarios), retenciones: Number(edit.retenciones), comisiones: Number(edit.comisiones) } }); status.info('Contrato actualizado', editId); setEditId(null) }
  const remove = (id) => { store.eliminarContrato({ id }); status.error('Contrato eliminado', id) }
  return (
    <div className="container">
      <h2 className="page-title">Contratos con Entrenadores Externos</h2>
      <div className="actions" style={{ marginBottom: 12 }}>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Crear contrato</button>
      </div>
      <Modal open={showCreate} title="Nuevo contrato" onClose={() => setShowCreate(false)}
        footer={<>
          <button className="btn" onClick={() => setShowCreate(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={crear}>Guardar</button>
        </>}>
        <form onSubmit={e => e.preventDefault()} className="form-grid">
          <label>Entrenador<input value={entrenadorId} onChange={e => setEntrenadorId(e.target.value)} /></label>
          <label>Actividad vinculada<input value={actividadId} onChange={e => setActividadId(e.target.value)} /></label>
          <label>Honorarios<input type="number" value={honorarios} onChange={e => setHonorarios(Number(e.target.value))} /></label>
        </form>
      </Modal>
      <h3 style={{ marginTop: 16 }}>Contratos</h3>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Entrenador</th>
              <th>Actividad</th>
              <th>Honorarios</th>
              <th>Retenciones</th>
              <th>Comisiones</th>
              <th>Pagos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {contratos.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.entrenadorId}</td>
                <td>{c.actividadId}</td>
                <td>${c.honorarios}</td>
                <td>{Math.round(c.retenciones * 100)}%</td>
                <td>{Math.round(c.comisiones * 100)}%</td>
                <td>{c.pagos.length}</td>
                <td>
                  <div className="actions">
                    <button className="btn btn-secondary" onClick={() => { startEdit(c); setShowEdit(true) }}>Editar</button>
                    <button className="btn btn-danger" onClick={() => remove(c.id)}>Eliminar</button>
                    <button className="btn" onClick={() => pagar(c.id)}>Registrar pago</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={showEdit} title="Editar contrato" onClose={() => setShowEdit(false)}
        footer={<>
          <button className="btn" onClick={() => setShowEdit(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={applyEdit}>Guardar</button>
        </>}>
        <form onSubmit={e => e.preventDefault()} className="form-grid">
          <label>Entrenador<input value={edit.entrenadorId} onChange={e => setEdit({ ...edit, entrenadorId: e.target.value })} /></label>
          <label>Actividad<input value={edit.actividadId} onChange={e => setEdit({ ...edit, actividadId: e.target.value })} /></label>
          <label>Honorarios<input type="number" value={edit.honorarios} onChange={e => setEdit({ ...edit, honorarios: e.target.value })} /></label>
          <label>Retenciones<input type="number" step="0.01" value={edit.retenciones} onChange={e => setEdit({ ...edit, retenciones: e.target.value })} /></label>
          <label>Comisiones<input type="number" step="0.01" value={edit.comisiones} onChange={e => setEdit({ ...edit, comisiones: e.target.value })} /></label>
        </form>
      </Modal>
      {contratos.map(c => (
        <div key={c.id} className="card" style={{ marginTop: 12 }}>
          <strong>{c.id}</strong> — detalle de pagos
          <ul>
            {c.pagos.map(p => <li key={p.id}>{p.fecha} — neto: {p.neto}</li>)}
          </ul>
        </div>
      ))}
    </div>
  )
}