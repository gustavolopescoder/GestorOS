import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import Ordens from "./Ordens";
import Tecnicos from "./Tecnicos";
import Empresas from "./Empresas";
import OrdemDetalhe from "./OrdemDetalhe";
import NewOrdem from "./NovaOrdem";
import Login from "./Login";
import { useState } from "react";
const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3 },
};

function AnimatedRoutes({
  ordens,
  empresas,
  tecnicos,
  adicionarOrdem,
  handleLogin,
  usuarioLogado,
}) {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const navigate = useNavigate();
  const [showTokenExpiredModal, setShowTokenExpiredModal] = useState(false);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            <motion.div {...pageTransition}>
              {token ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )}
            </motion.div>
          }
        />

        <Route
          path="/"
          element={
            <motion.div {...pageTransition}>
              <Dashboard ordens={ordens} />
            </motion.div>
          }
        />
        <Route
          path="/ordens"
          element={
            <motion.div {...pageTransition}>
              <Ordens ordens={ordens} empresas={empresas} tecnicos={tecnicos} />
            </motion.div>
          }
        />
        <Route
          path="/tecnicos"
          element={
            <motion.div {...pageTransition}>
              <Tecnicos usuarioLogado={usuarioLogado} />
            </motion.div>
          }
        />
        <Route
          path="/empresas"
          element={
            <motion.div {...pageTransition}>
              <Empresas empresas={empresas} />
            </motion.div>
          }
        />
        <Route
          path="/ordens/:id"
          element={
            <motion.div {...pageTransition}>
              <OrdemDetalhe />
            </motion.div>
          }
        />
        <Route
          path="/newOrdem"
          element={
            <motion.div {...pageTransition}>
              <NewOrdem
                adicionarOrdem={adicionarOrdem}
                empresas={empresas}
                tecnicos={tecnicos}
              />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;
