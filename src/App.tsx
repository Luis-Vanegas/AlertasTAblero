import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import { PageWrapper } from './components/common/PageWrapper';
import { useUrlFilters } from './hooks/useUrlFilters';
import { ROUTES } from './constants';

// Componente wrapper para Dashboard que maneja los filtros de URL
function DashboardWithFilters() {
  useUrlFilters();
  return <Dashboard />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Página de inicio - sin Layout */}
      <Route
        path={ROUTES.HOME}
        element={
          <PageWrapper>
            <Home />
          </PageWrapper>
        }
      />
      {/* Dashboard de alertas - con Layout */}
      <Route
        path={ROUTES.ALERTAS}
        element={
          <Layout>
            <PageWrapper>
              <DashboardWithFilters />
            </PageWrapper>
          </Layout>
        }
      />
      {/* Redirecciones para mantener compatibilidad */}
      <Route path={ROUTES.DASHBOARD} element={<Navigate to={ROUTES.ALERTAS} replace />} />
      <Route
        path={ROUTES.REPORTE}
        element={
          <Layout>
            <PageWrapper>
              <Dashboard />
            </PageWrapper>
          </Layout>
        }
      />
      <Route
        path={ROUTES.CONSULTA}
        element={
          <Layout>
            <PageWrapper>
              <Dashboard />
            </PageWrapper>
          </Layout>
        }
      />
    </Routes>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;
