import "./Button.css";

function Button({
  children,
  type = "button",
  onClick,
  disabled = false,
  variant = "primary",
  full = false,
}) {
  return (
    <button
      className={`button ${variant} ${full ? "full" : ""}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;