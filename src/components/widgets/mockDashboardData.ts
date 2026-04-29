export const MOCK_STATS = {
  totalPatients: 142,
  activeTreatments: 38,
  pendingAlerts: 5,
};

export const MOCK_RADIATION_LOGS = [
  { day: 'Lun', radiation: 12.5, threshold: 15.0 },
  { day: 'Mar', radiation: 13.2, threshold: 15.0 },
  { day: 'Mié', radiation: 14.8, threshold: 15.0 },
  { day: 'Jue', radiation: 11.5, threshold: 15.0 },
  { day: 'Vie', radiation: 10.2, threshold: 15.0 },
  { day: 'Sáb', radiation: 9.8, threshold: 15.0 },
  { day: 'Dom', radiation: 8.5, threshold: 15.0 },
];

export const MOCK_ISOTOPE_DISTRIBUTION = [
  { name: 'I-131', value: 45 },
  { name: 'Tc-99m', value: 30 },
  { name: 'Y-90', value: 15 },
  { name: 'Lu-177', value: 10 },
];

export const MOCK_ALERTS_DATA = [
  { type: 'Alta Rad', count: 12 },
  { type: 'BPM Irregular', count: 8 },
  { type: 'Baja Actividad', count: 15 },
  { type: 'Fuera Zona', count: 3 },
];

export const MOCK_RADAR_DATA = [
  { subject: 'Movilidad', A: 120, B: 110, fullMark: 150 },
  { subject: 'Sueño', A: 98, B: 130, fullMark: 150 },
  { subject: 'Cardíaco', A: 86, B: 130, fullMark: 150 },
  { subject: 'Radiación', A: 99, B: 100, fullMark: 150 },
  { subject: 'Estrés', A: 85, B: 90, fullMark: 150 },
  { subject: 'Hidratación', A: 65, B: 85, fullMark: 150 },
];

export const MOCK_PATIENTS_LIST = [
  { id: 'all', name: 'Todos los pacientes' },
  { id: '1', name: 'Ana García' },
  { id: '2', name: 'Carlos Martínez' },
  { id: '3', name: 'Elena Rodríguez' },
  { id: '4', name: 'David Fernández' },
  { id: '5', name: 'María López' },
  { id: '6', name: 'Javier Sánchez' },
  { id: '7', name: 'Laura Gómez' },
  { id: '8', name: 'Pablo Díaz' },
  { id: '9', name: 'Sofía Ruiz' },
  { id: '10', name: 'Diego Alonso' },
  { id: '11', name: 'Carmen Navarro' },
  { id: '12', name: 'Raúl Torres' },
];
