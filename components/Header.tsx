interface Props {
  title: string;
  description: string;
  stats?: { label: string; value: string }[];
}

export function Header({ title, description, stats = [] }: Props) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-lg">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/70">Overview</p>
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="text-sm text-white/80">{description}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/10 p-3 text-center">
              <p className="text-xs uppercase tracking-wide text-white/70">{stat.label}</p>
              <p className="text-xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
