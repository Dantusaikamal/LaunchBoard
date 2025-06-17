
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export interface GitHubRepo {
  name: string
  full_name: string
  description: string
  html_url: string
  clone_url: string
  default_branch: string
  open_issues_count: number
  stargazers_count: number
  forks_count: number
  created_at: string
  updated_at: string
  pushed_at: string
}

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  html_url: string
}

export interface GitHubRelease {
  tag_name: string
  name: string
  published_at: string
  html_url: string
}

export function useGitHubIntegration(repoUrl: string | null) {
  const [repo, setRepo] = useState<GitHubRepo | null>(null)
  const [commits, setCommits] = useState<GitHubCommit[]>([])
  const [releases, setReleases] = useState<GitHubRelease[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const extractRepoInfo = (url: string) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (match) {
      return { owner: match[1], repo: match[2].replace('.git', '') }
    }
    return null
  }

  const fetchGitHubData = async () => {
    if (!repoUrl) return

    const repoInfo = extractRepoInfo(repoUrl)
    if (!repoInfo) {
      setError('Invalid GitHub URL')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch repository information
      const repoResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`)
      if (repoResponse.ok) {
        const repoData = await repoResponse.json()
        setRepo(repoData)
      }

      // Fetch recent commits
      const commitsResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/commits?per_page=5`)
      if (commitsResponse.ok) {
        const commitsData = await commitsResponse.json()
        setCommits(commitsData)
      }

      // Fetch releases
      const releasesResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/releases?per_page=3`)
      if (releasesResponse.ok) {
        const releasesData = await releasesResponse.json()
        setReleases(releasesData)
      }
    } catch (err) {
      setError('Failed to fetch GitHub data')
      toast.error('Failed to fetch GitHub data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGitHubData()
  }, [repoUrl])

  return {
    repo,
    commits,
    releases,
    loading,
    error,
    refetch: fetchGitHubData
  }
}
