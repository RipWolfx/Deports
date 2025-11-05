import { useState } from 'react'
import { useAuth, useStore } from '../utils/jsonStore.jsx'
import { useStatus } from '../utils/status.jsx'

export default function TrainingPrograms() {
  const { currentUser } = useAuth()
  const store = useStore()
  const programas = store.getStore().entrenamientos.filter(p => p.userId === currentUser.id)
  const status = useStatus()
  const [entrenadorId, setEntrenadorId] = useState('ent-externo-001')
  const [evaluacionInicial, setEvaluacionInicial] = useState('')
  const [plan, setPlan] = useState('')
  const crear = (e) => {
    e.preventDefault()
    store.crearPrograma({ userId: currentUser.id, entrenadorId, evaluacionInicial, plan })
    status.success('Programa creado', entrenadorId)
    setEvaluacionInicial(''); setPlan('')
  }
  const actualizarPlan = (id, planNuevo) => { store.actualizarPlan({ id, plan: planNuevo }); status.info('Plan actualizado', id) }
  const registrarRendimiento = (id, registro) => { store.registrarRendimiento({ id, registro }); status.success('Rendimiento registrado', id) }
  return (
    <div style={{ padding: 24 }}>
      <h2>Programas de Entrenamiento</h2>
      <form onSubmit={crear} style={{ display: 'grid', gap: 8, maxWidth: 600 }}>
        <label>Entrenador externo<input value={entrenadorId} onChange={e => setEntrenadorId(e.target.value)} /></label>
        <label>Evaluación inicial<textarea value={evaluacionInicial} onChange={e => setEvaluacionInicial(e.target.value)} /></label>
        <label>Plan inicial<textarea value={plan} onChange={e => setPlan(e.target.value)} /></label>
        <button>Crear programa</button>
      </form>
      <h3 style={{ marginTop: 16 }}>Mis programas</h3>
      {programas.map(p => (
        <div key={p.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <strong>{p.id}</strong> — entrenador: {p.entrenadorId}
          <p>Plan: {p.plan}</p>
          <button onClick={() => actualizarPlan(p.id, prompt('Nuevo plan', p.plan) || p.plan)}>Actualizar plan</button>
          <button style={{ marginLeft: 8 }} onClick={() => registrarRendimiento(p.id, { nota: prompt('Registro de rendimiento'), valor: Number(prompt('Valor (número)') || 0) })}>Registrar rendimiento</button>
          <ul>
            {p.registros.map((r, idx) => <li key={idx}>{r.fecha} — {r.nota} — {r.valor}</li>)}
          </ul>
        </div>
      ))}
    </div>
  )
}