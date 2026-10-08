type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  accent?: string;
};

export function StatCard({ label, value, helper, accent }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="mini-orb" style={{ "--orb": accent } as React.CSSProperties} />
      </div>
      <strong>{value}</strong>
      {helper && <p>{helper}</p>}
    </article>
  );
}
