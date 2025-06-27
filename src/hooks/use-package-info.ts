import { useState, useEffect, useCallback } from 'react';

export interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  size?: number;
  unpackedSize?: number;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  repository?: {
    type: string;
    url: string;
  };
  license?: string;
  lastPublish?: string;
  weeklyDownloads?: number;
  author?: string | { name: string; email?: string };
  keywords?: string[];
  homepage?: string;
  readme?: string;
  downloadStats?: DownloadStats;
}

export interface PackageStats {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

export interface DownloadPoint {
  downloads: number;
  day: string;
}

export interface DownloadStats {
  downloads: DownloadPoint[];
  start: string;
  end: string;
  package: string;
}

export function usePackageInfo(name: string) {
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackageInfo = useCallback(async () => {
    if (!name) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch package info from NPM registry
      const registryResponse = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`);
      
      if (!registryResponse.ok) {
        throw new Error(`Package ${name} not found`);
      }
      
      const registryData = await registryResponse.json();
      
      // Fetch download stats
      let weeklyDownloads = 0;
      let downloadStats: DownloadStats | undefined;
      
      try {
        // Fetch weekly download count
        const downloadsResponse = await fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`);
        if (downloadsResponse.ok) {
          const downloadsData = await downloadsResponse.json();
          weeklyDownloads = downloadsData.downloads || 0;
        }
        
        // Fetch download stats for chart (last 30 days)
        const rangeResponse = await fetch(`https://api.npmjs.org/downloads/range/last-month/${encodeURIComponent(name)}`);
        if (rangeResponse.ok) {
          const rangeData = await rangeResponse.json();
          downloadStats = rangeData;
        }
      } catch (downloadError) {
        console.warn(`Failed to fetch download stats for ${name}:`, downloadError);
      }
      
      const latestVersion = registryData['dist-tags']?.latest;
      const versionData = registryData.versions?.[latestVersion];
      
      if (!versionData) {
        throw new Error(`No version data found for ${name}`);
      }
      
      const packageInfo: PackageInfo = {
        name: registryData.name,
        version: latestVersion,
        description: registryData.description,
        size: versionData.dist?.shasum ? undefined : versionData.dist?.size,
        unpackedSize: versionData.dist?.unpackedSize,
        dependencies: versionData.dependencies,
        peerDependencies: versionData.peerDependencies,
        repository: versionData.repository,
        license: versionData.license || registryData.license,
        lastPublish: registryData.time?.[latestVersion],
        weeklyDownloads,
        author: versionData.author || registryData.author,
        keywords: versionData.keywords || registryData.keywords,
        homepage: versionData.homepage || registryData.homepage,
        readme: registryData.readme,
        downloadStats,
      };
      
      setPackageInfo(packageInfo);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch package info';
      setError(errorMessage);
      console.error(`Error fetching package info for ${name}:`, err);
    } finally {
      setLoading(false);
    }
  }, [name]);

  // Auto fetch when name changes
  useEffect(() => {
    if (name) {
      fetchPackageInfo();
    }
  }, [name, fetchPackageInfo]);

  const refetch = useCallback(() => {
    fetchPackageInfo();
  }, [fetchPackageInfo]);

  return {
    packageInfo,
    loading,
    error,
    refetch,
  };
}