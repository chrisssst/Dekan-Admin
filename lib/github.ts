type GitHubAsset = {
  name: string;
  browser_download_url: string;
  download_count: number;
  size: number;
  digest?: string | null;
};

type GitHubRelease = {
  id: number;
  name: string | null;
  tag_name: string;
  html_url: string;
  prerelease: boolean;
  draft: boolean;
  published_at: string | null;
  assets: GitHubAsset[];
};

type GitHubRepo = {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  html_url: string;
  default_branch: string;
};

type GitHubWorkflowRun = {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  display_title: string;
};

type GitHubWorkflowResponse = {
  workflow_runs: GitHubWorkflowRun[];
};

function githubHeaders() {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Dekan-Admin"
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function githubFetch<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: githubHeaders(),
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export type DashboardData = {
  repoName: string;
  repoUrl: string;
  stars: number;
  forks: number;
  openIssues: number;
  latestVersion: string;
  latestReleaseUrl: string | null;
  latestReleaseDate: string | null;
  latestInstallerHash: string | null;
  totalInstallerDownloads: number;
  latestInstallerDownloads: number;
  workflow: GitHubWorkflowRun | null;
  releases: Array<{
    name: string;
    tag: string;
    url: string;
    prerelease: boolean;
    publishedAt: string | null;
    installerDownloads: number;
    installerName: string | null;
    installerHash: string | null;
  }>;
};

export async function getDashboardData(): Promise<DashboardData> {
  const repoName = process.env.GITHUB_REPO || "chrisssst/Dekan";
  const encoded = repoName
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const [repo, releases, runs] = await Promise.all([
    githubFetch<GitHubRepo>(`/repos/${encoded}`),
    githubFetch<GitHubRelease[]>(`/repos/${encoded}/releases?per_page=100`),
    githubFetch<GitHubWorkflowResponse>(
      `/repos/${encoded}/actions/runs?branch=main&per_page=10`
    )
  ]);

  const publicReleases = releases.filter((release) => !release.draft);

  const releaseRows = publicReleases.map((release) => {
    const installer = release.assets.find(
      (asset) => asset.name.endsWith(".exe") && asset.name.includes("Setup")
    );

    return {
      name: release.name || release.tag_name,
      tag: release.tag_name,
      url: release.html_url,
      prerelease: release.prerelease,
      publishedAt: release.published_at,
      installerDownloads: installer?.download_count ?? 0,
      installerName: installer?.name ?? null,
      installerHash: installer?.digest?.replace(/^sha256:/, "") ?? null
    };
  });

  const latest =
    publicReleases.find((release) => !release.prerelease) ??
    publicReleases[0] ??
    null;

  const latestInstaller = latest?.assets.find(
    (asset) => asset.name.endsWith(".exe") && asset.name.includes("Setup")
  );

  const totalInstallerDownloads = publicReleases.reduce((sum, release) => {
    return (
      sum +
      release.assets
        .filter(
          (asset) => asset.name.endsWith(".exe") && asset.name.includes("Setup")
        )
        .reduce((releaseSum, asset) => releaseSum + asset.download_count, 0)
    );
  }, 0);

  return {
    repoName,
    repoUrl: repo.html_url,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    latestVersion: latest?.tag_name ?? "—",
    latestReleaseUrl: latest?.html_url ?? null,
    latestReleaseDate: latest?.published_at ?? null,
    latestInstallerHash:
      latestInstaller?.digest?.replace(/^sha256:/, "") ?? null,
    totalInstallerDownloads,
    latestInstallerDownloads: latestInstaller?.download_count ?? 0,
    workflow: runs.workflow_runs[0] ?? null,
    releases: releaseRows
  };
}
