import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// Clave única para todo el almacenamiento en localStorage
const STORAGE_KEY = 'arete_cdu_store_v1'

// Semillas iniciales para el sistema
const seedData = {
  users: [
    { id: 'u-admin', nombre: 'Super Admin', email: 'admin@arete.edu', pass: 'admin', rol: 'superadmin', categoria: 'docente', permisos: ['global'] },
    { id: 'u-stu-001', nombre: 'Carlos Estudiante', email: 'carlos@arete.edu', pass: '1234', rol: 'usuario', categoria: 'estudiante', permisos: [] },
    { id: 'u-doc-001', nombre: 'Diana Docente', email: 'diana@arete.edu', pass: '1234', rol: 'usuario', categoria: 'docente', permisos: [] },
    { id: 'u-ext-001', nombre: 'Eva Externa', email: 'eva@externo.com', pass: '1234', rol: 'usuario', categoria: 'externo', permisos: [] },
  ],
  sesiones: {
    currentUserId: null,
  },
  actividades: [
    // ejemplo de curso
    { id: 'act-nat-001', nombre: 'Curso de Natación Básico', tipo: 'curso', requisitos: ['nivel:0'], modalidad: 'mixta', precio: 50, cupos: 20, calendario: ['2025-11-10', '2025-11-17'], imagen: '/vite.svg' },
    { id: 'act-fit-001', nombre: 'Entrenamiento Funcional', tipo: 'taller', requisitos: ['mayores:16'], modalidad: 'presencial', precio: 35, cupos: 16, calendario: ['2025-11-12', '2025-11-19'], imagen: '/assets/react.svg' },
    { id: 'act-yoga-001', nombre: 'Yoga para Principiantes', tipo: 'clase', requisitos: [], modalidad: 'presencial', precio: 20, cupos: 25, calendario: ['2025-11-11', '2025-11-18'], imagen: '/vite.svg' },
    { id: 'act-fut-001', nombre: 'Fútbol 5 Intermedio', tipo: 'curso', requisitos: ['nivel:1'], modalidad: 'mixta', precio: 30, cupos: 18, calendario: ['2025-11-13', '2025-11-20'], imagen: '/assets/react.svg' },
  ],
  reservas: [], // {id, userId, instalacion, fechaHora, estado: 'confirmada'|'pendiente'|'cancelada', pago: {monto, ok}, semanaISO}
  accesos: [], // {id, userId, zona, tipo:'entrada'|'salida'|'denegado', fecha}
  inventario: [
    { id: 'inv-bal-001', nombre: 'Balones fútbol', stock: 12, umbral: 10 },
    { id: 'inv-pla-001', nombre: 'Platos de agilidad', stock: 4, umbral: 5 },
  ],
  ordenesCompra: [], // {id, itemId, cantidad, fecha, proveedor, estado}
  entrenamientos: [], // {id, userId, entrenadorId, evaluacionInicial, plan, registros:[]}
  contratos: [
    { id: 'ctr-sample-001', entrenadorId: 'ent-externo-001', actividadId: 'act-fit-001', honorarios: 100, retenciones: 0.1, comisiones: 0.05, pagos: [
      { id: 'pg-001', fecha: '2025-11-01T10:00:00Z', neto: 85 },
      { id: 'pg-002', fecha: '2025-11-03T10:00:00Z', neto: 85 },
    ] },
  ], // {id, entrenadorId, actividadId, honorarios, retenciones, comisiones, pagos:[]}
  incidencias: [], // {id, tipo:'accidente'|'sancion'|'acceso_denegado', detalle, fecha, userId, legal:{reporteId}, notificacionFamilia: {activada, fecha}}
  notificaciones: [], // {id, canal:'sms'|'email', para, asunto, mensaje, fecha, estado}
  reportes: [],
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...seedData }
    return JSON.parse(raw)
  } catch (e) {
    console.error('Error leyendo almacenamiento JSON', e)
    return { ...seedData }
  }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [store, setStore] = useState(loadStore())

  useEffect(() => {
    saveStore(store)
  }, [store])

  const api = useMemo(() => ({
    getStore: () => store,
    // Usuarios y auth
    register: ({ nombre, email, pass, categoria }) => {
      if (store.users.find(u => u.email === email)) throw new Error('Email ya registrado')
      const id = 'u-' + Math.random().toString(36).slice(2)
      const rol = 'usuario'
      const permisos = []
      const user = { id, nombre, email, pass, rol, categoria, permisos }
      setStore(s => ({ ...s, users: [...s.users, user] }))
      return user
    },
    login: ({ email, pass }) => {
      const user = store.users.find(u => u.email === email && u.pass === pass)
      if (!user) throw new Error('Credenciales inválidas')
      setStore(s => ({ ...s, sesiones: { ...s.sesiones, currentUserId: user.id } }))
      return user
    },
    logout: () => setStore(s => ({ ...s, sesiones: { ...s.sesiones, currentUserId: null } })),
    currentUser: () => store.users.find(u => u.id === store.sesiones.currentUserId) || null,

    // Actividades
    upsertActividad: (actividad) => {
      setStore(s => {
        const idx = s.actividades.findIndex(a => a.id === actividad.id)
        if (idx >= 0) {
          const actividades = [...s.actividades]
          actividades[idx] = { ...actividades[idx], ...actividad }
          return { ...s, actividades }
        }
        return { ...s, actividades: [...s.actividades, { ...actividad, id: 'act-' + Math.random().toString(36).slice(2) }] }
      })
    },
    actualizarActividad: ({ id, cambios }) => {
      setStore(s => ({ ...s, actividades: s.actividades.map(a => a.id === id ? { ...a, ...cambios } : a) }))
    },
    eliminarActividad: ({ id }) => {
      setStore(s => ({ ...s, actividades: s.actividades.filter(a => a.id !== id) }))
    },

    // Reservas con reglas de negocio
    crearReserva: ({ userId, instalacion, fechaHora, pagoOk, monto }) => {
      const fecha = new Date(fechaHora)
      const semanaISO = getISOWeekString(fecha)
      const delUsuarioEstaSemana = store.reservas.filter(r => r.userId === userId && r.semanaISO === semanaISO)
      if (delUsuarioEstaSemana.length >= 3) throw new Error('Máximo 3 reservas por semana')
      const id = 'res-' + Math.random().toString(36).slice(2)
      const estado = pagoOk ? 'confirmada' : 'pendiente'
      const reserva = { id, userId, instalacion, fechaHora, estado, pago: { monto, ok: !!pagoOk }, semanaISO }
      setStore(s => ({ ...s, reservas: [...s.reservas, reserva], notificaciones: !pagoOk ? [...s.notificaciones, {
        id: 'ntf-' + Math.random().toString(36).slice(2), canal: 'email', para: 'encargado_caja@arete.edu', asunto: 'Pago fallido en reserva', mensaje: `Reserva ${id} pendiente por fallo de pago`, fecha: new Date().toISOString(), estado: 'pendiente'
      }] : s.notificaciones }))
      return id
    },
    cancelarReserva: ({ id, fechaCancelacion }) => {
      setStore(s => {
        const r = s.reservas.find(x => x.id === id)
        if (!r) return s
        const fechaAct = new Date(r.fechaHora)
        const fechaCanc = new Date(fechaCancelacion || Date.now())
        const horas = (fechaAct - fechaCanc) / (1000 * 60 * 60)
        const reembolsoParcial = horas >= 48 ? Math.round(r.pago.monto * 0.5) : 0
        const reservas = s.reservas.map(x => x.id === id ? { ...x, estado: 'cancelada', reembolso: reembolsoParcial } : x)
        const notificaciones = [...s.notificaciones, {
          id: 'ntf-' + Math.random().toString(36).slice(2), canal: 'email', para: 'finanzas@arete.edu', asunto: 'Solicitud de reembolso', mensaje: `Reserva ${id} cancelada. Reembolso ${reembolsoParcial}`, fecha: new Date().toISOString(), estado: 'enviado'
        }]
        return { ...s, reservas, notificaciones }
      })
    },
    registrarNoShow: ({ id }) => {
      setStore(s => {
        const reservas = s.reservas.map(x => x.id === id ? { ...x, penalizacion: 10, estado: 'no-show' } : x)
        return { ...s, reservas }
      })
    },

    // Control de acceso
    registrarAcceso: ({ userId, zona, tipo }) => {
      const user = store.users.find(u => u.id === userId)
      const incidente = tipo === 'denegado'
      setStore(s => ({
        ...s,
        accesos: [...s.accesos, { id: 'acc-' + Math.random().toString(36).slice(2), userId, zona, tipo, fecha: new Date().toISOString() }],
        incidencias: incidente ? [...s.incidencias, { id: 'inc-' + Math.random().toString(36).slice(2), tipo: 'acceso_denegado', detalle: `Intento denegado en ${zona}`, fecha: new Date().toISOString(), userId, legal: null, notificacionFamilia: null }] : s.incidencias,
      }))
      return !!user
    },

    // Inventario y OC automática
    ajustarStock: ({ itemId, delta }) => {
      setStore(s => {
        const item = s.inventario.find(i => i.id === itemId)
        if (!item) return s
        const nuevo = { ...item, stock: item.stock + delta }
        const inventario = s.inventario.map(i => i.id === itemId ? nuevo : i)
        const ordenes = [...s.ordenesCompra]
        const notificaciones = [...s.notificaciones]
        if (nuevo.stock < nuevo.umbral) {
          const oc = { id: 'oc-' + Math.random().toString(36).slice(2), itemId, cantidad: nuevo.umbral * 2, fecha: new Date().toISOString(), proveedor: 'Proveedor Estándar', estado: 'creada' }
          ordenes.push(oc)
          notificaciones.push({ id: 'ntf-' + Math.random().toString(36).slice(2), canal: 'email', para: 'compras@arete.edu', asunto: 'Stock bajo', mensaje: `Crear OC ${oc.id} para ${item.nombre}`, fecha: new Date().toISOString(), estado: 'pendiente' })
        }
        return { ...s, inventario, ordenesCompra: ordenes, notificaciones }
      })
    },

    // Entrenamientos personalizados
    crearPrograma: ({ userId, entrenadorId, evaluacionInicial, plan }) => {
      const id = 'prog-' + Math.random().toString(36).slice(2)
      const prog = { id, userId, entrenadorId, evaluacionInicial, plan, registros: [] }
      setStore(s => ({ ...s, entrenamientos: [...s.entrenamientos, prog] }))
      return id
    },
    actualizarPlan: ({ id, plan }) => {
      setStore(s => ({ ...s, entrenamientos: s.entrenamientos.map(p => p.id === id ? { ...p, plan } : p) }))
    },
    registrarRendimiento: ({ id, registro }) => {
      setStore(s => ({ ...s, entrenamientos: s.entrenamientos.map(p => p.id === id ? { ...p, registros: [...p.registros, { ...registro, fecha: new Date().toISOString() }] } : p) }))
    },

    // Contratos y pagos
    crearContrato: ({ entrenadorId, actividadId, honorarios, retenciones = 0.1, comisiones = 0.05 }) => {
      const id = 'ctr-' + Math.random().toString(36).slice(2)
      const contrato = { id, entrenadorId, actividadId, honorarios, retenciones, comisiones, pagos: [] }
      setStore(s => ({ ...s, contratos: [...s.contratos, contrato] }))
      return id
    },
    actualizarContrato: ({ id, cambios }) => {
      setStore(s => ({ ...s, contratos: s.contratos.map(c => c.id === id ? { ...c, ...cambios } : c) }))
    },
    eliminarContrato: ({ id }) => {
      setStore(s => ({ ...s, contratos: s.contratos.filter(c => c.id !== id) }))
    },
    registrarPagoContrato: ({ contratoId }) => {
      setStore(s => ({
        ...s,
        contratos: s.contratos.map(c => {
          if (c.id !== contratoId) return c
          const neto = Math.round(c.honorarios * (1 - c.retenciones - c.comisiones))
          return { ...c, pagos: [...c.pagos, { id: 'pg-' + Math.random().toString(36).slice(2), fecha: new Date().toISOString(), neto }] }
        })
      }))
    },

    // Incidencias y accidentes
    registrarAccidente: ({ userId, detalle, notificarFamilia }) => {
      const id = 'inc-' + Math.random().toString(36).slice(2)
      const incidencia = { id, tipo: 'accidente', detalle, fecha: new Date().toISOString(), userId, legal: { reporteId: 'rep-' + Math.random().toString(36).slice(2) }, notificacionFamilia: notificarFamilia ? { activada: true, fecha: new Date().toISOString() } : null }
      setStore(s => ({ ...s, incidencias: [...s.incidencias, incidencia], notificaciones: notificarFamilia ? [...s.notificaciones, { id: 'ntf-' + Math.random().toString(36).slice(2), canal: 'sms', para: 'familia', asunto: 'Accidente', mensaje: `Incidente ${id}`, fecha: new Date().toISOString(), estado: 'enviado' }] : s.notificaciones }))
      return id
    },

    // Reportes
    generarReportesMensuales: ({ periodo }) => {
      const ingresosPorActividad = store.reservas.reduce((acc, r) => {
        const mes = r.fechaHora.slice(0, 7)
        if (mes !== periodo) return acc
        const key = r.instalacion
        acc[key] = (acc[key] || 0) + (r.pago?.monto || 0) - (r.reembolso || 0)
        return acc
      }, {})
      const ocupacionPorInstalacion = store.reservas.filter(r => r.fechaHora.slice(0, 7) === periodo).reduce((acc, r) => {
        acc[r.instalacion] = (acc[r.instalacion] || 0) + 1
        return acc
      }, {})
      const sanciones = store.reservas.filter(r => r.estado === 'no-show' && r.fechaHora.slice(0, 7) === periodo).map(r => ({ reservaId: r.id, penalizacion: r.penalizacion || 0 }))
      const reporte = { id: 'rpt-' + Math.random().toString(36).slice(2), periodo, ingresosPorActividad, ocupacionPorInstalacion, sanciones }
      setStore(s => ({ ...s, reportes: [...s.reportes, reporte] }))
      return reporte
    },
  }), [store])

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export function useAuth() {
  const store = useStore()
  const [currentUser, setCurrentUser] = useState(store.currentUser())
  useEffect(() => {
    setCurrentUser(store.currentUser())
  }, [store])
  return { currentUser, login: store.login, logout: store.logout, register: store.register }
}

function getISOWeekString(date) {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = tmp.getUTCDay() || 7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7)
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}