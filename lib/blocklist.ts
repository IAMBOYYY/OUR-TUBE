import rawBlocklist from "@/blocklist.json";

type Blocklist = {
  owners: string[];
  repos: string[];
  videos: string[];
};

const blocklist: Blocklist = {
  owners: Array.isArray(rawBlocklist.owners) ? rawBlocklist.owners : [],
  repos: Array.isArray(rawBlocklist.repos) ? rawBlocklist.repos : [],
  videos: Array.isArray(rawBlocklist.videos) ? rawBlocklist.videos : [],
};

const owners = new Set(blocklist.owners.map((value) => value.toLowerCase()));
const repos = new Set(blocklist.repos.map((value) => value.toLowerCase()));
const videos = new Set(blocklist.videos.map((value) => value.toLowerCase()));

export function isOwnerBlocked(owner: string): boolean {
  return owners.has(owner.toLowerCase());
}

export function isRepoBlocked(owner: string, repo: string): boolean {
  return (
    isOwnerBlocked(owner) || repos.has(`${owner}/${repo}`.toLowerCase())
  );
}

export function isVideoBlocked(
  owner: string,
  repo: string,
  id: string,
): boolean {
  return (
    isRepoBlocked(owner, repo) ||
    videos.has(`${owner}/${repo}/${id}`.toLowerCase())
  );
}
