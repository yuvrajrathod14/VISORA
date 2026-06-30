interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

const features: FeatureCardProps[] = [
  {
    icon: '🎯',
    title: 'Visual Selection',
    description:
      'Hover and click any component in your running React app. Visora highlights it instantly with source file and line info.',
  },
  {
    icon: '🧠',
    title: 'Smart Context',
    description:
      'Automatically collects component source, props, styles, Tailwind classes, DOM hierarchy, and React Fiber data.',
  },
  {
    icon: '💬',
    title: 'Inline AI Chat',
    description:
      'Describe changes in natural language right beside the component. No more switching between browser and IDE.',
  },
  {
    icon: '🔗',
    title: 'MCP Integration',
    description:
      'Works with Cursor, VS Code, and Google Antigravity through the Model Context Protocol. Your AI gets perfect context.',
  },
  {
    icon: '⚡',
    title: 'Instant Apply',
    description:
      'AI generates the patch, you preview it, approve it, and Visora auto-applies it to your source code. Hot reload does the rest.',
  },
  {
    icon: '🛡️',
    title: 'Safe by Design',
    description:
      'Every change is previewed before applying. No blind code execution. You stay in control at all times.',
  },
];

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="features-header">
        <h2>
          Everything You Need to{' '}
          <span className="gradient-text">Edit Visually</span>
        </h2>
        <p>
          From component detection to AI-powered patches — Visora handles
          the entire workflow.
        </p>
      </div>
      <div className="features-grid">
        {features.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
    </section>
  );
}
