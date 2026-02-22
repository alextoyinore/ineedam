import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, FileQuestion, RefreshCw } from 'lucide-react';

export const NotFoundPage = () => {
    const navigate = useNavigate();

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="error-page-container" style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'var(--bg-base)',
            textAlign: 'center'
        }}>
            <style>
                {`
                @media (max-width: 768px) {
                    .error-h1 { font-size: 3.5rem !important; }
                    .error-h2 { font-size: 1.5rem !important; }
                    .error-p { font-size: 1rem !important; margin-bottom: 2rem !important; }
                    .error-actions { flex-direction: column; width: 100% !important; }
                    .error-btn { width: 100% !important; }
                    .error-page-container { padding: 1.5rem !important; }
                }
                `}
            </style>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{ position: 'relative', marginBottom: '2rem' }}
            >
                <div style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '-10px',
                    right: '-10px',
                    bottom: '-10px',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    borderRadius: '50%',
                    filter: 'blur(20px)',
                    opacity: 0.2
                }}></div>
                <div className="glass-panel" style={{
                    width: '120px',
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    borderRadius: '50%'
                }}>
                    <FileQuestion size={60} color="var(--primary)" />
                </div>
            </motion.div>

            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="h1 text-gradient error-h1"
                style={{ fontSize: '5rem', margin: '0 0 0.5rem 0', lineHeight: 1 }}
            >
                404
            </motion.h1>

            <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="h2 error-h2"
                style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text-primary)' }}
            >
                Page Not Found
            </motion.h2>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="error-p"
                style={{
                    color: 'var(--text-muted)',
                    maxWidth: '400px',
                    marginBottom: '3rem',
                    lineHeight: 1.6,
                    fontSize: '1.1rem'
                }}
            >
                The page you're looking for doesn't exist or has been moved.
            </motion.p>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="error-actions"
                style={{
                    display: 'flex',
                    gap: '1rem',
                    width: '100%',
                    maxWidth: '400px',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}
            >
                <button
                    onClick={handleRefresh}
                    className="btn btn-secondary error-btn"
                    style={{ flex: 1, minWidth: '160px', padding: '1rem' }}
                >
                    <RefreshCw size={20} />
                    Refresh
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="btn btn-primary error-btn"
                    style={{ flex: 1, minWidth: '160px', padding: '1rem' }}
                >
                    <Home size={20} />
                    Home
                </button>
            </motion.div>
        </div>
    );
};
