'use client';

import { useState } from 'react';
import styles from './server.module.css';

export default function Server() {
  const [copied, setCopied] = useState(false);
  const serverIP = 'crystaltiers.club';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(serverIP);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <h1 className="gradient-text">CrTiers</h1>
          </div>
          <div className={styles.navLinks}>
            <a href="/" className={styles.navLink}>Home</a>
            <a href="/leaderboards" className={styles.navLink}>Leaderboards</a>
            <a href="/server" className={styles.navLink}>Server</a>
            <a href="/more" className={styles.navLink}>More</a>
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.heroSection}>
          <h1 className={styles.title}>
            Join the <span className="gradient-text">CrTiers</span> Server
          </h1>
          <p className={styles.subtitle}>
            Experience competitive Minecraft at its finest with our custom-built arenas and professional ranking system.
          </p>
        </section>

        <section className={styles.serverInfoSection}>
          <div className={styles.serverCard}>
            <h2>Server Information</h2>
            <div className={styles.ipSection}>
              <div className={styles.ipContainer}>
                <span className={styles.ipLabel}>Server IP:</span>
                <code className={styles.serverIP}>{serverIP}</code>
                <button 
                  onClick={copyToClipboard}
                  className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>
            
            <div className={styles.serverDetails}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Version:</span>
                <span className={styles.detailValue}>1.20+</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Game Modes:</span>
                <span className={styles.detailValue}>8 Competitive Modes</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Status:</span>
                <span className={`${styles.detailValue} ${styles.online}`}>Online 24/7</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.aboutSection}>
          <div className={styles.aboutContent}>
            <h2>About CrTiers Server</h2>
            <p>
              CrTiers is a premium competitive Minecraft server featuring expertly designed arenas 
              and a comprehensive ranking system. Our server hosts 8 unique game modes, each with 
              its own specialized arena and tier-based progression system.
            </p>
            
            <div className={styles.features}>
              <div className={styles.featureItem}>
                <h3>🏟️ Custom Arenas</h3>
                <p>Professionally built arenas designed specifically for competitive gameplay, each optimized for different combat styles and strategies.</p>
              </div>
              
              <div className={styles.featureItem}>
                <h3>🏆 Competitive Ranking</h3>
                <p>Advanced tier system from F to S+ with region-based matchmaking and detailed performance tracking across all game modes.</p>
              </div>
              
              <div className={styles.featureItem}>
                <h3>⚔️ Multiple Game Modes</h3>
                <p>Experience Vanilla PvP, UHC, Pot PvP, Sword, Axe, Mace combat, SMP, and our signature NethPot mode.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.screenshotsSection}>
          <h2>Server Screenshots</h2>
          <div className={styles.screenshotGrid}>
            <div className={styles.screenshot}>
              <img 
                src="https://media.discordapp.net/attachments/1384521759188979774/1416150484456181831/server-screenshot-2.png?ex=68c5cc6a&is=68c47aea&hm=270dfb217dcb8c84a762ab5ccf12ad21c5778b59f90896ed721edad0fed9ac89&=&format=webp&quality=lossless&width=874&height=874" 
                alt="CrTiers Server Arena"
                className={styles.screenshotImage}
                onError={(e) => {
                  e.currentTarget.src = 'https://media.discordapp.net/attachments/1384521759188979774/1416150484456181831/server-screenshot-2.png?ex=68c5cc6a&is=68c47aea&hm=270dfb217dcb8c84a762ab5ccf12ad21c5778b59f90896ed721edad0fed9ac89&=&format=webp&quality=lossless&width=874&height=874';
                }}
              />
              <p className={styles.screenshotCaption}>Main PvP Arena with custom builds</p>
            </div>
            
            <div className={styles.screenshot}>
              <img 
                src="https://media.discordapp.net/attachments/1384521759188979774/1416150485068419214/server-screenshot-1.png.png?ex=68c5cc6a&is=68c47aea&hm=cf1625d4aa1d706af282d7e16bf7f642afac8e8580ce978d0a720f41dbee6955&=&format=webp&quality=lossless" 
                alt="CrTiers Server Lobby"
                className={styles.screenshotImage}
                onError={(e) => {
                  e.currentTarget.src = 'https://media.discordapp.net/attachments/1384521759188979774/1416150485068419214/server-screenshot-1.png.png?ex=68c5cc6a&is=68c47aea&hm=cf1625d4aa1d706af282d7e16bf7f642afac8e8580ce978d0a720f41dbee6955&=&format=webp&quality=lossless';
                }}
              />
              <p className={styles.screenshotCaption}>Server lobby with ranking displays</p>
            </div>
          </div>
        </section>

        <section className={styles.communitySection}>
          <div className={styles.communityCard}>
            <h2>Join Our Community</h2>
            <p>
              Connect with other competitive players, get updates, and participate in tournaments and events.
            </p>
            <a 
              href="https://discord.gg/97fYggR4" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.discordButton}
            >
              <span className={styles.discordIcon}>🎮</span>
              Join Discord Server
            </a>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>&copy; 2024 CrTiers. All rights reserved.</p>
          <p>Server IP: <span className="gradient-text">crystaltiers.club</span></p>
        </div>
      </footer>
    </div>
  );
}