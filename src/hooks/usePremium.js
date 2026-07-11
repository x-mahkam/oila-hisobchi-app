import { useApp } from "../context/AppContext.jsx";

export function usePremium() {
  const { showPremModal, setShowPremModal, activatePremium } = useApp();
  return { showPremModal, setShowPremModal, activatePremium };
}
