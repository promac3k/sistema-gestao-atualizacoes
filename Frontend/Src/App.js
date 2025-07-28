import React, { useEffect, useState, Suspense } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import {
    ClockIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import useServerStatus from "./hooks/useServerStatus";

// Lazy loading das páginas para reduzir o bundle inicial
const LoginPage = React.lazy(() => import("./Pages/LoginPage"));
const Dashboard = React.lazy(() => import("./Pages/DashboardPage"));
const Dispositivos = React.lazy(() => import("./Pages/DispositivosPage"));
const UpdatePage = React.lazy(() => import("./Pages/UpdatesPage"));
const DispositivosDetalhes = React.lazy(() =>
    import("./Pages/DispositivosDetalhes")
);
const RelatorioPage = React.lazy(() => import("./Pages/RelatorioPage"));

// Componente de loading
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
);

function App() {
    const backendOnline = useServerStatus();
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const auth = localStorage.getItem("auth") === "true";
        const authTime = parseInt(localStorage.getItem("authTime"), 10);
        const now = Date.now();
        // 30 minutes = 1800000 milliseconds
        // 1 minute = 60000 milliseconds
        if (auth && authTime && now - authTime < 1800000) {
            return true;
        } else {
            localStorage.removeItem("auth");
            localStorage.removeItem("authTime");
            return false;
        }
    });
    const [showSessionPopup, setShowSessionPopup] = useState(false);

    // Checa expiração da sessão
    useEffect(() => {
        if (!isLoggedIn) return;
        const interval = setInterval(() => {
            const authTime = parseInt(localStorage.getItem("authTime"), 10);
            const now = Date.now();
            if (authTime && now - authTime >= 1800000) {
                setShowSessionPopup(true);
            }
        }, 60000); // Checa a cada 1 minuto
        return () => clearInterval(interval);
    }, [isLoggedIn]);

    useEffect(() => {
        if (!showSessionPopup) return;

        // Timer para auto-logout após 5 minutos com o popup aberto
        const timeout = setTimeout(() => {
            localStorage.removeItem("auth");
            localStorage.removeItem("authTime");
            setShowSessionPopup(false);
            setIsLoggedIn(false);
        }, 300000); // 5 minutos = 300000 ms

        return () => clearTimeout(timeout);
    }, [showSessionPopup]);

    // Funções dos botões do popup
    const handleRenewSession = () => {
        localStorage.setItem("authTime", Date.now().toString());
        setShowSessionPopup(false);
    };

    const handleCancelSession = () => {
        localStorage.removeItem("auth");
        localStorage.removeItem("authTime");
        setShowSessionPopup(false);
        setIsLoggedIn(false);
    };

    if (backendOnline === null) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
                <p className="text-xl">🔄 Verificando servidor...</p>
            </div>
        );
    }

    if (!backendOnline) {
        // Lazy load da página offline apenas quando necessário
        const OfflinePageLazy = React.lazy(() => import("./Pages/OfflinePage"));
        return (
            <Suspense fallback={<LoadingSpinner />}>
                <OfflinePageLazy />
            </Suspense>
        );
    }

    return (
        <>
            {showSessionPopup && (
                <>
                    {/* Overlay para bloquear interação com efeito blur */}
                    <div
                        className="fixed inset-0 z-40"
                        style={{ background: "rgba(0,0,0,0.01)" }}
                    ></div>

                    {/* Popup centralizado */}
                    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all">
                            {/* Header do popup com ícone */}
                            <div className="flex items-center gap-3 p-6 border-b border-gray-200 bg-gray-800 rounded-t-2xl">
                                <div className="flex-shrink-0">
                                    <ExclamationTriangleIcon className="w-8 h-8 text-amber-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        Sessão Expirada
                                    </h2>
                                </div>
                            </div>

                            {/* Conteúdo do popup */}
                            <div className="p-6">
                                <div className="flex items-start gap-3 mb-6">
                                    <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div className="text-gray-700">
                                        <p className="mb-2">
                                            Por motivos de segurança, sua sessão
                                            expira após 30 minutos.
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Deseja renovar sua sessão ou fazer
                                            logout?
                                        </p>
                                    </div>
                                </div>

                                {/* Botões de ação */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        onClick={handleRenewSession}
                                    >
                                        Renovar Sessão
                                    </button>
                                    <button
                                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        onClick={handleCancelSession}
                                    >
                                        Fazer Logout
                                    </button>
                                </div>
                            </div>

                            {/* Footer com informação de auto-logout */}
                            <div className="bg-gray-100 px-6 py-3 rounded-b-2xl">
                                <p className="text-xs text-gray-500 text-center">
                                    ⏱️ Logout automático em 5 minutos se nenhuma
                                    ação for tomada
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
            <Router>
                <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                isLoggedIn ? (
                                    <Navigate to="/dashboard" />
                                ) : (
                                    <LoginPage
                                        onLogin={() => setIsLoggedIn(true)}
                                    />
                                )
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                isLoggedIn ? <Dashboard /> : <Navigate to="/" />
                            }
                        />
                        <Route
                            path="/dispositivos"
                            element={
                                isLoggedIn ? (
                                    <Dispositivos />
                                ) : (
                                    <Navigate to="/" />
                                )
                            }
                        />
                        <Route
                            path="/update"
                            element={
                                isLoggedIn ? (
                                    <UpdatePage />
                                ) : (
                                    <Navigate to="/" />
                                )
                            }
                        />
                        <Route
                            path="/dispositivos/:id"
                            element={
                                isLoggedIn ? (
                                    <DispositivosDetalhes />
                                ) : (
                                    <Navigate to="/" />
                                )
                            }
                        />
                        <Route
                            path="/relatorio"
                            element={
                                isLoggedIn ? (
                                    <RelatorioPage />
                                ) : (
                                    <Navigate to="/" />
                                )
                            }
                        />
                    </Routes>
                </Suspense>
            </Router>
        </>
    );
}

export default App;
