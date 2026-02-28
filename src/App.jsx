import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import AppShell from './components/AppShell';
import AppRoutes from './routes';

export default function App() {
  return (
    <BrowserRouter basename="/didactic-engine">
      <AppProvider>
        <ThemeProvider>
          <AppShell>
            <AppRoutes />
          </AppShell>
        </ThemeProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
