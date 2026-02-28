import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Settings,
  User,
  Bell,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Flame,
  Moon,
  Sun,
  Shield,
  Smartphone,
  Globe,
  Palette,
  Volume2,
  Eye,
  Lock,
  Download,
  Wifi,
  WifiOff,
  Heart,
  Footprints,
  Brain,
  Dumbbell,
  BookOpen,
  Music,
  DollarSign,
  Clock,
  Calendar,
  Star,
  Zap,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  MoreHorizontal,
  Edit3,
  Camera,
  Mail,
  MapPin,
  Briefcase,
  Award,
  CheckCircle2,
  Circle,
  X,
} from "lucide-react";

// ---- Animated Number Counter ----
const AnimatedNumber = ({ value, duration = 1200, prefix = "", suffix = "" }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * end));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };

    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
};

// ---- Glass Card Component ----
const GlassCard = ({ children, className = "", onClick, style = {} }) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden ${className}`}
    style={{
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderRadius: "24px",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      ...style,
    }}
  >
    {children}
  </div>
);

// ---- Toggle Switch ----
const Toggle = ({ enabled, onChange, color = "from-indigo-500 to-violet-500" }) => (
  <button
    onClick={() => onChange(!enabled)}
    style={{
      width: 52,
      height: 32,
      borderRadius: 16,
      padding: 2,
      background: enabled
        ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
        : "rgba(255,255,255,0.1)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      border: "none",
      cursor: "pointer",
      position: "relative",
    }}
  >
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        background: "#fff",
        transform: enabled ? "translateX(20px)" : "translateX(0px)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}
    />
  </button>
);

// ---- Progress Ring ----
const ProgressRing = ({ progress, size = 80, stroke = 6, color = "#8b5cf6" }) => {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (progress / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
      />
    </svg>
  );
};

// ---- Mini Bar Chart ----
const MiniBarChart = ({ data, color = "#8b5cf6", height = 48 }) => {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            background: i === data.length - 1
              ? `linear-gradient(to top, ${color}, ${color}dd)`
              : "rgba(255,255,255,0.08)",
            borderRadius: 4,
            minHeight: 4,
            transition: "height 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            transitionDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
};

// ---- Sparkline ----
const Sparkline = ({ data, color = "#8b5cf6", width = 120, height = 40 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`)
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#spark-${color})`}
      />
    </svg>
  );
};

// ===== PAGES =====

// ---- Dashboard Page ----
const DashboardPage = () => {
  const stats = [
    {
      label: "Sleep Score",
      value: 78,
      suffix: "%",
      icon: Moon,
      trend: "+5%",
      up: true,
      color: "#818cf8",
      sparkData: [55, 62, 58, 70, 65, 72, 78],
    },
    {
      label: "Steps Today",
      value: 7842,
      icon: Footprints,
      trend: "+12%",
      up: true,
      color: "#a78bfa",
      sparkData: [4200, 6100, 5500, 7200, 6800, 8100, 7842],
    },
    {
      label: "Focus Hours",
      value: 6.2,
      suffix: "h",
      icon: Brain,
      trend: "-8%",
      up: false,
      color: "#c084fc",
      sparkData: [7.5, 6.8, 7.2, 5.9, 6.5, 5.8, 6.2],
    },
    {
      label: "Savings Rate",
      value: 22,
      suffix: "%",
      icon: DollarSign,
      trend: "+3%",
      up: true,
      color: "#6366f1",
      sparkData: [15, 17, 18, 19, 20, 21, 22],
    },
  ];

  const goals = [
    { label: "Resistance Band Sessions", done: 2, total: 3, icon: Dumbbell, color: "#8b5cf6" },
    { label: "Pages Read", done: 45, total: 60, icon: BookOpen, color: "#6366f1" },
    { label: "Band Practice", done: 1, total: 2, icon: Music, color: "#a78bfa" },
    { label: "Budget Review", done: 1, total: 1, icon: DollarSign, color: "#c084fc" },
  ];

  const weeklyData = [65, 72, 58, 80, 75, 90, 68];
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div style={{ padding: "0 20px 120px", maxWidth: 600, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ padding: "60px 0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
            Saturday, Feb 28
          </p>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            Hey, Stefan
          </h1>
        </div>
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={20} color="rgba(255,255,255,0.6)" />
          </div>
          <div
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 10,
              height: 10,
              borderRadius: 5,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "2px solid #0f172a",
            }}
          />
        </div>
      </div>

      {/* Overall Progress */}
      <GlassCard className="mb-4" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ position: "relative" }}>
            <ProgressRing progress={68} size={90} stroke={7} />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <span style={{ color: "#fff", fontSize: 22, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>68</span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>%</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 600, margin: "0 0 4px", fontFamily: "'Outfit', sans-serif" }}>
              Weekly Progress
            </h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 12px", fontFamily: "'DM Sans', sans-serif" }}>
              You're on track! Keep the momentum going.
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              {["Sleep", "Fitness", "Finance"].map((tag, i) => (
                <span
                  key={tag}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 500,
                    background: "rgba(139,92,246,0.15)",
                    color: "#a78bfa",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Stat Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <GlassCard key={i} style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: `${s.color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} color={s.color} />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    padding: "3px 8px",
                    borderRadius: 8,
                    background: s.up ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  }}
                >
                  {s.up ? (
                    <ArrowUpRight size={12} color="#22c55e" />
                  ) : (
                    <ArrowDownRight size={12} color="#ef4444" />
                  )}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: s.up ? "#22c55e" : "#ef4444",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {s.trend}
                  </span>
                </div>
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif" }}>
                {s.label}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <span style={{ color: "#fff", fontSize: 24, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                  <AnimatedNumber value={s.value} suffix={s.suffix || ""} />
                </span>
                <Sparkline data={s.sparkData} color={s.color} width={64} height={28} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Weekly Activity */}
      <GlassCard style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 600, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            Weekly Activity
          </h3>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>This week</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
          {weeklyData.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: "100%",
                  height: `${(v / 100) * 60}px`,
                  borderRadius: 8,
                  background:
                    i === new Date().getDay() - 1
                      ? "linear-gradient(to top, #6366f1, #8b5cf6)"
                      : "rgba(255,255,255,0.06)",
                  transition: "height 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  transitionDelay: `${i * 80}ms`,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  color: i === new Date().getDay() - 1 ? "#a78bfa" : "rgba(255,255,255,0.25)",
                  fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {weekDays[i]}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Goals */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 600, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
          This Week's Goals
        </h3>
        <span style={{ color: "#8b5cf6", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>See all</span>
      </div>

      {goals.map((g, i) => {
        const Icon = g.icon;
        const pct = Math.round((g.done / g.total) * 100);
        return (
          <GlassCard key={i} style={{ padding: 16, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: `${g.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={20} color={g.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                    {g.label}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                    {g.done}/{g.total}
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 6,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      borderRadius: 3,
                      background: `linear-gradient(90deg, ${g.color}, ${g.color}cc)`,
                      transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                      transitionDelay: `${i * 100}ms`,
                    }}
                  />
                </div>
              </div>
              {pct === 100 && <CheckCircle2 size={18} color="#22c55e" />}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};

// ---- Settings Page ----
const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    biometric: false,
    offlineMode: true,
    sounds: false,
    autoSync: true,
    sleepReminder: true,
    workoutReminder: true,
    budgetAlerts: true,
    readingGoal: false,
  });

  const toggle = (key) => setSettings((p) => ({ ...p, [key]: !p[key] }));

  const sections = [
    {
      title: "General",
      items: [
        { key: "notifications", label: "Push Notifications", sub: "Daily insights & reminders", icon: Bell },
        { key: "darkMode", label: "Dark Mode", sub: "Always on", icon: Moon },
        { key: "sounds", label: "Sound Effects", sub: "Haptic feedback & sounds", icon: Volume2 },
        { key: "autoSync", label: "Auto Sync", sub: "Sync data across devices", icon: Globe },
      ],
    },
    {
      title: "Privacy & Security",
      items: [
        { key: "biometric", label: "Face ID / Fingerprint", sub: "Biometric authentication", icon: Shield },
        { key: "offlineMode", label: "Offline Mode", sub: "Cache data for offline use", icon: Wifi },
      ],
    },
    {
      title: "Reminders",
      items: [
        { key: "sleepReminder", label: "Sleep Wind-Down", sub: "Remind at 10:30 PM", icon: Moon },
        { key: "workoutReminder", label: "Workout Reminder", sub: "Mon, Wed, Fri at 7 AM", icon: Dumbbell },
        { key: "budgetAlerts", label: "Budget Alerts", sub: "When spending exceeds plan", icon: DollarSign },
        { key: "readingGoal", label: "Reading Goal", sub: "15 min daily reminder", icon: BookOpen },
      ],
    },
  ];

  return (
    <div style={{ padding: "0 20px 120px", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ padding: "60px 0 24px" }}>
        <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
          Settings
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "4px 0 0", fontFamily: "'DM Sans', sans-serif" }}>
          Customize your experience
        </p>
      </div>

      {sections.map((section, si) => (
        <div key={si} style={{ marginBottom: 24 }}>
          <p
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 10,
              paddingLeft: 4,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {section.title}
          </p>
          <GlassCard style={{ overflow: "hidden" }}>
            {section.items.map((item, ii) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 18px",
                    borderBottom:
                      ii < section.items.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(139,92,246,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={18} color="#8b5cf6" />
                    </div>
                    <div>
                      <p style={{ color: "#fff", fontSize: 14, fontWeight: 500, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                        {item.label}
                      </p>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: "2px 0 0", fontFamily: "'DM Sans', sans-serif" }}>
                        {item.sub}
                      </p>
                    </div>
                  </div>
                  <Toggle enabled={settings[item.key]} onChange={() => toggle(item.key)} />
                </div>
              );
            })}
          </GlassCard>
        </div>
      ))}

      {/* Install App Button */}
      <GlassCard style={{ padding: 18 }}>
        <button
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: 16,
            border: "none",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 4px 24px rgba(99,102,241,0.3)",
          }}
        >
          <Download size={18} />
          Install App to Home Screen
        </button>
      </GlassCard>

      {/* Version Info */}
      <p
        style={{
          textAlign: "center",
          color: "rgba(255,255,255,0.15)",
          fontSize: 12,
          marginTop: 24,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        LifeOS v1.0.0 • Built with ❤️ for Stefan
      </p>
    </div>
  );
};

// ---- Profile Page ----
const ProfilePage = () => {
  const achievements = [
    { label: "7-Day Streak", icon: Flame, color: "#f59e0b", unlocked: true },
    { label: "First Workout", icon: Dumbbell, color: "#8b5cf6", unlocked: true },
    { label: "Budget Master", icon: DollarSign, color: "#22c55e", unlocked: true },
    { label: "Book Worm", icon: BookOpen, color: "#6366f1", unlocked: false },
    { label: "Sleep Champion", icon: Moon, color: "#818cf8", unlocked: false },
    { label: "Rockstar", icon: Music, color: "#ec4899", unlocked: true },
  ];

  const quickStats = [
    { label: "Days Active", value: "47", icon: Calendar },
    { label: "Goals Met", value: "23", icon: Target },
    { label: "Best Streak", value: "12", icon: Flame },
  ];

  return (
    <div style={{ padding: "0 20px 120px", maxWidth: 600, margin: "0 auto" }}>
      {/* Header with gradient */}
      <div
        style={{
          padding: "60px 0 0",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Profile Picture */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 32,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)",
              padding: 3,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 30,
                background: "#1e1b4b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                fontWeight: 700,
                color: "#a78bfa",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              S
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: -4,
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "3px solid #0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Camera size={14} color="#fff" />
          </div>
        </div>

        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: "0 0 4px", fontFamily: "'Outfit', sans-serif" }}>
          Stefan
        </h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif" }}>
          Senior Talent Acquisition Specialist
        </p>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, margin: "0 0 20px", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <MapPin size={12} /> Sofia, Bulgaria
        </p>

        {/* Quick Stats */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {quickStats.map((s, i) => {
            const Icon = s.icon;
            return (
              <GlassCard key={i} style={{ flex: 1, padding: "16px 8px", textAlign: "center" }}>
                <Icon size={18} color="#8b5cf6" style={{ marginBottom: 6 }} />
                <p style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 2px", fontFamily: "'Outfit', sans-serif" }}>
                  {s.value}
                </p>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                  {s.label}
                </p>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* About Section */}
      <GlassCard style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 600, margin: "0 0 12px", fontFamily: "'Outfit', sans-serif" }}>
          About
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { icon: Briefcase, text: "EGT Digital • iGaming" },
            { icon: Music, text: "Vocalist — Phoenix (Rock Band)" },
            { icon: Award, text: "MSc Organizational Psychology" },
            { icon: Mail, text: "stefan@example.com" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icon size={16} color="rgba(255,255,255,0.3)" />
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Current Focus */}
      <GlassCard style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 600, margin: "0 0 14px", fontFamily: "'Outfit', sans-serif" }}>
          Q1 Focus Areas
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { text: "Better Sleep", color: "#818cf8" },
            { text: "Resistance Training", color: "#a78bfa" },
            { text: "Financial Tracking", color: "#22c55e" },
            { text: "Reading Habit", color: "#6366f1" },
            { text: "Stress Management", color: "#f59e0b" },
          ].map((tag, i) => (
            <span
              key={i}
              style={{
                padding: "6px 14px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 500,
                background: `${tag.color}15`,
                color: tag.color,
                border: `1px solid ${tag.color}25`,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {tag.text}
            </span>
          ))}
        </div>
      </GlassCard>

      {/* Achievements */}
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 600, margin: "0 0 12px", fontFamily: "'Outfit', sans-serif" }}>
          Achievements
        </h3>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {achievements.map((a, i) => {
          const Icon = a.icon;
          return (
            <GlassCard
              key={i}
              style={{
                padding: 16,
                textAlign: "center",
                opacity: a.unlocked ? 1 : 0.35,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: a.unlocked ? `${a.color}18` : "rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                }}
              >
                <Icon size={22} color={a.unlocked ? a.color : "rgba(255,255,255,0.2)"} />
              </div>
              <p
                style={{
                  color: a.unlocked ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)",
                  fontSize: 11,
                  fontWeight: 500,
                  margin: 0,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {a.label}
              </p>
            </GlassCard>
          );
        })}
      </div>

      {/* Edit Profile Button */}
      <div style={{ marginTop: 24 }}>
        <GlassCard style={{ overflow: "hidden" }}>
          <button
            style={{
              width: "100%",
              padding: "16px",
              border: "none",
              background: "transparent",
              color: "#8b5cf6",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Edit3 size={16} />
            Edit Profile
          </button>
        </GlassCard>
      </div>
    </div>
  );
};

// ===== MAIN APP =====
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0f172a; }

        ::-webkit-scrollbar { width: 0; height: 0; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'DM Sans', sans-serif",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      >
        {/* Ambient Background Orbs */}
        <div
          style={{
            position: "fixed",
            top: -120,
            right: -120,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
            animation: "pulseGlow 8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "fixed",
            bottom: 100,
            left: -100,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
            animation: "pulseGlow 10s ease-in-out infinite 2s",
          }}
        />

        {/* Page Content */}
        <div
          key={page}
          style={{
            animation: "fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            paddingBottom: 20,
          }}
        >
          {page === "dashboard" && <DashboardPage />}
          {page === "profile" && <ProfilePage />}
          {page === "settings" && <SettingsPage />}
        </div>

        {/* Bottom Navigation */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            padding: "0 20px 12px",
            zIndex: 100,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              width: "100%",
              maxWidth: 400,
              padding: "10px 8px",
              borderRadius: 24,
              background: "rgba(15,23,42,0.85)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 -4px 32px rgba(0,0,0,0.4)",
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    padding: "8px 20px",
                    border: "none",
                    borderRadius: 16,
                    background: active
                      ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))"
                      : "transparent",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Icon
                    size={22}
                    color={active ? "#a78bfa" : "rgba(255,255,255,0.3)"}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: active ? 600 : 400,
                      color: active ? "#a78bfa" : "rgba(255,255,255,0.3)",
                      fontFamily: "'DM Sans', sans-serif",
                      letterSpacing: 0.3,
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
