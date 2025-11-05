export function formatSoles(value) {
  const num = Number(value || 0)
  try {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(num)
  } catch (e) {
    // Fallback simple
    return `S/${num.toFixed(2)}`
  }
}