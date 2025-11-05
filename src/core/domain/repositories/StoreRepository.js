// Interface (documentada) para repositorio de datos del sistema.
// En JS no imponemos tipos, pero describimos las operaciones usadas por casos de uso.
// Implementaciones: ver infraestructura.

/**
 * @typedef {Object} StoreRepository
 * @property {(args: { periodo: string }) => any} generarReportesMensuales
 */

export const createStoreRepository = (impl) => impl