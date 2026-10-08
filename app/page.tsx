import Image from "next/image";
import { getDashboardData } from "@/lib/github";
import { StatCard } from "@/components/StatCard";
import { LogoutButton } from "@/components/LogoutButton";

export const revalidate = 300;

function compactNumber(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul"
  }).format(new Date(value));
}

function workflowLabel(status: string, conclusion: string | null) {
  if (status !== "completed") return "Çalışıyor";
  if (conclusion === "success") return "Başarılı";
  if (conclusion === "failure") return "Başarısız";
  return conclusion || status;
}

export default async function Dashboard() {
  let data;
  let loadError = "";

  try {
    data = await getDashboardData();
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "GitHub verileri yüklenemedi.";
  }

  if (!data) {
    return (
      <main className="dashboard-shell">
        <div className="notice error">
          GitHub verileri yüklenemedi: {loadError}
        </div>
      </main>
    );
  }

  const maxDownloads = Math.max(
    1,
    ...data.releases.map((release) => release.installerDownloads)
  );

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="brand">
          <Image src="/dekan.png" alt="Dekan" width={48} height={48} priority />
          <div>
            <div className="eyebrow">CONTROL CENTER</div>
            <h1>Dekan Admin</h1>
          </div>
        </div>

        <div className="top-actions">
          <a className="ghost-button" href={data.repoUrl} target="_blank">
            GitHub
          </a>
          <LogoutButton />
        </div>
      </header>

      <section className="hero-panel">
        <div>
          <span className="pill">
            <span className="status-dot" />
            Sistem çevrimiçi
          </span>
          <h2>Projenin nabzı tek ekranda.</h2>
          <p>
            GitHub release indirmelerini, sürümleri ve build durumunu gerçek
            zamanlıya yakın olarak takip et.
          </p>
        </div>
        <div className="version-badge">
          <span>Latest</span>
          <strong>{data.latestVersion}</strong>
          <small>{formatDate(data.latestReleaseDate)}</small>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Toplam installer indirme"
          value={compactNumber(data.totalInstallerDownloads)}
          helper="Tüm release .exe dosyaları"
          accent="#5ad7ff"
        />
        <StatCard
          label="Latest indirme"
          value={compactNumber(data.latestInstallerDownloads)}
          helper={`${data.latestVersion} installer`}
          accent="#8d7dff"
        />
        <StatCard
          label="GitHub Stars"
          value={compactNumber(data.stars)}
          helper={`${data.forks} fork`}
          accent="#b77cff"
        />
        <StatCard
          label="Açık issue"
          value={data.openIssues}
          helper="GitHub repository"
          accent="#43e0b1"
        />
      </section>

      <section className="content-grid">
        <article className="panel wide">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">DOWNLOADS</div>
              <h3>Sürümlere göre indirme</h3>
            </div>
            <span className="muted">GitHub release assets</span>
          </div>

          <div className="bars">
            {data.releases.slice(0, 8).map((release) => {
              const width = Math.max(
                4,
                (release.installerDownloads / maxDownloads) * 100
              );

              return (
                <div className="bar-row" key={release.tag}>
                  <div className="bar-meta">
                    <span>{release.tag}</span>
                    <strong>{release.installerDownloads}</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">BUILD</div>
              <h3>GitHub Actions</h3>
            </div>
          </div>

          {data.workflow ? (
            <div className="workflow-card">
              <div className="workflow-status">
                <span
                  className={`status-dot ${
                    data.workflow.conclusion === "failure" ? "danger-dot" : ""
                  }`}
                />
                <div>
                  <strong>
                    {workflowLabel(
                      data.workflow.status,
                      data.workflow.conclusion
                    )}
                  </strong>
                  <span>{data.workflow.name}</span>
                </div>
              </div>
              <p>{data.workflow.display_title}</p>
              <a href={data.workflow.html_url} target="_blank">
                Workflow'u aç →
              </a>
            </div>
          ) : (
            <p className="muted">Workflow verisi bulunamadı.</p>
          )}
        </article>
      </section>

      <section className="panel releases-panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">RELEASES</div>
            <h3>Yayın geçmişi</h3>
          </div>
          {data.latestReleaseUrl && (
            <a className="ghost-button" href={data.latestReleaseUrl} target="_blank">
              Latest release
            </a>
          )}
        </div>

        <div className="release-table-wrap">
          <table className="release-table">
            <thead>
              <tr>
                <th>Sürüm</th>
                <th>Durum</th>
                <th>Yayın</th>
                <th>Installer</th>
                <th>İndirme</th>
                <th>SHA-256</th>
              </tr>
            </thead>
            <tbody>
              {data.releases.map((release) => (
                <tr key={release.tag}>
                  <td>
                    <a href={release.url} target="_blank">
                      {release.tag}
                    </a>
                  </td>
                  <td>
                    <span className={`release-state ${release.prerelease ? "pre" : ""}`}>
                      {release.prerelease ? "Pre-release" : "Stable"}
                    </span>
                  </td>
                  <td>{formatDate(release.publishedAt)}</td>
                  <td>{release.installerName || "—"}</td>
                  <td>{release.installerDownloads}</td>
                  <td>
                    <code className="hash">
                      {release.installerHash
                        ? `${release.installerHash.slice(0, 12)}…`
                        : "—"}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel telemetry-panel">
        <div>
          <div className="eyebrow">NEXT STEP</div>
          <h3>Anonim telemetry hazır değil</h3>
          <p>
            Bu v1 panel yalnızca GitHub verilerini okur. Kullanıcı cihazlarından
            hiçbir veri toplamaz. İstersen v2'de açık rıza ile anonim
            <code> app_open </code>, sürüm ve crash istatistikleri eklenebilir.
          </p>
        </div>
        <span className="telemetry-chip">Privacy-first</span>
      </section>

      <footer>
        <span>Dekan Admin v1</span>
        <span>GitHub verileri 5 dakikada bir yenilenir.</span>
      </footer>
    </main>
  );
}
