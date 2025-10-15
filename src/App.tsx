import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import { ANIMATION_VARIANTS, TRANSITIONS } from './constants';

function App() {
  return (
    <Layout>
      <Routes>
        <Route
          path='/'
          element={
            <motion.div
              initial={ANIMATION_VARIANTS.page.initial}
              animate={ANIMATION_VARIANTS.page.in}
              exit={ANIMATION_VARIANTS.page.out}
              variants={ANIMATION_VARIANTS.page}
              transition={TRANSITIONS.page}
            >
              <Dashboard />
            </motion.div>
          }
        />
        <Route path='/dashboard' element={<Navigate to='/' replace />} />
        <Route
          path='/reporte'
          element={
            <motion.div
              initial={ANIMATION_VARIANTS.page.initial}
              animate={ANIMATION_VARIANTS.page.in}
              exit={ANIMATION_VARIANTS.page.out}
              variants={ANIMATION_VARIANTS.page}
              transition={TRANSITIONS.page}
            >
              <Dashboard />
            </motion.div>
          }
        />
        <Route
          path='/consulta'
          element={
            <motion.div
              initial={ANIMATION_VARIANTS.page.initial}
              animate={ANIMATION_VARIANTS.page.in}
              exit={ANIMATION_VARIANTS.page.out}
              variants={ANIMATION_VARIANTS.page}
              transition={TRANSITIONS.page}
            >
              <Dashboard />
            </motion.div>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;
