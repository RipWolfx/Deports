# Diagrama de Casos de Uso — Centro Deportivo Universitario "Areté"

PlantUML del diagrama completo (puedes renderizarlo con cualquier visor PlantUML):

```plantuml
@startuml
left to right direction
skinparam actorStyle awesome

actor Usuario as U
actor Invitado as G
actor "Responsable de Operaciones" as RO
actor "Encargado de Caja" as EC
actor "Control de Acceso" as CA
actor "Encargado de Compras" as ECOM
actor "Entrenador Externo" as EE
actor "Encargado de RRHH" as RRHH
actor "Personal de Emergencias" as PE
actor "Superadministrador" as SA
actor "Administrador de instalaciones" as AI
actor "Administrador financiero" as AF
actor "Personal de atención" as PA
actor "Sistema de Notificaciones (SMS/Email)" as SN

rectangle Sistema {
  usecase "Crear cuenta (estudiante/docente/externo)" as UC1
  usecase "Login" as UC2
  usecase "Aplicar reglas de descuentos y permisos" as UC3

  usecase "Inscribirse en curso de natación" as UC4
  usecase "Inscribirse en programa personalizado" as UC5
  usecase "Agendar evaluación inicial" as UC6
  usecase "Registrar/Actualizar plan de entrenamiento" as UC7

  usecase "Publicar calendario de actividades" as UC8
  usecase "Definir cupos, precios y requisitos" as UC9

  usecase "Reservar cancha/sala" as UC10
  usecase "Pagar en línea" as UC11
  usecase "Marcar pago fallido → reserva pendiente" as UC12
  usecase "Alertar encargado de caja" as UC13

  usecase "Validar credenciales" as UC14
  usecase "Registrar entradas/salidas" as UC15
  usecase "Registrar incidente por acceso denegado" as UC16

  usecase "Gestionar inventario y merchandising" as UC17
  usecase "Crear orden de compra por stock bajo" as UC18
  usecase "Notificar encargado de compras" as UC19

  usecase "Firmar contrato por actividad" as UC20
  usecase "Aprobar y registrar pagos por honorarios" as UC21
  usecase "Calcular retenciones y comisiones" as UC22

  usecase "Registrar accidente e incidente" as UC23
  usecase "Generar reporte legal" as UC24
  usecase "Notificar a la familia (si autorizado)" as UC25

  usecase "Generar reportes mensuales (ingresos/ocupación/sanciones)" as UC26
  usecase "Exportar datos para contabilidad" as UC27

  usecase "Regla: Máx. 3 reservas por semana" as UC28
  usecase "Regla: Cancelación con reembolso parcial ≥48h" as UC29
  usecase "Regla: Penalización por no-show" as UC30

  usecase "Registrar datos manuales de rendimiento" as UC31
  usecase "Extensibilidad: Integrar seguimiento biométrico (futuro)" as UC32

  usecase "Roles administrativos y permisos" as UC33
}

U --> UC1
U --> UC2
UC2 --> UC3
U --> UC4
U --> UC5
UC5 --> UC6
UC5 --> UC7
EE --> UC7

RO --> UC8
RO --> UC9

G --> UC10
G --> UC11
UC11 --> UC12
UC12 --> UC13
EC --> UC13

CA --> UC14
CA --> UC15
CA --> UC16

U --> UC17
ECOM --> UC18
UC18 --> UC19
SN --> UC19

EE --> UC20
RRHH --> UC21
UC21 --> UC22

PE --> UC23
UC23 --> UC24
UC23 --> UC25
SN --> UC25

SA --> UC26
AF --> UC26
AF --> UC27

UC10 --> UC28
UC10 --> UC29
UC10 --> UC30

U --> UC31
UC31 ..> UC32 : <<extiende>>

SA --> UC33
AI --> UC33
AF --> UC33
PA --> UC33

note bottom of UC33
  Niveles: 
  - Superadministrador (configuración global)
  - Administrador de instalaciones (canchas y mantenimiento)
  - Administrador financiero (reembolsos)
  - Personal de atención (inscripciones presenciales)
end note

@enduml
```

Este diagrama resume los actores identificados y sus interacciones con los casos de uso del sistema, incluyendo reglas de negocio, notificaciones automáticas y módulos con posibilidad de extensibilidad (biométrico futuro).