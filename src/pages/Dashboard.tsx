import { useProject } from '@/contexts/ProjectContext';
import { HealthStatus, Milestone, Task } from '@/types/project';
import HealthBadge from '@/components/HealthBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Calendar, CheckCircle2, Clock, TrendingUp, Target } from 'lucide-react';

function getMilestoneProgress(m: Milestone): number {
  if (m.tasks.length === 0) return 0;
  return Math.round((m.tasks.filter(t => t.status === 'completed').length / m.tasks.length) * 100);
}

function getProjectProgress(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  const total = milestones.reduce((sum, m) => sum + getMilestoneProgress(m), 0);
  return Math.round(total / milestones.length);
}

function isOverdue(task: Task): boolean {
  return new Date(task.dueDate) < new Date() && task.status !== 'completed';
}

function getTimelineProgress(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const now = Date.now();
  if (now <= s) return 0;
  if (now >= e) return 100;
  return Math.round(((now - s) / (e - s)) * 100);
}

const statusColors: Record<string, string> = {
  green: 'text-rag-green',
  yellow: 'text-rag-yellow',
  red: 'text-rag-red',
};

const priorityBadge: Record<string, string> = {
  critical: 'bg-rag-red-bg text-rag-red',
  high: 'bg-rag-yellow-bg text-rag-yellow',
  medium: 'bg-accent text-accent-foreground',
  low: 'bg-secondary text-secondary-foreground',
};

export default function Dashboard() {
  const { project, setProject } = useProject();
  const progress = getProjectProgress(project.milestones);
  const timeline = getTimelineProgress(project.startDate, project.endDate);

  const allTasks = project.milestones.flatMap(m => m.tasks);
  const overdueTasks = allTasks.filter(isOverdue);
  const upcomingTasks = allTasks
    .filter(t => t.status !== 'completed' && !isOverdue(t))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const topRisks = [...project.risks]
    .filter(r => r.status === 'open')
    .sort((a, b) => b.probability * b.impact - a.probability * a.impact)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">{project.goal}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Select
            value={project.healthStatus}
            onValueChange={(v) => setProject(p => ({ ...p, healthStatus: v as HealthStatus }))}
          >
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="green">🟢 On Track</SelectItem>
              <SelectItem value="yellow">🟡 At Risk</SelectItem>
              <SelectItem value="red">🔴 Off Track</SelectItem>
            </SelectContent>
          </Select>
          <HealthBadge status={project.healthStatus} size="lg" />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        {project.metrics.map(metric => (
          <Card key={metric.id} className="border shadow-sm">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{metric.name}</p>
                <span className={`w-2 h-2 rounded-full ${metric.status === 'green' ? 'bg-rag-green' : metric.status === 'yellow' ? 'bg-rag-yellow' : 'bg-rag-red'}`} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{metric.current}</span>
                <span className="text-sm text-muted-foreground">/ {metric.target}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timeline & Progress */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                <span>{timeline}% elapsed</span>
                <span>{new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
              <Progress value={timeline} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{allTasks.filter(t => t.status === 'completed').length} of {allTasks.length} tasks completed</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestones + Top Risks */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              Milestone Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.milestones.map(m => {
              const p = getMilestoneProgress(m);
              return (
                <div key={m.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{m.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{p}%</span>
                      {m.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-rag-green" />}
                    </div>
                  </div>
                  <Progress value={p} className="h-1.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              Top Risks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topRisks.map(risk => (
              <div key={risk.id} className="flex items-start gap-3 text-sm">
                <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                  risk.probability * risk.impact >= 15 ? 'bg-rag-red' :
                  risk.probability * risk.impact >= 8 ? 'bg-rag-yellow' : 'bg-rag-green'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{risk.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Score: {risk.probability * risk.impact} · Owner: {risk.owner}
                  </p>
                </div>
              </div>
            ))}
            {topRisks.length === 0 && <p className="text-sm text-muted-foreground">No open risks</p>}
          </CardContent>
        </Card>
      </div>

      {/* Overdue & Upcoming */}
      {overdueTasks.length > 0 && (
        <Card className="border border-rag-red/20 shadow-sm bg-rag-red-bg/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rag-red">
              <Clock className="w-4 h-4" />
              Overdue Tasks ({overdueTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueTasks.map(t => (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{t.title}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{t.owner}</span>
                    <Badge variant="outline" className={priorityBadge[t.priority]}>{t.priority}</Badge>
                    <span className="text-rag-red font-medium">Due {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Upcoming Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {upcomingTasks.map(t => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{t.title}</span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{t.owner}</span>
                  <Badge variant="outline" className={priorityBadge[t.priority]}>{t.priority}</Badge>
                  <span>Due {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            ))}
            {upcomingTasks.length === 0 && <p className="text-sm text-muted-foreground">No upcoming tasks</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
