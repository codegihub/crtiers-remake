'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../../lib/auth';
import styles from './admin.module.css';

function AdminLoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1 className="gradient-text">CrTiers Admin</h1>
          <p>Enter admin password to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.passwordInput}
              required
            />
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <button type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>
        
        <div className={styles.loginFooter}>
          <a href="/" className={styles.backLink}>← Back to Website</a>
        </div>
      </div>
    </div>
  );
}

function AdminNavigation() {
  const { logout } = useAuth();
  
  return (
    <nav className={styles.adminNav}>
      <div className={styles.navContent}>
        <div className={styles.navLeft}>
          <h1 className={`${styles.adminTitle} gradient-text`}>CrTiers Admin</h1>
          <div className={styles.navLinks}>
            <a href="/admin" className={styles.navLink}>Dashboard</a>
            <a href="/admin/players" className={styles.navLink}>Players</a>
            <a href="/admin/hidden-players" className={styles.navLink}>Hidden Players</a>
          </div>
        </div>
        
        <div className={styles.navRight}>
          <a href="/" className={styles.navLink} target="_blank" rel="noopener noreferrer">
            View Website →
          </a>
          <button onClick={logout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={styles.adminPage}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  return (
    <div className={styles.adminPage}>
      <AdminNavigation />
      <main className={styles.adminMain}>
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </AuthProvider>
  );
}