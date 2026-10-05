import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import LicenseGate from "./license/LicenseGate.jsx";
import KVKKConsent, { hasKVKKConsent } from "./components/KVKKConsent.jsx";
import UserGuideView from "./views/UserGuideView.jsx";

function Root() {
  const [kvkkOk, setKvkkOk] = useState(hasKVKKConsent());
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (!kvkkOk) {
    return (
      <>
        <KVKKConsent
          onAccept={() => setKvkkOk(true)}
          onViewGuide={() => setShowGuideModal(true)}
        />
        {showGuideModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
            <div className="max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="absolute top-5 right-5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-bold transition-colors"
              >
                ✕ Kapat ve Onay Ekranına Dön
              </button>
              <UserGuideView />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <LicenseGate>
      <App />
    </LicenseGate>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
