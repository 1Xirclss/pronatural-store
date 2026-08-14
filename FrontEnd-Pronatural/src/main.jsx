// Punto de entrada principal de la aplicación React
// Aquí se monta el componente raíz App en el elemento con id "root" del HTML
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css' // Estilos globales del proyecto
import App from './App.jsx' // Componente principal de la aplicación

// Renderizar la aplicación dentro de StrictMode para detectar problemas en desarrollo
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)