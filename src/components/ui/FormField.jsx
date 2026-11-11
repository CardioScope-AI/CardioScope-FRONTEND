export default function FormField({ field, value, onChange }) {
  const id = `simulation-${field.name}`;
  const describedBy = field.hint ? `${id}-hint` : undefined;
  const sharedProps = {
    id,
    name: field.name,
    value,
    onChange,
    className: 'ui-field mt-1.5 min-h-11 text-sm',
    'aria-describedby': describedBy,
  };
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-xs font-bold">{field.label}</label>
      {field.options ? (
        <select {...sharedProps}>
          <option value="">Sélectionner</option>
          {field.options.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
        </select>
      ) : (
        <>
          <input {...sharedProps} type="number" step={field.step} placeholder={field.hint} />
          <p id={describedBy} className="sr-only">{field.hint}</p>
        </>
      )}
    </div>
  );
}
