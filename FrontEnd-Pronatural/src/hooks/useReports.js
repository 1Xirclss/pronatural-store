// Hook personalizado para obtener los reportes del sistema
// Se comunica con el endpoint /reports del backend
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export function useReports() {
  // Datos del reporte obtenidos del backend
  const [reportData, setReportData] = useState(null);

  // Estado de carga mientras se obtienen los datos
  const [loading, setLoading] = useState(true);

  // Mensaje de error si algo falla
  const [error, setError] = useState(null);

  // Función para cargar los reportes desde el backend
  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports();
      setReportData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar reportes al montar el componente
  useEffect(() => {
    fetchReports();
  }, []);

  return { reportData, loading, error, refetch: fetchReports };
}
