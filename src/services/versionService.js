/**
 * Mojang Version Manifest Fetcher
 */

export async function getMinecraftVersions(snapshotMode = false) {
  try {
    if (window.electronAPI && window.electronAPI.fetchMojangVersions) {
      const res = await window.electronAPI.fetchMojangVersions();
      if (res && res.versions) {
        if (!snapshotMode) {
          return res.versions.filter(v => v.type === 'release').map(v => v.id);
        }
        return res.versions.map(v => v.id);
      }
    }
  } catch (err) {
    console.warn('Electron version fetch failed, using fallback:', err);
  }

  // Fallback release versions
  const releaseVersions = [
    '1.21.4', '1.21.3', '1.21.2', '1.21.1', '1.21',
    '1.20.6', '1.20.4', '1.20.2', '1.20.1', '1.19.4',
    '1.19.2', '1.18.2', '1.16.5', '1.12.2', '1.8.9'
  ];

  if (snapshotMode) {
    return ['24w50a', '24w49a', '24w48a', ...releaseVersions];
  }

  return releaseVersions;
}
