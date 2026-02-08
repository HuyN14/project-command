import { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Stakeholder } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, User } from 'lucide-react';

function getQuadrant(s: Stakeholder): string {
  const hi = s.influence >= 4;
  const hs = s.interest >= 4;
  if (hi && hs) return 'Manage Closely';
  if (hi && !hs) return 'Keep Satisfied';
  if (!hi && hs) return 'Keep Informed';
  return 'Monitor';
}

const quadrantColors: Record<string, string> = {
  'Manage Closely': 'bg-rag-red-bg text-rag-red',
  'Keep Satisfied': 'bg-rag-yellow-bg text-rag-yellow',
  'Keep Informed': 'bg-accent text-accent-foreground',
  'Monitor': 'bg-secondary text-secondary-foreground',
};

export default function StakeholdersPage() {
  const { project, setProject } = useProject();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', role: '', influence: '3', interest: '3', expectations: '',
    communicationCadence: '', notes: '',
  });

  const handleAdd = () => {
    if (!form.name) return;
    const s: Stakeholder = {
      id: crypto.randomUUID(),
      name: form.name,
      role: form.role,
      influence: Number(form.influence),
      interest: Number(form.interest),
      expectations: form.expectations,
      communicationCadence: form.communicationCadence,
      notes: form.notes,
    };
    setProject(p => ({ ...p, stakeholders: [...p.stakeholders, s] }));
    setForm({ name: '', role: '', influence: '3', interest: '3', expectations: '', communicationCadence: '', notes: '' });
    setAddOpen(false);
  };

  const quadrants = {
    'Manage Closely': project.stakeholders.filter(s => s.influence >= 4 && s.interest >= 4),
    'Keep Satisfied': project.stakeholders.filter(s => s.influence >= 4 && s.interest < 4),
    'Keep Informed': project.stakeholders.filter(s => s.influence < 4 && s.interest >= 4),
    'Monitor': project.stakeholders.filter(s => s.influence < 4 && s.interest < 4),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Stakeholder Management</h1>
          <p className="text-sm text-muted-foreground">Map influence, interest, and communication needs</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Stakeholder</Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader><DialogTitle>Add Stakeholder</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Role</Label><Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Influence (1–5)</Label>
                  <Select value={form.influence} onValueChange={v => setForm(f => ({ ...f, influence: v }))}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Interest (1–5)</Label>
                  <Select value={form.interest} onValueChange={v => setForm(f => ({ ...f, interest: v }))}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2"><Label>Expectations</Label><Textarea value={form.expectations} onChange={e => setForm(f => ({ ...f, expectations: e.target.value }))} rows={2} /></div>
              <div className="grid gap-2"><Label>Communication Cadence</Label><Input value={form.communicationCadence} onChange={e => setForm(f => ({ ...f, communicationCadence: e.target.value }))} placeholder="e.g., Weekly 1:1" /></div>
              <div className="grid gap-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter><Button onClick={handleAdd}>Add Stakeholder</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Influence-Interest Grid */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Influence × Interest Grid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {(['Manage Closely', 'Keep Satisfied', 'Keep Informed', 'Monitor'] as const).map(q => (
              <div key={q} className={`rounded-lg p-4 min-h-[100px] ${
                q === 'Manage Closely' ? 'bg-rag-red-bg/40 border border-rag-red/10' :
                q === 'Keep Satisfied' ? 'bg-rag-yellow-bg/40 border border-rag-yellow/10' :
                q === 'Keep Informed' ? 'bg-accent/40 border border-primary/10' :
                'bg-secondary/40 border border-border'
              }`}>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{q}</p>
                <p className="text-[10px] text-muted-foreground mb-3">
                  {q === 'Manage Closely' ? 'High influence, High interest' :
                   q === 'Keep Satisfied' ? 'High influence, Low interest' :
                   q === 'Keep Informed' ? 'Low influence, High interest' :
                   'Low influence, Low interest'}
                </p>
                <div className="space-y-1.5">
                  {quadrants[q].map(s => (
                    <div key={s.id} className="flex items-center gap-2 text-sm">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium text-foreground">{s.name}</span>
                      <span className="text-xs text-muted-foreground">· {s.role}</span>
                    </div>
                  ))}
                  {quadrants[q].length === 0 && <p className="text-xs text-muted-foreground italic">None</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>← Interest →</span>
            <span>↑ Influence</span>
          </div>
        </CardContent>
      </Card>

      {/* Stakeholder Cards */}
      <div className="grid grid-cols-2 gap-4">
        {project.stakeholders.map(s => {
          const q = getQuadrant(s);
          return (
            <Card key={s.id} className="border shadow-sm">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">{s.role}</p>
                  </div>
                  <Badge variant="outline" className={quadrantColors[q]}>{q}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div><span className="text-muted-foreground">Influence:</span> <span className="font-semibold">{s.influence}/5</span></div>
                  <div><span className="text-muted-foreground">Interest:</span> <span className="font-semibold">{s.interest}/5</span></div>
                  <div className="col-span-2"><span className="text-muted-foreground">Cadence:</span> {s.communicationCadence}</div>
                </div>
                <p className="text-xs text-muted-foreground">{s.expectations}</p>
                {s.notes && <p className="text-xs text-muted-foreground mt-1 italic">{s.notes}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
