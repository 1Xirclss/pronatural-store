// Layout de autenticación (Login, Register, Recuperar contraseña)
// Divide la pantalla en dos mitades: panel izquierdo decorativo y formulario a la derecha
export default function AuthLayout({ leftPanel, children }) {
  return (
    <div className="flex min-h-screen bg-brand-bg font-sans">

      {/* Panel izquierdo: imagen o diseño decorativo (visible solo en pantallas grandes) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0b2216] overflow-hidden">
        {leftPanel}
      </div>

      {/* Panel derecho: contiene el formulario de autenticación */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Contenido del formulario pasado como prop (Login, Register, etc.) */}
          {children}
        </div>
      </div>

    </div>
  );
}
