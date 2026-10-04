import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import DesignSystemPage from './ds/DesignSystemPage.tsx';
import './index.css';

const path = window.location.pathname.replace(/\/$/, '');
// /lisboa: the link sent to businesses, straight into the Europe US flight
const initialView = path === '/lisboa' ? 'europe' : 'home';

createRoot(document.getElementById('root')!).render(path === '/design-system' ? <DesignSystemPage /> : <App initialView={initialView} />);
