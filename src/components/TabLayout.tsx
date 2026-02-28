import { NavLink, Outlet } from 'react-router-dom';
import styles from './TabLayout.module.css';

const tabs = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/adventures', label: 'Adventures', icon: '🗺️' },
  { to: '/map', label: 'Map', icon: '📍' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export function TabLayout() {
  return (
    <div className={styles.layout}>
      <main className={styles.content}>
        <Outlet />
      </main>
      <nav className={styles.tabBar}>
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `${styles.tab} ${isActive ? styles.tabActive : ''}`
            }
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
