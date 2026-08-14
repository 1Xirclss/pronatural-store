import { formatElSalvadorPhone } from '../../utils/phoneFormatter';

export default function PhoneInputField({ 
  value = '', 
  onChange, 
  placeholder = "+503 7000-0000", 
  darkTheme = false, 
  className = '', 
  error,
  disabled = false,
  ...props 
}) {
  const handleChange = (e) => {
    const formatted = formatElSalvadorPhone(e.target.value);
    if (onChange) onChange(formatted);
  };

  const handleFocus = (e) => {
    if (!e.target.value) {
      if (onChange) onChange('+503 ');
    }
  };

  const displayVal = formatElSalvadorPhone(value);

  const inputStyle = darkTheme
    ? `w-full bg-[#0d1114] border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80] transition-colors`
    : `w-full bg-transparent border-b ${error ? 'border-red-500' : 'border-gray-200'} py-2 text-[13px] text-brand-dark focus:outline-none focus:border-brand-dark transition-colors`;

  return (
    <div className={`w-full ${className}`}>
      <input
        type="text"
        value={displayVal}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={inputStyle}
        {...props}
      />
      {error && (
        <p className={`text-[10px] mt-1 ${darkTheme ? 'text-red-400' : 'text-red-500'}`}>
          {error}
        </p>
      )}
    </div>
  );
}
