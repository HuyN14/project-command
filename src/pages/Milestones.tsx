import { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Task, TaskStatus, Priority, Milestone } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react';

const statusConfig: Record<TaskStatus, { label: string; icon: typeof Circle; className: string }> = {
  'not-started': { label: 'Not Started', icon: Circle, className: 'text-muted-foreground' },
  'in-progress': { label: 'In Progress', icon: Clock, className: 'text-primary' },
  'completed': { label: 'Completed', icon: CheckCircle2, className: 'text-rag-green' },
  'blocked': { label: 'Blocked', icon: AlertCircle, className: 'text-rag-red' },
};

const priorityBadge: Record<Priority, string> = {
  critical: 'bg-rag-red-bg text-rag-red',
  high: 'bg-rag-yellow-bg text-rag-yellow',
  medium: 'bg-accent text-accent-foreground',
  low: 'bg-secondary text-secondary-foreground',
};

function getMilestoneProgress(m: Milestone): number {
  if (m.tasks.length === 0) return 0;
  return Math.round((m.tasks.filter(t => t.status === 'completed').length / m.tasks.length) * 100);
}

function isOverdue(t: Task): boolean {
  return new Date(t.dueDate) < new Date() && t.status !== 'completed';
}

export default function MilestonesPage() {
  const { project, setProject } = useProject();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(project.milestones[0]?.id || '');
  const [form, setForm] = useState({ title: '', owner: '', priority: 'medium' as Priority, dueDate: '', estimateHours: '' });

  const handleAddTask = () => {
    if (!form.title || !selectedMilestone) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: form.title,
      owner: form.owner,
      priority: form.priority,
      status: 'not-started',
      dueDate: form.dueDate,
      estimateHours: Number(form.estimateHours) || 0,
      milestoneId: selectedMilestone,
    };
    setProject(p => ({
      ...p,
      milestones: p.milestones.map(m =>
        m.id === selectedMilestone ? { ...m, tasks: [...m.tasks, newTask] } : m
      ),
    }));
    setForm({ title: '', owner: '', priority: 'medium', dueDate: '', estimateHours: '' });
    setAddOpen(false);
  };

  const cycleStatus = (milestoneId: string, taskId: string) => {
    const order: TaskStatus[] = ['not-started', 'in-progress', 'completed', 'blocked'];
    setProject(p => ({
      ...p,
      milestones: p.milestones.map(m =>
        m.id === milestoneId
          ? {
              ...m,
              tasks: m.tasks.map(t =>
                t.id === taskId ? { ...t, status: order[(order.indexOf(t.status) + 1) % order.length] } : t
              ),
            }
          : m
      ),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Milestones & Tasks</h1>
          <p className="text-sm text-muted-foreground">Break down the project into phases and track task completion</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Task</Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Milestone</Label>
                <Select value={selectedMilestone} onValueChange={setSelectedMilestone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {project.milestones.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Task Title</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Owner</Label>
                  <Input value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as Priority }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Estimate (hours)</Label>
                  <Input type="number" value={form.estimateHours} onChange={e => setForm(f => ({ ...f, estimateHours: e.target.value }))} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTask}>Add Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {project.milestones.map(m => {
        const prog = getMilestoneProgress(m);
        const StatusIcon = statusConfig[m.status].icon;
        return (
          <Card key={m.id} className="border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusIcon className={`w-5 h-5 ${statusConfig[m.status].className}`} />
                  <div>
                    <CardTitle className="text-base">{m.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{new Date(m.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(m.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="font-semibold text-foreground">{prog}%</span>
                </div>
              </div>
              <Progress value={prog} className="h-1.5 mt-3" />
            </CardHeader>
            <CardContent>
              {m.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks yet</p>
              ) : (
                <div className="space-y-1">
                  {m.tasks.map(t => {
                    const TIcon = statusConfig[t.status].icon;
                    const overdue = isOverdue(t);
                    return (
                      <div
                        key={t.id}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-secondary/50 transition-colors ${overdue ? 'bg-rag-red-bg/30' : ''}`}
                      >
                        <button onClick={() => cycleStatus(m.id, t.id)} className="flex-shrink-0">
                          <TIcon className={`w-4 h-4 ${statusConfig[t.status].className} cursor-pointer`} />
                        </button>
                        <span className={`flex-1 font-medium ${t.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {t.title}
                        </span>
                        <span className="text-xs text-muted-foreground">{t.owner}</span>
                        <Badge variant="outline" className={`text-[10px] ${priorityBadge[t.priority]}`}>{t.priority}</Badge>
                        <span className={`text-xs ${overdue ? 'text-rag-red font-semibold' : 'text-muted-foreground'}`}>
                          {overdue ? '⚠ ' : ''}{new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-xs text-muted-foreground">{t.estimateHours}h</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
