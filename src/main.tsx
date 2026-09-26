import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The application root element is missing.");
}

const hasBackendConfiguration = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

createRoot(rootElement).render(
  hasBackendConfiguration ? (
    <App />
  ) : (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <section className="max-w-lg" aria-labelledby="configuration-title">
        <p className="eyebrow mb-4">Connection unavailable</p>
        <h1 id="configuration-title" className="text-3xl md:text-4xl">
          Beatmaster DJ is temporarily unavailable
        </h1>
        <p className="mt-4 text-muted-foreground">
          Please refresh in a moment. If this continues, contact Beatmaster DJ.
        </p>
      </section>
    </main>
  ),
);
