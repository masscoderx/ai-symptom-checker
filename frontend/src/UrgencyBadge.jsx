const URGENCY_CONFIG = {
  LOW: {
    label: "Low Urgency",
    description: "Manageable at home",
    bg: "bg-green-900/40",
    border: "border-green-600",
    text: "text-green-400",
    dot: "bg-green-400",
    icon: "🟢",
  },
  MODERATE: {
    label: "Moderate Urgency",
    description: "See a doctor soon",
    bg: "bg-yellow-900/40",
    border: "border-yellow-600",
    text: "text-yellow-400",
    dot: "bg-yellow-400",
    icon: "🟡",
  },
  HIGH: {
    label: "High Urgency",
    description: "Seek prompt medical care",
    bg: "bg-orange-900/40",
    border: "border-orange-600",
    text: "text-orange-400",
    dot: "bg-orange-400",
    icon: "🟠",
  },
  EMERGENCY: {
    label: "EMERGENCY",
    description: "Call 911 or go to ER immediately!",
    bg: "bg-red-900/40",
    border: "border-red-600",
    text: "text-red-400",
    dot: "bg-red-500 animate-pulse",
    icon: "🔴",
  },
};

export default function UrgencyBadge({ urgency }) {
  const config = URGENCY_CONFIG[urgency?.toUpperCase()] || URGENCY_CONFIG.LOW;

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${config.bg} ${config.border}`}
    >
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${config.dot}`} />
      <div>
        <p className={`font-bold text-xs uppercase tracking-wide ${config.text}`}>
          {config.icon} {config.label}
        </p>
        <p className="text-gray-400 text-xs">{config.description}</p>
      </div>
    </div>
  );
}
