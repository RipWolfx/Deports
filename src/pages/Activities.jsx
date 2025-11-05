import { useState } from 'react'
import { useStore } from '../utils/jsonStore.jsx'
import { formatSoles } from '../core/shared/currency.js'
import { useStatus } from '../utils/status.jsx'
import Modal from '../components/Modal.jsx'

export default function Activities() {
  const store = useStore()
  const data = store.getStore().actividades
  const status = useStatus()
  const [form, setForm] = useState({ nombre: '', tipo: 'curso', precio: 0, cupos: 0, requisitos: '', modalidad: 'mixta', calendario: '', imagen: '', imagenData: '' })
  const [editId, setEditId] = useState(null)
  const [edit, setEdit] = useState({ nombre: '', tipo: 'curso', precio: 0, cupos: 0, requisitos: '', modalidad: 'mixta', calendario: '', imagen: '', imagenData: '' })
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const createPreview = form.imagenData || form.imagen || '/vite.svg'
  const editPreview = edit.imagenData || edit.imagen || '/vite.svg'

  const handleCreateFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setForm({ ...form, imagenData: reader.result })
    }
    reader.readAsDataURL(file)
  }
  const handleEditFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setEdit({ ...edit, imagenData: reader.result })
    }
    reader.readAsDataURL(file)
  }
  const submit = (e) => {
    e.preventDefault()
    const actividad = {
      nombre: form.nombre,
      tipo: form.tipo,
      precio: Number(form.precio),
      cupos: Number(form.cupos),
      requisitos: form.requisitos ? form.requisitos.split(',').map(s => s.trim()) : [],
      modalidad: form.modalidad,
      calendario: form.calendario ? form.calendario.split(',').map(s => s.trim()) : [],
      imagen: form.imagen || '',
      imagenData: form.imagenData || '',
    }
    store.upsertActividad(actividad)
    status.success('Actividad guardada', actividad.nombre)
    setForm({ nombre: '', tipo: 'curso', precio: 0, cupos: 0, requisitos: '', modalidad: 'mixta', calendario: '', imagen: '', imagenData: '' })
    setShowCreate(false)
  }
  const startEdit = (a) => {
    setEditId(a.id)
    setEdit({
      nombre: a.nombre,
      tipo: a.tipo,
      precio: a.precio,
      cupos: a.cupos,
      requisitos: Array.isArray(a.requisitos) ? a.requisitos.join(',') : '',
      modalidad: a.modalidad,
      calendario: Array.isArray(a.calendario) ? a.calendario.join(',') : '',
      imagen: a.imagen || '',
      imagenData: a.imagenData || '',
    })
  }
  const applyEdit = (e) => {
    e.preventDefault()
    const cambios = {
      nombre: edit.nombre,
      tipo: edit.tipo,
      precio: Number(edit.precio),
      cupos: Number(edit.cupos),
      requisitos: edit.requisitos ? edit.requisitos.split(',').map(s => s.trim()) : [],
      modalidad: edit.modalidad,
      calendario: edit.calendario ? edit.calendario.split(',').map(s => s.trim()) : [],
      imagen: edit.imagen || '',
      imagenData: edit.imagenData || '',
    }
    store.actualizarActividad({ id: editId, cambios })
    status.info('Actividad actualizada', cambios.nombre)
    setEditId(null)
    setShowEdit(false)
  }
  const remove = (id) => { store.eliminarActividad({ id }); status.error('Actividad eliminada', id) }
  return (
    <div className="container">
      <h2 className="page-title">Actividades</h2>
      <div className="actions" style={{ marginBottom: 12 }}>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Nueva actividad</button>
      </div>
      <Modal open={showCreate} title="Nueva actividad" onClose={() => setShowCreate(false)}
        footer={<>
          <button className="btn" onClick={() => setShowCreate(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={submit}>Guardar</button>
        </>}>
        <form onSubmit={e => e.preventDefault()} className="form-grid">
          <label>Nombre<input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required /></label>
          <label>Tipo<select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
            <option value="curso">Curso</option>
            <option value="programa">Programa</option>
            <option value="clase">Clase</option>
          </select></label>
          <label>Precio<input type="number" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} /></label>
          <label>Cupos<input type="number" value={form.cupos} onChange={e => setForm({ ...form, cupos: e.target.value })} /></label>
          <label>Requisitos (coma)<input value={form.requisitos} onChange={e => setForm({ ...form, requisitos: e.target.value })} /></label>
          <label>Modalidad<select value={form.modalidad} onChange={e => setForm({ ...form, modalidad: e.target.value })}>
            <option value="mixta">Mixta</option>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
          </select></label>
          <label>Calendario (coma)<input value={form.calendario} onChange={e => setForm({ ...form, calendario: e.target.value })} /></label>
          <div className="form-row">
            <label style={{ flex: 1 }}>URL de imagen
              <input value={form.imagen} onChange={e => setForm({ ...form, imagen: e.target.value })} placeholder="https://..." />
            </label>
            <label style={{ flex: 1 }}>Archivo
              <input type="file" accept="image/*" onChange={handleCreateFile} />
            </label>
          </div>
          <div className="form-row" style={{ alignItems: 'center', gap: 12 }}>
            <span className="muted">Previsualización</span>
            <img src={createPreview} alt="preview" className="image-preview" />
          </div>
        </form>
      </Modal>
      <h3 style={{ marginTop: 24 }}>Listado</h3>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Tipo</th>
              <th>Precio</th>
              <th>Cupos</th>
              <th>Modalidad</th>
              <th>Calendario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map(a => (
              <tr key={a.id}>
                <td><span className="cell-img"><img className="avatar" src={a.imagenData || a.imagen || '/vite.svg'} alt="act" /> {a.nombre}</span></td>
                <td>{a.tipo}</td>
                <td>{formatSoles(a.precio)}</td>
                <td>{a.cupos}</td>
                <td>{a.modalidad}</td>
                <td>{Array.isArray(a.calendario) ? a.calendario.join(', ') : ''}</td>
                <td>
                  <div className="actions">
                    <button className="btn btn-secondary" onClick={() => { startEdit(a); setShowEdit(true) }}>Editar</button>
                    <button className="btn btn-danger" onClick={() => remove(a.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={showEdit} title="Editar actividad" onClose={() => setShowEdit(false)}
        footer={<>
          <button className="btn" onClick={() => setShowEdit(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={applyEdit}>Guardar</button>
        </>}>
        <form onSubmit={e => e.preventDefault()} className="form-grid">
          <label>Nombre<input value={edit.nombre} onChange={e => setEdit({ ...edit, nombre: e.target.value })} /></label>
          <label>Tipo<select value={edit.tipo} onChange={e => setEdit({ ...edit, tipo: e.target.value })}>
            <option value="curso">Curso</option>
            <option value="programa">Programa</option>
            <option value="clase">Clase</option>
          </select></label>
          <label>Precio<input type="number" value={edit.precio} onChange={e => setEdit({ ...edit, precio: e.target.value })} /></label>
          <label>Cupos<input type="number" value={edit.cupos} onChange={e => setEdit({ ...edit, cupos: e.target.value })} /></label>
          <label>Modalidad<select value={edit.modalidad} onChange={e => setEdit({ ...edit, modalidad: e.target.value })}>
            <option value="mixta">Mixta</option>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
          </select></label>
          <label>Requisitos<input value={edit.requisitos} onChange={e => setEdit({ ...edit, requisitos: e.target.value })} /></label>
          <label>Calendario<input value={edit.calendario} onChange={e => setEdit({ ...edit, calendario: e.target.value })} /></label>
          <div className="form-row">
            <label style={{ flex: 1 }}>URL de imagen
              <input value={edit.imagen} onChange={e => setEdit({ ...edit, imagen: e.target.value })} placeholder="https://..." />
            </label>
            <label style={{ flex: 1 }}>Archivo
              <input type="file" accept="image/*" onChange={handleEditFile} />
            </label>
          </div>
          <div className="form-row" style={{ alignItems: 'center', gap: 12 }}>
            <span className="muted">Previsualización</span>
            <img src={editPreview} alt="preview" className="image-preview" />
          </div>
        </form>
      </Modal>
    </div>
  )
}