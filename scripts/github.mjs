import { execFileSync } from 'node:child_process';
import { readFileSync, statSync, createReadStream } from 'node:fs';
import { basename } from 'node:path';

// Existing Git Credential Manager authentication stays in memory.
const entry = execFileSync('git', ['credential', 'fill'], {
  input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8',
  env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' },
});
const token = entry.split('\n').find(line => line.startsWith('password='))?.slice(9);
if (!token) throw new Error('Sign in to GitHub using Git Credential Manager first.');
const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
async function api(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, { ...options, headers: { ...headers, ...options.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${data.message}`);
  return data;
}
const [command, ...args] = process.argv.slice(2);
if (command === 'account') {
  const user = await api('/user');
  console.log(JSON.stringify({ login: user.login }));
} else if (command === 'create') {
  const repo = await api('/user/repos', { method: 'POST', body: JSON.stringify({ name: args[0], description: 'Kokonut — the home of SideQuest, Macrova and Revisen. Website and Android test downloads.', homepage: 'https://kokonut.cc', private: false, auto_init: false }) });
  console.log(JSON.stringify({ url: repo.html_url, remote: repo.clone_url, name: repo.full_name }));
} else if (command === 'release') {
  const [repo, tag, notes] = args;
  const release = await api(`/repos/${repo}/releases`, { method: 'POST', body: JSON.stringify({ tag_name: tag, name: 'Android test builds · 17 September 2026', body: readFileSync(notes, 'utf8'), prerelease: true, draft: true }) });
  console.log(JSON.stringify({ id: release.id, url: release.html_url }));
} else if (command === 'upload') {
  const [repo, releaseId, path, name = basename(path)] = args;
  const response = await fetch(`https://uploads.github.com/repos/${repo}/releases/${releaseId}/assets?name=${encodeURIComponent(name)}`, { method: 'POST', headers: { ...headers, 'Content-Type': path.endsWith('.apk') ? 'application/vnd.android.package-archive' : 'application/json', 'Content-Length': String(statSync(path).size) }, body: createReadStream(path), duplex: 'half' });
  const data = await response.json();
  if (!response.ok) throw new Error(`Upload ${response.status}: ${data.message}`);
  console.log(JSON.stringify({ name: data.name, size: data.size, url: data.browser_download_url, digest: data.digest }));
} else if (command === 'publish') {
  const [repo, releaseId] = args;
  const data = await api(`/repos/${repo}/releases/${releaseId}`, { method: 'PATCH', body: JSON.stringify({ draft: false }) });
  console.log(JSON.stringify({ url: data.html_url, assets: data.assets.map(a => ({ name: a.name, size: a.size, url: a.browser_download_url, digest: a.digest })) }));
} else if (command === 'get') {
  console.log(JSON.stringify(await api(args[0])));
} else { throw new Error('Expected account, create, release, upload, publish or get'); }
