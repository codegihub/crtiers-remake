import styles from "./page.module.css";
import MobileNav from "./components/MobileNav";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <h1 className="gradient-text">CrystalTiers</h1>
          </div>
          <div className={styles.navLinks}>
            <a href="../.." className={styles.navLink}>Home</a>
            <a href="../../leaderboards" className={styles.navLink}>Leaderboards</a>
            <a href="../../server" className={styles.navLink}>Server</a>
            <a href="../../more" className={styles.navLink}>More</a>
          </div>
          <MobileNav />
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Welcome to <span className="gradient-text">CrTiers</span>
          </h1>
          <p className={styles.heroDescription}>
            Professional Minecraft player rankings and tier system. Track your progress across multiple game modes.
          </p>
          <div className={styles.heroButtons}>
            <a href="../../leaderboards" className="btn-primary">View Rankings</a>
            <a href="../../server" className={styles.btnSecondary}>Join Server</a>
          </div>
        </section>

        <section className={styles.features}>
          <div className={styles.featureGrid}>
            <div className="card">
              <h3>🏆 Leaderboards</h3>
              <p>View comprehensive rankings across all game modes including Overall, Vanilla, UHC, Pot, and more.</p>
              <a href="../../leaderboards" className={styles.featureLink}>Explore Rankings →</a>
            </div>
            
            <div className="card">
              <h3>🎮 Server</h3>
              <p>Connect to our Minecraft server and start climbing the ranks. IP: crystaltiers.club</p>
              <a href="../../server" className={styles.featureLink}>Server Info →</a>
            </div>
            
            <div className="card">
              <h3>📊 Tier System</h3>
              <p>Advanced tier-based ranking from F to S+ with region-based categorization and detailed statistics.</p>
              <a href="../../more" className={styles.featureLink}>Learn More →</a>
            </div>
          </div>
        </section>

        <section className={styles.stats}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <h3>2+</h3>
              <p>Active Players</p>
            </div>
            <div className={styles.statItem}>
              <h3>8</h3>
              <p>Game Modes</p>
            </div>
            <div className={styles.statItem}>
              <h3>24/7</h3>
              <p>Server Uptime</p>
            </div>
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
