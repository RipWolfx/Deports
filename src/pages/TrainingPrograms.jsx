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
    <div className="container">
      <h2 className="page-title">Programas de Entrenamiento</h2>
      <form onSubmit={crear} className="form-grid" style={{ maxWidth: 640 }}>
        <label>Entrenador externo
          <select value={entrenadorId} onChange={e => setEntrenadorId(e.target.value)}>
            <option value="ent-externo-001">ent-externo-001 (Luis Gómez)</option>
            <option value="ent-externo-002">ent-externo-002 (Ana Ruiz)</option>
            <option value="ent-interno-001">ent-interno-001 (Docente)</option>
          </select>
          <span className="hint">Recomendado: externo certificado para evaluación inicial.</span>
        </label>
        <label>Evaluación inicial
          <textarea placeholder="Condición física, lesiones, objetivo" value={evaluacionInicial} onChange={e => setEvaluacionInicial(e.target.value)} />
          <span className="hint">Ej: IMC, resistencia, movilidad, historial de lesiones.</span>
        </label>
        <label>Plan inicial
          <textarea placeholder="3 sesiones/semana: cardio (x2) + técnica (x1)" value={plan} onChange={e => setPlan(e.target.value)} />
          <span className="hint">Incluye frecuencia, duración y tipo de ejercicios.</span>
        </label>
        <button className="btn btn-primary">Crear programa</button>
      </form>
      <h3 style={{ marginTop: 16 }}>Mis programas</h3>
      {programas.map(p => (
        <div key={p.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <strong>{p.id}</strong> — entrenador: {p.entrenadorId}
          <p>Plan: {p.plan}</p>
          <button className="btn btn-secondary" onClick={() => actualizarPlan(p.id, prompt('Nuevo plan', p.plan) || p.plan)}>Actualizar plan</button>
          <button className="btn btn-primary" style={{ marginLeft: 8 }} onClick={() => registrarRendimiento(p.id, { nota: prompt('Registro de rendimiento'), valor: Number(prompt('Valor (número)') || 0) })}>Registrar rendimiento</button>
          <ul>
            {p.registros.map((r, idx) => <li key={idx}>{r.fecha} — {r.nota} — {r.valor}</li>)}
          </ul>
        </div>
      ))}
    </div>
  )
}