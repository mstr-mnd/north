import { useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import SettingsDialog from "./components/SettingsDialog.jsx";

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="page">
      <header className="header">
        <a className="brand" href="/" aria-label="North — главная">
          <img className="brand-icon" src="/north-icon.svg" alt="" />
          <span className="brand-name">North</span>
        </a>

        <button
          className="gear-button"
          type="button"
          aria-label="Настройки профиля"
          aria-haspopup="dialog"
          aria-expanded={isSettingsOpen}
          onClick={() => setIsSettingsOpen(true)}
        >
          <SettingsIcon aria-hidden="true" />
        </button>
      </header>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}

export default App;
