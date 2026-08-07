export default function FormInput({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  error = '',
  options = null,
  ...rest
}) {
  const id = `field-${name}`
  const className = `form-control${error ? ' invalid' : ''}`

  return (
    <div className="form-group">
      <label htmlFor={id}>
        {label}
        {required && <span className="req">*</span>}
      </label>

      {options ? (
        <select id={id} name={name} value={value} onChange={onChange} className={className} {...rest}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={className}
          {...rest}
        />
      )}

      {error && <div className="field-error">{error}</div>}
    </div>
  )
}
