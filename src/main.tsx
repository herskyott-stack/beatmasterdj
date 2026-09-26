import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The application root element is missing.");
}

// The public site must always render. Backend-dependent features (booking,
// admin, leads) handle a missing Supabase config at their own point of use —
// the client in src/integrations/supabase/client.ts is a safe stub that only
// throws when actually called. Never gate the whole app on env vars again: a
// missing key in the production build once blanked the entire site for every
// visitor ("Beatmaster DJ is temporarily unavailable").
createRoot(rootElement).render(<App />);
