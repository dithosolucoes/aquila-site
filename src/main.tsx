import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import DesignSystemPage from './ds/DesignSystemPage.tsx';
import './index.css';

const isDesignSystem = window.location.pathname.replace(/\/$/, '') === '/design-system';

createRoot(document.getElementById('root')!).render(isDesignSystem ? <DesignSystemPage /> : <App />);
