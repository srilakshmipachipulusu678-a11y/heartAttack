
import { useState } from "react";
import {
  HeartPulse,
  Activity,
  ShieldCheck,
  ClipboardList,
  History,
  LogOut,
  ArrowRight,
  CheckCircle2,
  UserRound,
  Mail,
  LockKeyhole,
  Stethoscope,
  RefreshCw,
  FileText,
  Lightbulb,
  Droplets,
  Moon,
  Footprints,
  Smile,
  Dumbbell,
  Save,
  CalendarDays
} from "lucide-react";
import "./App.css";

const API_URL = "https://heartattack-pta4.onrender.com/api";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [healthReport, setHealthReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [trackerHistoryLoading, setTrackerHistoryLoading] = useState(false);
  const [trackerLogs, setTrackerLogs] = useState([]);
  const [tracker, setTracker] = useState({
    water_glasses: "",
    sleep_hours: "",
    exercise_minutes: "",
    steps: "",
    mood: "Good",
    symptoms: ""
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

const [health, setHealth] = useState({
  age: "",
  gender: "",
  height_cm: "",
  weight_kg: "",
  resting_heart_rate: "",
  systolic_bp: "",
  diastolic_bp: "",
  cholesterol: "",
  family_history: "Unknown",
  previous_heart_disease: "Unknown",
  previous_stroke: "Unknown",
  diabetes: "No",
  smoking: "No",
  alcohol: "No",
  exercise: "Sometimes"
});

  function updateForm(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  function updateHealth(event) {
    setHealth({
      ...health,
      [event.target.name]: event.target.value
    });
  }

  function updateTracker(event) {
    const { name, value } = event.target;
    setTracker((previous) => ({ ...previous, [name]: value }));
  }

  function clearMessages() {
    setMessage("");
    setError("");
  }

  // Registration and login
  async function handleAuth(event) {
    event.preventDefault();
    clearMessages();
    setLoading(true);

    const endpoint =
      page === "register" ? "/auth/register" : "/auth/login";

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed.");
      }

      if (page === "register") {
        setMessage("Account created successfully! Please log in.");
        setForm({
          name: "",
          email: form.email,
          password: ""
        });
        setPage("login");
      } else {
        setToken(data.token);
        setUser(data.user);
        setActiveTab("dashboard");
        clearMessages();
      }
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Please check that the server is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  // Logout
  function logout() {
    setUser(null);
    setToken("");
    setPage("login");
    setActiveTab("dashboard");
    setAssessments([]);
    setHealthReport(null);
    setTrackerLogs([]);
    setForm({
      name: "",
      email: "",
      password: ""
    });
    clearMessages();
  }

  // Save health assessment to MySQL
  async function handleHealthSubmit(event) {
    event.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/health`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(health)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save assessment.");
      }

     setMessage("Health assessment saved successfully!");
setHealth({
  age: "",
  gender: "",
  height_cm: "",
  weight_kg: "",
  resting_heart_rate: "",
  systolic_bp: "",
  diastolic_bp: "",
  cholesterol: "",
  family_history: "Unknown",
  previous_heart_disease: "Unknown",
  previous_stroke: "Unknown",
  diabetes: "No",
  smoking: "No",
  alcohol: "No",
  exercise: "Sometimes"
});
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check the server."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  // Load saved health assessments
  async function openHistory() {
    setActiveTab("history");
    clearMessages();
    setHistoryLoading(true);

    try {
      const response = await fetch(`${API_URL}/health/history`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load history.");
      }

      setAssessments(data.assessments || []);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check the server."
          : err.message
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  async function openReport() {
    setActiveTab("report");
    clearMessages();
    setReportLoading(true);

    try {
      const response = await fetch(`${API_URL}/health/report/latest`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load health report.");
      setHealthReport(data.report);
    } catch (err) {
      setHealthReport(null);
      setError(err.message === "Failed to fetch"
        ? "Cannot connect to the backend. Check the server."
        : err.message);
    } finally {
      setReportLoading(false);
    }
  }

  async function openTracker() {
    setActiveTab("tracker");
    clearMessages();
    setTrackerHistoryLoading(true);

    try {
      const response = await fetch(`${API_URL}/tracker`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load tracker history.");
      setTrackerLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message === "Failed to fetch"
        ? "Cannot connect to the backend. Check the server."
        : err.message);
    } finally {
      setTrackerHistoryLoading(false);
    }
  }

  async function handleTrackerSubmit(event) {
    event.preventDefault();
    clearMessages();
    setTrackerLoading(true);

    const payload = {
      water_glasses: Number(tracker.water_glasses || 0),
      sleep_hours: Number(tracker.sleep_hours || 0),
      exercise_minutes: Number(tracker.exercise_minutes || 0),
      steps: Number(tracker.steps || 0),
      mood: tracker.mood,
      symptoms: tracker.symptoms.trim()
    };

    if (payload.water_glasses < 0 || payload.water_glasses > 30 ||
        payload.sleep_hours < 0 || payload.sleep_hours > 24 ||
        payload.exercise_minutes < 0 || payload.exercise_minutes > 1440 ||
        payload.steps < 0 || payload.steps > 200000) {
      setError("Please enter realistic, non-negative daily values.");
      setTrackerLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tracker`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save daily tracker.");
      setMessage(data.message || "Daily health log saved successfully!");
      await loadTrackerLogs();
    } catch (err) {
      setError(err.message === "Failed to fetch"
        ? "Cannot connect to the backend. Check the server."
        : err.message);
    } finally {
      setTrackerLoading(false);
    }
  }

  async function loadTrackerLogs() {
    setTrackerHistoryLoading(true);
    try {
      const response = await fetch(`${API_URL}/tracker`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load tracker history.");
      setTrackerLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load tracker history.");
    } finally {
      setTrackerHistoryLoading(false);
    }
  }

  // Login and registration page
  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-left">
          <div className="brand">
            <div className="brand-icon">
              <HeartPulse size={27} />
            </div>
            <span>
              CardioCare <b>Plus</b>
            </span>
          </div>

          <div className="hero-content">
            <span className="eyebrow">
              <ShieldCheck size={16} />
              YOUR HEALTH, YOUR PRIORITY
            </span>

            <h1>
              Take care of your heart. <span>Every day.</span>
            </h1>

            <p>
              Keep your health information organized, complete health
              assessments, and build healthier habits with CardioCare Plus.
            </p>

            <div className="hero-points">
              <div>
                <CheckCircle2 />
                Personal health dashboard
              </div>
              <div>
                <CheckCircle2 />
                Convenient health assessments
              </div>
              <div>
                <CheckCircle2 />
                Your assessment history in one place
              </div>
            </div>
          </div>

          <div className="left-footer">
            <HeartPulse size={17} />
            A healthier tomorrow starts today.
          </div>
        </div>

        <div className="auth-right">
          <div className="mobile-brand brand">
            <div className="brand-icon">
              <HeartPulse size={24} />
            </div>
            <span>
              CardioCare <b>Plus</b>
            </span>
          </div>

          <div className="auth-card">
            <div className="auth-symbol">
              <Stethoscope size={25} />
            </div>

            <h2>
              {page === "register"
                ? "Create your account"
                : "Welcome back"}
            </h2>

            <p className="auth-subtitle">
              {page === "register"
                ? "Join CardioCare Plus and start your health journey."
                : "Sign in to continue to your personal health space."}
            </p>

            {message && (
              <div className="success-message">{message}</div>
            )}

            {error && (
              <div className="error-message">{error}</div>
            )}

            <form onSubmit={handleAuth}>
              {page === "register" && (
                <label className="field">
                  <span>Full name</span>
                  <div className="input-wrap">
                    <UserRound size={18} />
                    <input
                      name="name"
                      value={form.name}
                      onChange={updateForm}
                      placeholder="Enter your full name"
                      required
                      autoComplete="name"
                    />
                  </div>
                </label>
              )}

              <label className="field">
                <span>Email address</span>
                <div className="input-wrap">
                  <Mail size={18} />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={updateForm}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className="field">
                <span>Password</span>
                <div className="input-wrap">
                  <LockKeyhole size={18} />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={updateForm}
                    placeholder="At least 8 characters"
                    required
                    minLength={page === "register" ? 8 : 1}
                    autoComplete={
                      page === "register"
                        ? "new-password"
                        : "current-password"
                    }
                  />
                </div>
              </label>

              <button
                className="primary-button auth-button"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : page === "register"
                    ? "Create account"
                    : "Sign in"}

                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="auth-switch">
              {page === "register"
                ? "Already have an account?"
                : "New to CardioCare Plus?"}

              <button
                type="button"
                onClick={() => {
                  setPage(
                    page === "register" ? "login" : "register"
                  );
                  clearMessages();
                }}
              >
                {page === "register" ? "Sign in" : "Create account"}
              </button>
            </div>

            <div className="privacy-note">
              <ShieldCheck size={16} />
              Your account is protected with password hashing.
            </div>
          </div>

          <p className="medical-note">
            CardioCare Plus is an informational tool and does not replace
            professional medical advice.
          </p>
        </div>
      </div>
    );
  }

  // Main dashboard and application pages
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand sidebar-brand">
          <div className="brand-icon">
            <HeartPulse size={25} />
          </div>
          <span>
            CardioCare <b>Plus</b>
          </span>
        </div>

        <div className="side-label">WORKSPACE</div>

        <button
          className={`nav-item ${
            activeTab === "dashboard" ? "active" : ""
          }`}
          onClick={() => {
            setActiveTab("dashboard");
            clearMessages();
          }}
        >
          <Activity size={19} />
          Dashboard
        </button>

        <button
          className={`nav-item ${
            activeTab === "assessment" ? "active" : ""
          }`}
          onClick={() => {
            setActiveTab("assessment");
            clearMessages();
          }}
        >
          <ClipboardList size={19} />
          Health assessment
        </button>

        <button
          className={`nav-item ${activeTab === "tracker" ? "active" : ""}`}
          onClick={openTracker}
        >
          <Activity size={19} />
          Daily health tracker
        </button>

        <button
          className={`nav-item ${
            activeTab === "history" ? "active" : ""
          }`}
          onClick={openHistory}
        >
          <History size={19} />
          Health history
        </button>

        <button
          className={`nav-item ${activeTab === "report" ? "active" : ""}`}
          onClick={openReport}
        >
          <FileText size={19} />
          Smart health report
        </button>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <HeartPulse size={22} />
            <strong>Small steps matter.</strong>
            <p>Build healthy habits one day at a time.</p>
          </div>

          <button
            className="nav-item logout-button"
            onClick={logout}
          >
            <LogOut size={19} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace / <b>
              {activeTab === "dashboard"
                ? "Dashboard"
                : activeTab === "assessment"
                  ? "Health assessment"
                  : activeTab === "tracker"
                    ? "Daily health tracker"
                    : activeTab === "report"
                      ? "Smart health report"
                      : "Health history"}
            </b>
          </div>

          <div className="profile">
            <div className="avatar">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <strong>{user.name}</strong>
              <span>Personal account</span>
            </div>
          </div>
        </header>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <section className="content">
            <div className="welcome-banner">
              <div>
                <span className="eyebrow light">
                  YOUR PERSONAL HEALTH SPACE
                </span>

                <h1>
                  Hello, {user.name?.split(" ")[0]}! <span>♥</span>
                </h1>

                <p>
                  Make time for your health today. Every healthy choice
                  counts.
                </p>

                <button
                  className="white-button"
                  onClick={() => {
                    setActiveTab("assessment");
                    clearMessages();
                  }}
                >
                  Start assessment <ArrowRight size={17} />
                </button>
              </div>

              <div className="banner-icon">
                <HeartPulse size={100} />
              </div>
            </div>

            <div className="section-heading">
              <div>
                <h2>Your health workspace</h2>
                <p>
                  Tools to help you keep track of your health information.
                </p>
              </div>
            </div>

            <div className="dashboard-grid">
              <button
                className="feature-card"
                onClick={() => {
                  setActiveTab("assessment");
                  clearMessages();
                }}
              >
                <div className="feature-icon mint">
                  <ClipboardList size={23} />
                </div>
                <h3>Health assessment</h3>
                <p>Enter your health information in a simple form.</p>
                <span>
                  Open assessment <ArrowRight size={16} />
                </span>
              </button>

              <button className="feature-card" onClick={openTracker}>
                <div className="feature-icon mint">
                  <Activity size={23} />
                </div>
                <h3>Daily health tracker</h3>
                <p>Record water, sleep, exercise, steps and daily mood.</p>
                <span>Track today <ArrowRight size={16} /></span>
              </button>

              <button
                className="feature-card"
                onClick={openHistory}
              >
                <div className="feature-icon lavender">
                  <History size={23} />
                </div>
                <h3>Health history</h3>
                <p>View your previously saved assessments.</p>
                <span>
                  View history <ArrowRight size={16} />
                </span>
              </button>

              <button className="feature-card" onClick={openReport}>
                <div className="feature-icon peach">
                  <FileText size={23} />
                </div>
                <h3>Smart health report</h3>
                <p>View observations and practical recommendations from your latest assessment.</p>
                <span>Generate report <ArrowRight size={16} /></span>
              </button>

              <div className="feature-card info-card">
                <div className="feature-icon peach">
                  <ShieldCheck size={23} />
                </div>
                <h3>Health information</h3>
                <p>
                  Assessment information is not a medical diagnosis.
                  Contact a healthcare professional about health concerns.
                </p>
              </div>
            </div>

            <div className="notice">
              <ShieldCheck size={21} />
              <div>
                <strong>A reminder about your health</strong>
                <p>
                  This website is for general information only. It cannot
                  diagnose heart disease or predict your individual stroke risk.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Daily health tracker */}
        {activeTab === "tracker" && (
          <section className="content">
            <div className="section-heading page-heading">
              <div>
                <span className="eyebrow">DAILY WELLNESS</span>
                <h1>Daily health tracker</h1>
                <p>Record your everyday habits and review your previous daily logs.</p>
              </div>
              <button className="secondary-button" type="button" onClick={loadTrackerLogs} disabled={trackerHistoryLoading}>
                <RefreshCw size={16} /> Refresh history
              </button>
            </div>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <form className="health-form" onSubmit={handleTrackerSubmit}>
              <h3><CalendarDays size={20} /> Today's wellness log</h3>
              <div className="form-grid">
                <label className="field">
                  <span><Droplets size={16} /> Water (glasses)</span>
                  <input type="number" name="water_glasses" min="0" max="30" step="1" value={tracker.water_glasses} onChange={updateTracker} placeholder="e.g. 8" />
                </label>
                <label className="field">
                  <span><Moon size={16} /> Sleep (hours)</span>
                  <input type="number" name="sleep_hours" min="0" max="24" step="0.5" value={tracker.sleep_hours} onChange={updateTracker} placeholder="e.g. 7.5" />
                </label>
                <label className="field">
                  <span><Dumbbell size={16} /> Exercise (minutes)</span>
                  <input type="number" name="exercise_minutes" min="0" max="1440" value={tracker.exercise_minutes} onChange={updateTracker} placeholder="e.g. 30" />
                </label>
                <label className="field">
                  <span><Footprints size={16} /> Steps</span>
                  <input type="number" name="steps" min="0" max="200000" value={tracker.steps} onChange={updateTracker} placeholder="e.g. 5000" />
                </label>
                <label className="field">
                  <span><Smile size={16} /> Today's mood</span>
                  <select name="mood" value={tracker.mood} onChange={updateTracker}>
                    <option value="Great">Great</option>
                    <option value="Good">Good</option>
                    <option value="Okay">Okay</option>
                    <option value="Low">Low</option>
                    <option value="Stressed">Stressed</option>
                  </select>
                </label>
                <label className="field">
                  <span>Symptoms / notes (optional)</span>
                  <input type="text" name="symptoms" value={tracker.symptoms} onChange={updateTracker} maxLength="500" placeholder="Add any notes for today" />
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={() => setTracker({ water_glasses: "", sleep_hours: "", exercise_minutes: "", steps: "", mood: "Good", symptoms: "" })}>
                  Reset tracker
                </button>
                <button className="primary-button" type="submit" disabled={trackerLoading}>
                  <Save size={17} /> {trackerLoading ? "Saving..." : "Save today's log"}
                </button>
              </div>
              <p className="form-footnote">Your log is saved to your account. Enter only values you have measured or reasonably estimated.</p>
            </form>

            <div className="section-heading page-heading" style={{ marginTop: "28px" }}>
              <div>
                <h2>Previous daily logs</h2>
                <p>Your saved daily wellness entries.</p>
              </div>
            </div>

            {trackerHistoryLoading ? (
              <div className="empty-state"><p>Loading daily logs...</p></div>
            ) : trackerLogs.length === 0 ? (
              <div className="empty-state"><div className="empty-icon"><Activity size={30} /></div><h2>No daily logs yet</h2><p>Save your first daily health log to see it here.</p></div>
            ) : (
              <div className="history-list">
                {trackerLogs.map((item) => (
                  <article className="feature-card tracker-history-card" key={item.id}>
                    <h3><CalendarDays size={18} /> {item.log_date ? new Date(`${String(item.log_date).slice(0, 10)}T00:00:00`).toLocaleDateString() : "Daily log"}</h3>
                    <div className="tracker-history-grid">
                      <p><Droplets size={16} /> Water: {item.water_glasses} glasses</p>
                      <p><Moon size={16} /> Sleep: {item.sleep_hours} hours</p>
                      <p><Dumbbell size={16} /> Exercise: {item.exercise_minutes} minutes</p>
                      <p><Footprints size={16} /> Steps: {item.steps}</p>
                      <p><Smile size={16} /> Mood: {item.mood || "Not entered"}</p>
                    </div>
                    {item.symptoms && <p>Notes: {item.symptoms}</p>}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Health assessment */}
        {activeTab === "assessment" && (
          <section className="content">
            <div className="section-heading page-heading">
              <div>
                <span className="eyebrow">HEALTH INFORMATION</span>
                <h1>Health assessment</h1>
                <p>
                  Enter your details carefully. This information is not a diagnosis.
                </p>
              </div>
            </div>

            {message && (
              <div className="success-message">{message}</div>
            )}

            {error && (
              <div className="error-message">{error}</div>
            )}

            <form
              className="health-form"
              onSubmit={handleHealthSubmit}
            >
              <h3>
                <UserRound size={20} />
                Personal information
              </h3>

              <div className="form-grid">
                <label className="field">
                  <span>Age</span>
                  <input
                    type="number"
                    name="age"
                    min="1"
                    max="120"
                    value={health.age}
                    onChange={updateHealth}
                    placeholder="Enter age"
                    required
                  />
                </label>

                <label className="field">
                  <span>Gender (optional)</span>
                  <select
                    name="gender"
                    value={health.gender}
                    onChange={updateHealth}
                  >
                    <option value="">Prefer not to say</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label className="field">
  <span>Height (cm)</span>
  <input type="number" name="height_cm" min="50" max="250" value={health.height_cm} onChange={updateHealth} placeholder="e.g. 165" />
</label>

<label className="field">
  <span>Weight (kg)</span>
  <input type="number" name="weight_kg" min="10" max="300" value={health.weight_kg} onChange={updateHealth} placeholder="e.g. 60" />
</label>

<label className="field">
  <span>Resting heart rate (BPM)</span>
  <input type="number" name="resting_heart_rate" min="30" max="220" value={health.resting_heart_rate} onChange={updateHealth} placeholder="If known" />
</label>
              </div>

              <h3>
                <Activity size={20} />
                Health measurements
              </h3>

              <div className="form-grid">
                <label className="field">
                  <span>Systolic blood pressure (mmHg)</span>
                  <input
                    type="number"
                    name="systolic_bp"
                    min="50"
                    max="300"
                    value={health.systolic_bp}
                    onChange={updateHealth}
                    placeholder="e.g. 120"
                  />
                </label>

                <label className="field">
                  <span>Diastolic blood pressure (mmHg)</span>
                  <input
                    type="number"
                    name="diastolic_bp"
                    min="30"
                    max="200"
                    value={health.diastolic_bp}
                    onChange={updateHealth}
                    placeholder="e.g. 80"
                  />
                </label>

                <label className="field">
                  <span>Total cholesterol (mg/dL)</span>
                  <input
                    type="number"
                    name="cholesterol"
                    min="50"
                    max="700"
                    value={health.cholesterol}
                    onChange={updateHealth}
                    placeholder="If known"
                  />
                </label>
              </div>

              <h3>
                <HeartPulse size={20} />
                Lifestyle information
              </h3>

              <div className="form-grid">
                <label className="field">
                  <span>Family history of heart disease?</span>
                  <select name="family_history" value={health.family_history} onChange={updateHealth}>
                    <option value="Unknown">Not sure</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>

                <label className="field">
                  <span>Previous heart disease?</span>
                  <select name="previous_heart_disease" value={health.previous_heart_disease} onChange={updateHealth}>
                    <option value="Unknown">Not sure</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>

                <label className="field">
                  <span>Previous stroke?</span>
                  <select name="previous_stroke" value={health.previous_stroke} onChange={updateHealth}>
                    <option value="Unknown">Not sure</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>

                <label className="field">
                  <span>Have you been diagnosed with diabetes?</span>
                  <select
                    name="diabetes"
                    value={health.diabetes}
                    onChange={updateHealth}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="Unknown">Not sure</option>
                  </select>
                </label>

                <label className="field">
                  <span>Do you currently smoke?</span>
                  <select
                    name="smoking"
                    value={health.smoking}
                    onChange={updateHealth}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="Unknown">Not sure</option>
                  </select>
                </label>

                <label className="field">
                  <span>Do you consume alcohol?</span>
                  <select
                    name="alcohol"
                    value={health.alcohol}
                    onChange={updateHealth}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="Unknown">Not sure</option>
                  </select>
                </label>

                <label className="field">
                  <span>How often do you exercise?</span>
                  <select
                    name="exercise"
                    value={health.exercise}
                    onChange={updateHealth}
                  >
                    <option value="Regularly">Regularly</option>
                    <option value="Sometimes">Sometimes</option>
                    <option value="Rarely">Rarely</option>
                    <option value="Never">Never</option>
                  </select>
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setHealth({
                      age: "",
                      gender: "",
                      height_cm: "",
                      weight_kg: "",
                      resting_heart_rate: "",
                      systolic_bp: "",
                      diastolic_bp: "",
                      cholesterol: "",
                      family_history: "Unknown",
                      previous_heart_disease: "Unknown",
                      previous_stroke: "Unknown",
                      diabetes: "No",
                      smoking: "No",
                      alcohol: "No",
                      exercise: "Sometimes"
                    });
                    clearMessages();
                  }}
                >
                  Reset form
                </button>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save assessment"}
                  {!loading && <ArrowRight size={17} />}
                </button>
              </div>

              <p className="form-footnote">
                Your information will be saved to your account. This form
                records health information but does not calculate a medical
                risk score or provide a diagnosis.
              </p>
            </form>
          </section>
        )}

        {/* Smart health report */}
        {activeTab === "report" && (
          <section className="content">
            <div className="section-heading page-heading">
              <div>
                <span className="eyebrow">PERSONALIZED INSIGHTS</span>
                <h1>Smart health report</h1>
                <p>Observations and general guidance based on your latest saved assessment.</p>
              </div>
              <button className="secondary-button" onClick={openReport} disabled={reportLoading}>
                <RefreshCw size={16} /> Refresh report
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {reportLoading ? (
              <div className="empty-state"><p>Preparing your report...</p></div>
            ) : healthReport ? (
              <>
                <div className="report-intro">
                  <div className="report-intro-icon"><FileText size={25} /></div>
                  <div>
                    <strong>Your latest health summary</strong>
                    <p>{healthReport.summary}</p>
                    <small>Assessment #{healthReport.assessmentId} · {new Date(healthReport.createdAt).toLocaleString()}</small>
                  </div>
                </div>

               
<div className="report-metrics">
  <div className="report-metric">
    <span>BMI</span>
    <strong>{healthReport.metrics.bmi ?? "Not provided"}</strong>
    <small>Calculated from height and weight</small>
  </div>

  <div className="report-metric">
    <span>Resting heart rate</span>
    <strong>{healthReport.metrics.heartRate ?? "Not provided"}</strong>
    <small>Latest recorded reading</small>
  </div>

  <div className="report-metric">
    <span>Blood pressure</span>
    <strong>{healthReport.metrics.bloodPressure}</strong>
    <small>{healthReport.metrics.bloodPressureStatus}</small>
  </div>

  <div className="report-metric">
    <span>Total cholesterol</span>
    <strong>{healthReport.metrics.cholesterol}</strong>
    <small>{healthReport.metrics.cholesterolStatus}</small>
  </div>

  <div className="report-metric">
    <span>Exercise</span>
    <strong>{healthReport.metrics.exercise}</strong>
    <small>Latest recorded habit</small>
  </div>

  <div className="report-metric">
    <span>Diabetes</span>
    <strong>{healthReport.metrics.diabetes}</strong>
    <small>Self-reported information</small>
  </div>
</div>

                <div className="report-columns">
                  <div className="report-panel">
                    <h2><Activity size={20} /> Health observations</h2>
                    <div className="observation-list">
                      {healthReport.observations.map((item, index) => (
                        <article className={`observation ${item.level}`} key={`${item.title}-${index}`}>
                          <strong>{item.title}</strong>
                          <p>{item.detail}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                  <div className="report-panel">
                    <h2><Lightbulb size={20} /> Recommended next steps</h2>
                    <ul className="recommendation-list">
                      {healthReport.recommendations.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  </div>
                </div>
                
<div className="report-columns">
  <div className="report-panel">
    <h2>🛡️ Personalized Precautions</h2>
    <ul className="recommendation-list">
      {(healthReport.precautions || []).map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>

  <div className="report-panel">
    <h2>🏃 Recommended Exercises</h2>
    <ul className="recommendation-list">
      {(healthReport.exerciseRecommendations || []).map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
</div>

                <div className="notice report-disclaimer">
                  <ShieldCheck size={21} />
                  <div><strong>Important health note</strong><p>This is an educational summary based only on the information entered. It does not diagnose a condition or replace a clinician's advice. Seek professional care for concerns or persistent abnormal readings.</p></div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon"><FileText size={32} /></div>
                <h2>Complete an assessment first</h2>
                <p>Your smart report will appear here after you save your first health assessment.</p>
                <button className="primary-button" onClick={() => { setActiveTab("assessment"); clearMessages(); }}>Start assessment <ArrowRight size={17} /></button>
              </div>
            )}
          </section>
        )}

        {/* Health history */}
        {activeTab === "history" && (
          <section className="content">
            <div className="section-heading page-heading">
              <div>
                <span className="eyebrow">YOUR RECORDS</span>
                <h1>Health history</h1>
                <p>Your saved health assessments.</p>
              </div>

              <button
                className="secondary-button"
                onClick={openHistory}
                disabled={historyLoading}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            {error && (
              <div className="error-message">{error}</div>
            )}

            {historyLoading ? (
              <div className="empty-state">
                <p>Loading your health history...</p>
              </div>
            ) : assessments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <History size={32} />
                </div>
                <h2>No assessment history yet</h2>
                <p>
                  Complete and save a health assessment to see it here.
                </p>
                <button
                  className="primary-button"
                  onClick={() => {
                    setActiveTab("assessment");
                    clearMessages();
                  }}
                >
                  Start assessment <ArrowRight size={17} />
                </button>
              </div>
            ) : (
              <div className="history-list">
                {assessments.map((item) => (
                  <div className="feature-card" key={item.id}>
                    <h3>
                      <ClipboardList size={18} />
                      Assessment #{item.id}
                    </h3>

                    <p>Age: {item.age}</p>
                    <p>Gender: {item.gender || "Not entered"}</p>
                    <p>Height: {item.height_cm ?? "Not entered"} cm</p>
<p>Weight: {item.weight_kg ?? "Not entered"} kg</p>
<p>
  Resting heart rate: {item.resting_heart_rate ?? "Not entered"} BPM
</p>
<p>Family history: {item.family_history || "Unknown"}</p>
<p>
  Previous heart disease: {item.previous_heart_disease || "Unknown"}
</p>
<p>Previous stroke: {item.previous_stroke || "Unknown"}</p>

                    <p>
                      Blood pressure:{" "}
                      {item.systolic_bp ?? "Not entered"} /{" "}
                      {item.diastolic_bp ?? "Not entered"} mmHg
                    </p>

                    <p>
                      Cholesterol: {item.cholesterol ?? "Not entered"} mg/dL
                    </p>

                    <p>Diabetes: {item.diabetes || "Not entered"}</p>
                    <p>Smoking: {item.smoking || "Not entered"}</p>
                    <p>Alcohol: {item.alcohol || "Not entered"}</p>
                    <p>Exercise: {item.exercise || "Not entered"}</p>

                    <p>
                      Saved:{" "}
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : "Date unavailable"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <footer className="main-footer">
          <span>© 2026 CardioCare Plus</span>
          <span>
            For informational purposes only · Not a medical diagnosis
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
