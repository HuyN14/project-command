import { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Risk, RiskStatus } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, AlertTriangle } from 'lucide-react';

function riskLevel(score: number): { label: string; className: string } {
  if (score >= 15) return { label: 'Critical', className: 'bg-rag-red-bg text-rag-red' };
  if (score >= 8) return { label: 'High', className: 'bg-rag-yellow-bg text-rag-yellow' };
  if (score >= 4) return { label: 'Medium', className: 'bg-accent text-accent-foreground' };
  return { label: 'Low', className: 'bg-secondary text-secondary-foreground' };
}

export default function RisksPage() {
  const { project, setProject } = useProject();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', probability: '3', impact: '3', owner: '',
    mitigationPlan: '', reviewDate: '', linkedMilestoneId: '',
  });

  const handleAdd = () => {
    if (!form.title) return;
    const newRisk: Risk = {
      id: crypto.randomUUID(),
      title: form.title,
      description: form.description,
      probability: Number(form.probability) as Risk['probability'],
      impact: Number(form.impact) as Risk['impact'],
      owner: form.owner,
      mitigationPlan: form.mitigationPlan,
      status: 'open',
      reviewDate: form.reviewDate,
      linkedMilestoneId: form.linkedMilestoneId || undefined,
    };
    setProject(p => ({ ...p, risks: [...p.risks, newRisk] }));
    setForm({ title: '', description: '', probability: '3', impact: '3', owner: '', mitigationPlan: '', reviewDate: '', linkedMilestoneId: '' });
    setAddOpen(false);
  };

  const cycleRiskStatus = (id: string) => {
    const order: RiskStatus[] = ['open', 'mitigated', 'closed'];
    setProject(p => ({
      ...p,
      risks: p.risks.map(r => r.id === id ? { ...r, status: order[(order.indexOf(r.status) + 1) % order.length] } : r),
    }));
  };

  const sorted = [...project.risks].sort((a, b) => {
    if (a.status === 'closed' && b.status !== 'closed') return 1;
    if (a.status !== 'closed' && b.status === 'closed') return -1;
    return b.probability * b.impact - a.probability * a.impact;
  });

  // Build 5x5 matrix
  const matrix: Record<string, Risk[]> = {};
  project.risks.filter(r => r.status !== 'closed').forEach(r => {
    const key = `${r.probability}-${r.impact}`;
    if (!matrix[key]) matrix[key] = [];
    matrix[key].push(r);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Risk Register</h1>
          <p className="text-sm text-muted-foreground">Log, score, and track risks with mitigation plans</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Log Risk</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" aria-describedby={undefined}>
            <DialogHeader><DialogTitle>Log New Risk</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Risk Title</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Probability (1–5)</Label>
                  <Select value={form.probability} onValueChange={v => setForm(f => ({ ...f, probability: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n} – {['Rare','Unlikely','Possible','Likely','Almost Certain'][n-1]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Impact (1–5)</Label>
                  <Select value={form.impact} onValueChange={v => setForm(f => ({ ...f, impact: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n} – {['Negligible','Minor','Moderate','Major','Severe'][n-1]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Owner</Label>
                  <Input value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Review Date</Label>
                  <Input type="date" value={form.reviewDate} onChange={e => setForm(f => ({ ...f, reviewDate: e.target.value }))} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Mitigation Plan</Label>
                <Textarea value={form.mitigationPlan} onChange={e => setForm(f => ({ ...f, mitigationPlan: e.target.value }))} rows={2} />
              </div>
              <div className="grid gap-2">
                <Label>Linked Milestone</Label>
                <Select value={form.linkedMilestoneId} onValueChange={v => setForm(f => ({ ...f, linkedMilestoneId: v }))}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    {project.milestones.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button onClick={handleAdd}>Log Risk</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Risk Matrix */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Probability × Impact Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex flex-col justify-between py-1 pr-2 text-[10px] text-muted-foreground">
              {[5,4,3,2,1].map(i => <div key={i} className="h-10 flex items-center">{i}</div>)}
              <div className="h-4" />
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-5 gap-1">
                {[5,4,3,2,1].map(impact =>
                  [1,2,3,4,5].map(prob => {
                    const score = prob * impact;
                    const key = `${prob}-${impact}`;
                    const risks = matrix[key] || [];
                    const bg = score >= 15 ? 'bg-rag-red/20' : score >= 8 ? 'bg-rag-yellow/20' : score >= 4 ? 'bg-accent/60' : 'bg-secondary';
                    return (
                      <div key={key} className={`h-10 rounded-sm ${bg} flex items-center justify-center text-[10px] relative`} title={risks.map(r => r.title).join(', ')}>
                        {risks.length > 0 && (
                          <span className="flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="font-bold">{risks.length}</span>
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="grid grid-cols-5 gap-1 mt-1">
                {[1,2,3,4,5].map(p => <div key={p} className="text-center text-[10px] text-muted-foreground">{p}</div>)}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">← Probability →</span>
                <span className="text-[10px] text-muted-foreground">↑ Impact</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Table */}
      <Card className="border shadow-sm">
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk</TableHead>
                <TableHead className="w-16 text-center">P</TableHead>
                <TableHead className="w-16 text-center">I</TableHead>
                <TableHead className="w-20 text-center">Score</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(r => {
                const score = r.probability * r.impact;
                const level = riskLevel(score);
                return (
                  <TableRow key={r.id} className={r.status === 'closed' ? 'opacity-50' : ''}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{r.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.mitigationPlan}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{r.probability}</TableCell>
                    <TableCell className="text-center">{r.impact}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={level.className}>{score}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{r.owner}</TableCell>
                    <TableCell>
                      <button onClick={() => cycleRiskStatus(r.id)}>
                        <Badge variant="outline" className={`cursor-pointer ${
                          r.status === 'open' ? 'bg-rag-yellow-bg text-rag-yellow' :
                          r.status === 'mitigated' ? 'bg-rag-green-bg text-rag-green' :
                          'bg-secondary text-muted-foreground'
                        }`}>{r.status}</Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.reviewDate ? new Date(r.reviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
