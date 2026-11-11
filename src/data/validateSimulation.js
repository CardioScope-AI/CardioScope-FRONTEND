import { simulationGroups } from './simulationFields.js';

export function validateSimulation(values) {
  const payload = {};
  const errors = {};
  for (const field of simulationGroups.flatMap(group => group.fields)) {
    const raw = values[field.name];
    if (raw === undefined || raw === null || String(raw).trim() === '') {
      errors[field.name] = `Renseignez le champ « ${field.label} ».`;
      continue;
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      errors[field.name] = 'Indiquez une valeur numérique valide.';
    } else if (field.options && !field.options.some(([code]) => code === value)) {
      errors[field.name] = 'Sélectionnez une valeur proposée dans la liste.';
    } else if (field.step === '1' && !Number.isInteger(value)) {
      errors[field.name] = 'Indiquez un nombre entier.';
    } else {
      payload[field.name] = value;
    }
  }
  return { payload, errors };
}
