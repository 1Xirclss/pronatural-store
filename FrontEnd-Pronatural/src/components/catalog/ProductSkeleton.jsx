// Componente esqueleto con animación shimmer para simular la carga de productos en el catálogo
export default function ProductSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse select-none">
      {/* Contenedor de la imagen fantasma con relación de aspecto 4:5 */}
      <div className="relative w-full bg-[#e3e8e1] rounded-sm mb-3 overflow-hidden" style={{ paddingBottom: '125%' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#30b466]/15 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] motion-reduce:animate-none" />
      </div>

      {/* Título fantasma */}
      <div className="h-4 bg-[#e3e8e1] rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-[#e3e8e1] rounded w-1/2 mb-4"></div>

      {/* Precio y botón fantasma */}
      <div className="flex flex-col gap-2 mt-auto pt-1">
        <div className="h-4 bg-[#e3e8e1] rounded w-1/4"></div>
        <div className="h-9 bg-[#e3e8e1] rounded w-full"></div>
      </div>
    </div>
  );
}
