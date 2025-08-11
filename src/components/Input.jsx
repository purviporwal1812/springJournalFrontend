  const Input = ({ id, name, type, label, value, onChange, error, disabled }) => (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder=" " // Required for the floating label effect
        className={`
          block w-full px-4 py-3 bg-white/50 border rounded-lg
          font-['Inter',_sans-serif] text-gray-800
          focus:outline-none focus:ring-2 focus:ring-teal-400
          peer
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      />
      <label
        htmlFor={id}
        className={`
          absolute left-4 text-gray-500
          transition-all duration-300 transform
          peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
          peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-teal-600
          -top-2.5 text-xs
        `}
      >
        {label}
      </label>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );

export default Input;