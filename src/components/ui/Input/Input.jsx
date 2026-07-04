import "./Input.css";

function Input({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  min,
  max,
  ...props
}) {
  return (
    <input
      className="input"
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      {...props}
    />
  );
}

export default Input;