import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", fontFamily: "sans-serif", background: "#0f172a", color: "#fff" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Xatolik yuz berdi</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20, maxWidth: 320 }}>
            {this.state.error?.message || "Noma'lum xato"}
          </div>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{ background: "#6366f1", border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Qayta yuklash
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
