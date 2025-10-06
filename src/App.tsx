import { Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'

import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route 
          path="/" 
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Dashboard />
            </motion.div>
          } 
        />
        <Route 
          path="/dashboard" 
          element={<Navigate to="/" replace />}
        />
        <Route 
          path="/reporte" 
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Dashboard />
            </motion.div>
          } 
        />
        <Route 
          path="/consulta" 
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Dashboard />
            </motion.div>
          } 
        />
      </Routes>
    </Layout>
  )
}

export default App