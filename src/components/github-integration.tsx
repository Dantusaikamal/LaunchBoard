
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGitHubIntegration } from '@/hooks/useGitHubIntegration'
import { ExternalLink, GitBranch, Star, GitCommit, AlertCircle, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface GitHubIntegrationProps {
  repoUrl: string | null
}

export function GitHubIntegration({ repoUrl }: GitHubIntegrationProps) {
  const { repo, commits, releases, loading, error, refetch } = useGitHubIntegration(repoUrl)

  if (!repoUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            GitHub Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No GitHub repository connected</p>
            <p className="text-sm">Add a repository URL to see commit history and stats</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            GitHub Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            GitHub Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500 opacity-50" />
            <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Repository Info */}
      {repo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Repository Info
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on GitHub
                </a>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{repo.name}</h3>
                <p className="text-muted-foreground">{repo.description || 'No description'}</p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">{repo.stargazers_count} stars</span>
                </div>
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  <span className="text-sm">{repo.forks_count} forks</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {repo.open_issues_count} open issues
                </Badge>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Created {formatDistanceToNow(new Date(repo.created_at))} ago</p>
                <p>Last updated {formatDistanceToNow(new Date(repo.updated_at))} ago</p>
                <p>Last push {formatDistanceToNow(new Date(repo.pushed_at))} ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Commits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCommit className="h-5 w-5" />
              Recent Commits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {commits.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No commits found</p>
            ) : (
              <div className="space-y-3">
                {commits.map((commit) => (
                  <div key={commit.sha} className="border-l-4 border-blue-500 pl-4 hover:bg-muted/50 p-2 rounded transition-colors">
                    <p className="font-medium text-sm line-clamp-2">
                      {commit.commit.message.split('\n')[0]}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>by {commit.commit.author.name}</span>
                      <span>{formatDistanceToNow(new Date(commit.commit.author.date))} ago</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="mt-2 h-6 px-2 text-xs">
                      <a href={commit.html_url} target="_blank" rel="noopener noreferrer">
                        View commit
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Releases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Latest Releases
            </CardTitle>
          </CardHeader>
          <CardContent>
            {releases.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No releases found</p>
            ) : (
              <div className="space-y-3">
                {releases.map((release) => (
                  <div key={release.tag_name} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{release.tag_name}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(release.published_at))} ago
                      </span>
                    </div>
                    <p className="font-medium text-sm">{release.name}</p>
                    <Button variant="ghost" size="sm" asChild className="mt-2 h-6 px-2 text-xs">
                      <a href={release.html_url} target="_blank" rel="noopener noreferrer">
                        View release
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
