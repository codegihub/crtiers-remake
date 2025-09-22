'use client';

import { useState } from 'react';
import styles from './MobileNav.module.css';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <button 
        className={styles.hamburger}
        onClick={toggleSidebar}
        aria-label="Toggle navigation menu"
      >
        <span className={`${styles.line} ${isOpen ? styles.line1 : ''}`}></span>
        <span className={`${styles.line} ${isOpen ? styles.line2 : ''}`}></span>
        <span className={`${styles.line} ${isOpen ? styles.line3 : ''}`}></span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className={styles.overlay}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarHeader}>
            <h2 className="gradient-text">CrystalTiers</h2>
            <button 
              className={styles.closeButton}
              onClick={closeSidebar}
              aria-label="Close navigation menu"
            >
              ×
            </button>
          </div>
          
          <nav className={styles.sidebarNav}>
            <a 
              href="/" 
              className={styles.sidebarLink}
              onClick={closeSidebar}
            >
              Home
            </a>
            <a 
              href="/leaderboards" 
              className={styles.sidebarLink}
              onClick={closeSidebar}
            >
              Leaderboards
            </a>
            <a 
              href="/server" 
              className={styles.sidebarLink}
              onClick={closeSidebar}
            >
              Server
            </a>
            <a 
              href="/more" 
              className={styles.sidebarLink}
              onClick={closeSidebar}
            >
              More
            </a>
          </nav>
        </div>
      </div>
    </>
  );
}
