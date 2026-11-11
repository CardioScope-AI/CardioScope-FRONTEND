export default function FormField({ field, value, onChange, error }) {
  const id = `simulation-${field.name}`;
  const describedBy = [field.hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const sharedProps = {
    id,
    name: field.name,
    value,
    onChange,
    required: true,
    'aria-invalid': error ? true : undefined,
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
          <p id={`${id}-hint`} className="sr-only">{field.hint}</p>
        </>
      )}
      {error && <p id={`${id}-error`} className="mt-1 text-xs text-brand">{error}</p>}
    </div>
  );
}
