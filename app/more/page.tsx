'use client';

import styles from './more.module.css';

export default function More() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <h1 className="gradient-text">CrTiers</h1>
          </div>
          <div className={styles.navLinks}>
            <a href="./" className={styles.navLink}>Home</a>
            <a href="./leaderboards" className={styles.navLink}>Leaderboards</a>
            <a href="./server" className={styles.navLink}>Server</a>
            <a href="./more" className={styles.navLink}>More</a>
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.heroSection}>
          <h1 className={styles.title}>
            Learn More About <span className="gradient-text">CrTiers</span>
          </h1>
          <p className={styles.subtitle}>
            Understanding our tier system, testing process, and competitive structure.
          </p>
        </section>

        <section className={styles.tierSystemSection}>
          <div className={styles.sectionCard}>
            <h2>🏆 How Tiers Work</h2>
            <div className={styles.tierExplanation}>
              <p>
                CrTiers uses a comprehensive tier system to rank players across different game modes. 
                Our system is designed to accurately reflect skill levels and provide clear progression paths.
              </p>
              
              <div className={styles.tierStructure}>
                <h3>Tier Structure</h3>
                <div className={styles.tierGrid}>
                  <div className={styles.tierGroup}>
                    <h4>Standard Game Modes</h4>
                    <div className={styles.tierList}>
                      <div className={`${styles.tierItem} tier-s-plus`}>
                        <span className={styles.tierLabel}>S+</span>
                        <span className={styles.tierScore}>90-100</span>
                      </div>
                      <div className={`${styles.tierItem} tier-s`}>
                        <span className={styles.tierLabel}>S</span>
                        <span className={styles.tierScore}>85-89</span>
                      </div>
                      <div className={`${styles.tierItem} tier-a-plus`}>
                        <span className={styles.tierLabel}>A+</span>
                        <span className={styles.tierScore}>80-84</span>
                      </div>
                      <div className={`${styles.tierItem} tier-a`}>
                        <span className={styles.tierLabel}>A</span>
                        <span className={styles.tierScore}>75-79</span>
                      </div>
                      <div className={`${styles.tierItem} tier-b-plus`}>
                        <span className={styles.tierLabel}>B+</span>
                        <span className={styles.tierScore}>70-74</span>
                      </div>
                      <div className={`${styles.tierItem} tier-b`}>
                        <span className={styles.tierLabel}>B</span>
                        <span className={styles.tierScore}>65-69</span>
                      </div>
                      <div className={`${styles.tierItem} tier-c-plus`}>
                        <span className={styles.tierLabel}>C+</span>
                        <span className={styles.tierScore}>60-64</span>
                      </div>
                      
                    </div>
                  </div>

                  <div className={styles.tierGroup}>
                    <h4>Standard Game Modes</h4>
                    <div className={styles.tierList}>
                    <div className={`${styles.tierItem} tier-c`}>
                        <span className={styles.tierLabel}>C</span>
                        <span className={styles.tierScore}>55-59</span>
                      </div>
                      <div className={`${styles.tierItem} tier-d-plus`}>
                        <span className={styles.tierLabel}>D+</span>
                        <span className={styles.tierScore}>50-54</span>
                      </div>
                      <div className={`${styles.tierItem} tier-d`}>
                        <span className={styles.tierLabel}>D</span>
                        <span className={styles.tierScore}>45-49</span>
                      </div>
                      <div className={`${styles.tierItem} tier-e-plus`}>
                        <span className={styles.tierLabel}>E+</span>
                        <span className={styles.tierScore}>40-44</span>
                      </div>
                      <div className={`${styles.tierItem} tier-e`}>
                        <span className={styles.tierLabel}>E</span>
                        <span className={styles.tierScore}>35-39</span>
                      </div>
                      <div className={`${styles.tierItem} tier-f-plus`}>
                        <span className={styles.tierLabel}>F+</span>
                        <span className={styles.tierScore}>10-34</span>
                      </div>
                      <div className={`${styles.tierItem} tier-f`}>
                        <span className={styles.tierLabel}>F</span>
                        <span className={styles.tierScore}>0-9</span>
                      </div>
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.testingSection}>
          <div className={styles.sectionCard}>
            <h2>📝 Getting Tested</h2>
            <div className={styles.testingProcess}>
              <p>
                Ready to prove your skills and earn your tier? Here's how our testing process works:
              </p>
              
              <div className={styles.processSteps}>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>1</div>
                  <div className={styles.stepContent}>
                    <h3>Join Our Discord</h3>
                    <p>Connect to our Discord server to access the testing system.</p>
                    <a 
                      href="https://discord.gg/97fYggR4" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.discordLink}
                    >
                      Join Discord →
                    </a>
                  </div>
                </div>

                <div className={styles.step}>
                  <div className={styles.stepNumber}>2</div>
                  <div className={styles.stepContent}>
                    <h3>Request a Test</h3>
                    <p>Navigate to #request-test and open a ticket for your desired gamemode.</p>
                  </div>
                </div>

                <div className={styles.step}>
                  <div className={styles.stepNumber}>3</div>
                  <div className={styles.stepContent}>
                    <h3>Wait for Assignment</h3>
                    <p>A tier tester will be assigned to evaluate your skills when available.</p>
                  </div>
                </div>

                <div className={styles.step}>
                  <div className={styles.stepNumber}>4</div>
                  <div className={styles.stepContent}>
                    <h3>Get Your Tier</h3>
                    <p>Complete your test and receive your official tier ranking!</p>
                  </div>
                </div>
              </div>

              <div className={styles.importantNotes}>
                <h3>Important Notes</h3>
                <div className={styles.notesList}>
                  <div className={styles.noteItem}>
                    <span className={styles.noteIcon}>⏰</span>
                    <p><strong>Cooldown Period:</strong> Each gamemode has a 1 week cooldown between tests.</p>
                  </div>
                  <div className={styles.noteItem}>
                    <span className={styles.noteIcon}>📋</span>
                    <p><strong>Ticket Expiry:</strong> Tickets automatically close after 2 days if no testing occurs.</p>
                  </div>
                  <div className={styles.noteItem}>
                    <span className={styles.noteIcon}>🎮</span>
                    <p><strong>Available Modes:</strong> Vanilla, UHC, Pot, NethPot, SMP, Sword, Axe, Mace</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.gameModeSection}>
          <div className={styles.sectionCard}>
            <h2>🎮 Game Modes Explained</h2>
            <div className={styles.gameModeGrid}>
              <div className={styles.gameModeCard}>
                <div className={styles.gameModeIcon}>🎇</div>
                <h3>Vanilla</h3>
                <p>Classic Minecraft PvP with no modifications - pure skill-based combat.</p>
              </div>
              
              <div className={styles.gameModeCard}>
                <div className={styles.gameModeIcon}>💖</div>
                <h3>UHC</h3>
                <p>Ultra Hardcore mode with no natural regeneration - strategic gameplay required.</p>
              </div>
              
              <div className={styles.gameModeCard}>
                <div className={styles.gameModeIcon}>🧪</div>
                <h3>Pot</h3>
                <p>Potion-based PvP with splash potions for healing and damage.</p>
              </div>
              
              <div className={styles.gameModeCard}>
                <div className={styles.gameModeIcon}>🔮</div>
                <h3>NethPot</h3>
                <p>Our signature gamemode combining Nether combat with potion mechanics.</p>
              </div>
              
              <div className={styles.gameModeCard}>
                <div className={styles.gameModeIcon}>🧿</div>
                <h3>SMP</h3>
                <p>Survival Multiplayer skills including building, strategy, and resource management.</p>
              </div>
              
              <div className={styles.gameModeCard}>
                <div className={styles.gameModeIcon}>⚔️</div>
                <h3>Sword</h3>
                <p>Specialized sword combat focusing on timing and technique.</p>
              </div>
              
              <div className={styles.gameModeCard}>
                <div className={styles.gameModeIcon}>🪓</div>
                <h3>Axe</h3>
                <p>Axe-based combat with unique mechanics and strategies.</p>
              </div>
              
              <div className={styles.gameModeCard}>
                <div className={styles.gameModeIcon}>🔨</div>
                <h3>Mace</h3>
                <p>The newest addition featuring mace combat mechanics.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.hiddenTierSection}>
          <div className={styles.sectionCard}>
            <h2>🔒 Exclusive Content</h2>
            <div className={styles.hiddenContent}>
              <p>
                Looking for something special? We have additional tier lists for exclusive game modes 
                available to our community members.
              </p>
              <a href="./hidden-tiers" className={styles.hiddenLink}>
                🎯 Access Hidden Tier Lists
              </a>
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