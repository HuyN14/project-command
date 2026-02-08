import { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Decision } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Scale, ArrowRight } from 'lucide-react';

export default function DecisionsPage() {
  const { project, setProject } = useProject();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', context: '', options: '', chosen: '', rationale: '', impact: '', madeBy: '',
  });

  const handleAdd = () => {
    if (!form.title) return;
    const d: Decision = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      title: form.title,
      context: form.context,
      options: form.options.split('\n').filter(Boolean),
      chosen: form.chosen,
      rationale: form.rationale,
      impact: form.impact,
      madeBy: form.madeBy,
    };
    setProject(p => ({ ...p, decisions: [d, ...p.decisions] }));
    setForm({ title: '', context: '', options: '', chosen: '', rationale: '', impact: '', madeBy: '' });
    setAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Decision Log</h1>
          <p className="text-sm text-muted-foreground">Record decisions with context, rationale, and impact for accountability</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Record Decision</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" aria-describedby={undefined}>
            <DialogHeader><DialogTitle>Record Decision</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Decision Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Context</Label><Textarea value={form.context} onChange={e => setForm(f => ({ ...f, context: e.target.value }))} rows={2} placeholder="What situation prompted this decision?" /></div>
              <div className="grid gap-2"><Label>Options Considered (one per line)</Label><Textarea value={form.options} onChange={e => setForm(f => ({ ...f, options: e.target.value }))} rows={3} /></div>
              <div className="grid gap-2"><Label>Chosen Option</Label><Input value={form.chosen} onChange={e => setForm(f => ({ ...f, chosen: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Rationale</Label><Textarea value={form.rationale} onChange={e => setForm(f => ({ ...f, rationale: e.target.value }))} rows={2} placeholder="Why this option over the others?" /></div>
              <div className="grid gap-2"><Label>Impact (time, cost, scope)</Label><Textarea value={form.impact} onChange={e => setForm(f => ({ ...f, impact: e.target.value }))} rows={2} /></div>
              <div className="grid gap-2"><Label>Decision Maker</Label><Input value={form.madeBy} onChange={e => setForm(f => ({ ...f, madeBy: e.target.value }))} /></div>
            </div>
            <DialogFooter><Button onClick={handleAdd}>Record Decision</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {project.decisions.map(d => (
          <Card key={d.id} className="border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <Scale className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{d.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(d.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {d.madeBy}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Context</p>
                <p className="text-sm text-foreground">{d.context}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Options Considered</p>
                <div className="flex flex-wrap gap-1.5">
                  {d.options.map((opt, i) => (
                    <Badge key={i} variant="outline" className={opt === d.chosen ? 'bg-primary/10 text-primary border-primary/20' : ''}>
                      {opt === d.chosen && <ArrowRight className="w-3 h-3 mr-1" />}
                      {opt}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Rationale</p>
                <p className="text-sm text-foreground">{d.rationale}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Impact</p>
                <p className="text-sm text-muted-foreground">{d.impact}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {project.decisions.length === 0 && (
          <Card className="border shadow-sm"><CardContent className="py-12 text-center text-muted-foreground">No decisions recorded yet</CardContent></Card>
        )}
      </div>
    </div>
  );
}
