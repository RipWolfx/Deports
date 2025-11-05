// Adaptador que envuelve el API actual del jsonStore como repositorio.

export function createInMemoryStoreRepository(storeApi) {
  return {
    generarReportesMensuales: ({ periodo }) => storeApi.generarReportesMensuales({ periodo }),
  }
}