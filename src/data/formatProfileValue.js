export function formatProfileValue(field, value) {
  if (value === '' || value === null || value === undefined) return 'Non renseigné';
  if (field.options) {
    return field.options.find(([code]) => String(code) === String(value))?.[1] ?? 'Valeur non reconnue';
  }
  const units = { age: 'ans', trestbps: 'mmHg', chol: 'mg/dL', thalach: 'bpm' };
  return units[field.name] ? `${value} ${units[field.name]}` : String(value);
}
