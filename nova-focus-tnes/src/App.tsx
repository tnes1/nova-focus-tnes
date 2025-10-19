
import React, { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Check, Clock, Flag, ListChecks, Pause, Play, RefreshCcw, TimerReset, Trash2, Smartphone } from "lucide-react";

const LS_KEY = "nova_focus_tnes_state_v1";

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function saveState(state:any) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (_) {}
}

function fmtMMSS(total:number) {
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = Math.floor(total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const presets = [
  { id: "p25", label: "25/5", focus: 25 * 60, break: 5 * 60 },
  { id: "p50", label: "50/10", focus: 50 * 60, break: 10 * 60 },
  { id: "sprint90", label: "90/15", focus: 90 * 60, break: 15 * 60 },
];

const lanes = ["Now", "Next", "Later"] as const;

export default function App() {
  const [tasks, setTasks] = useState<any[]>(() => loadState()?.tasks || []);
  const [inboxText, setInboxText] = useState("");
  const [note, setNote] = useState(() => loadState()?.note || "");
  const [activeLane, setActiveLane] = useState("Now");
  const [showDone, setShowDone] = useState(false);

  const [presetId, setPresetId] = useState(() => loadState()?.presetId || "p25");
  const preset = useMemo(() => presets.find((p) => p.id === presetId) || presets[0], [presetId]);
  const [isFocus, setIsFocus] = useState(true);
  const [remaining, setRemaining] = useState(() => loadState()?.remaining ?? preset.focus);
  const [running, setRunning] = useState(false);
  const tickRef = useRef<any>(null);

  const [todayStats, setTodayStats] = useState(() => {
    const s = loadState()?.todayStats;
    const today = new Date().toDateString();
    if (!s || s.date !== today) return { date: today, focusSeconds: 0, tasksDone: 0 };
    return s;
  });

  useEffect(() => {
    saveState({ tasks, note, presetId, remaining, isFocus, todayStats, activeLane, showDone });
  }, [tasks, note, presetId, remaining, isFocus, todayStats, activeLane, showDone]);

  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          const nextIsFocus = !isFocus;
          setIsFocus(nextIsFocus);
          if (isFocus) {
            setTodayStats((ts:any) => ({ ...ts, focusSeconds: ts.focusSeconds + preset.focus }));
          }
          return nextIsFocus ? preset.focus : preset.break;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [running, isFocus, preset]);

  useEffect(() => {
    setRemaining(isFocus ? preset.focus : preset.break);
  }, [presetId]);

  useEffect(() => {
    const onKey = (e:KeyboardEvent) => {
      if (e.key === " ") {
        const target = e.target as HTMLElement;
        const tag = target?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea") return;
        e.preventDefault();
        setRunning((r) => !r);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        (document.getElementById("quick-capture") as HTMLInputElement)?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function addTask(title:string) {
    const t = { id: uuidv4(), title: title.trim(), lane: "Now", done: false, createdAt: Date.now() };
    setTasks((arr) => [t, ...arr]);
  }

  function toggleDone(id:string) {
    setTasks((arr) => arr.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    setTodayStats((ts:any) => ({ ...ts, tasksDone: ts.tasksDone + 1 }));
  }

  function moveLane(id:string, dir:number) {
    setTasks((arr) =>
      arr.map((t) => {
        if (t.id !== id) return t;
        const idx = lanes.indexOf(t.lane as any);
        const next = Math.min(Math.max(idx + dir, 0), lanes.length - 1);
        return { ...t, lane: lanes[next] };
      })
    );
  }

  function deleteTask(id:string) {
    setTasks((arr) => arr.filter((t) => t.id !== id));
  }

  function resetTimer() {
    setRunning(false);
    setIsFocus(true);
    setRemaining(preset.focus);
  }

  const laneTasks = (lane:string) => tasks.filter((t) => t.lane === lane && (showDone || !t.done));
  const progressPct = useMemo(() => {
    const total = isFocus ? preset.focus : preset.break;
    return Math.round(((total - remaining) / total) * 100);
  }, [remaining, isFocus, preset]);

  const focusMinsToday = Math.floor(todayStats.focusSeconds / 60);
  const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (window as any).navigator?.standalone;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 p-3 md:p-6" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 76px)" }}>
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Nova Focus — TNES</h1>
            <p className="text-slate-600 text-sm md:text-base">Capture fast. Plan light. Execute deep. Stay healthy.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <Badge variant="secondary" className="text-xs md:text-sm">Focus: {focusMinsToday} min</Badge>
            <Badge variant="secondary" className="text-xs md:text-sm">Done: {todayStats.tasksDone}</Badge>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-slate-600">Show done</span>
              <Switch checked={showDone} onCheckedChange={setShowDone} />
            </div>
          </div>
        </header>

        {!isStandalone && (
          <Card className="mt-3 md:mt-4 border-dashed">
            <CardContent className="p-3 md:p-4 text-slate-700 text-sm flex items-start gap-3">
              <Smartphone className="h-5 w-5 shrink-0 mt-0.5"/>
              <div><strong>Install to iPhone:</strong> In Safari, tap <em>Share</em> → <em>Add to Home Screen</em>. Opens full-screen, works offline.</div>
            </CardContent>
          </Card>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl"><Clock className="h-5 w-5"/> Deep Work Timer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Select value={presetId} onValueChange={setPresetId}>
                  <SelectTrigger className="w-36 md:w-40 text-base"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {presets.map((p) => (<SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Badge>{isFocus ? "Focus" : "Break"}</Badge>
              </div>
              <div className="text-5xl md:text-6xl font-bold tabular-nums tracking-tight text-slate-900 text-center md:text-left">{fmtMMSS(remaining)}</div>
              <Progress value={progressPct} />
              <div className="hidden md:flex gap-2">
                <Button onClick={() => setRunning((r) => !r)} className="rounded-2xl px-5 py-5 text-base">{running ? (<><Pause className="mr-2 h-4 w-4"/>Pause</>) : (<><Play className="mr-2 h-4 w-4"/>Start</>)}</Button>
                <Button variant="secondary" onClick={resetTimer} className="rounded-2xl px-5 py-5 text-base"><TimerReset className="mr-2 h-4 w-4"/>Reset</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl"><Flag className="h-5 w-5"/> Capture & Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input id="quick-capture" placeholder="Quick capture (enter to add)…" value={inboxText} onChange={(e)=>setInboxText(e.target.value)}
                       onKeyDown={(e)=>{ if(e.key==="Enter" && inboxText.trim()){ addTask(inboxText); setInboxText(""); } }}/>
                <Button onClick={()=>{ if(inboxText.trim()){ addTask(inboxText); setInboxText(""); } }} className="rounded-2xl px-4">Add</Button>
              </div>
              <Textarea placeholder="Scratchpad / daily intentions (optional)" value={note} onChange={(e)=>setNote(e.target.value)} />
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 md:mt-6">
          <Tabs value={activeLane} onValueChange={setActiveLane}>
            <TabsList className="grid w-full grid-cols-3">
              {lanes.map((l) => (
                <button key={l} onClick={()=>setActiveLane(l)} className={`w-full rounded-lg px-3 py-2 text-sm ${activeLane===l?'bg-white shadow':''}`}>{l}</button>
              ))}
            </TabsList>

            {lanes.map((l) => (
              <div key={l} className={`${activeLane===l?'block':'hidden'}`}>
                <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {laneTasks(l).map((t:any) => (
                    <Card key={t.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-[15px] ${t.done ? "line-through text-slate-400" : "text-slate-900"}`}>{t.title}</p>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary" onClick={() => moveLane(t.id, -1)} className="rounded-xl px-3">◀︎</Button>
                            <Button size="sm" variant="secondary" onClick={() => moveLane(t.id, 1)} className="rounded-xl px-3">▶︎</Button>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant={t.done ? "secondary" : "default"} onClick={() => toggleDone(t.id)} className="rounded-xl px-3">
                              <Check className="mr-1 h-4 w-4"/>{t.done ? "Undo" : "Done"}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteTask(t.id)} className="rounded-xl text-red-600 hover:text-red-700 px-2"><Trash2 className="h-4 w-4"/></Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {laneTasks(l).length === 0 && (
                  <div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">No tasks in {l}. Move items here when ready.</div>
                )}
              </div>
            ))}
          </Tabs>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg"><ListChecks className="h-5 w-5"/> Morning Focus (≤3 min)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm md:text-base text-slate-700">
              <ol className="list-decimal space-y-1 pl-4">
                <li>Write 1–3 outcomes in the scratchpad.</li>
                <li>Move tasks to <strong>Now</strong>.</li>
                <li>Start a focus block. Phone on DND.</li>
              </ol>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg"><RefreshCcw className="h-5 w-5"/> Afternoon Reset (60s)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm md:text-base text-slate-700">
              <ol className="list-decimal space-y-1 pl-4">
                <li>Quick capture lingering thoughts.</li>
                <li>Rebalance Now/Next/Later lanes.</li>
                <li>Run one more focus block.</li>
              </ol>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg"><TimerReset className="h-5 w-5"/> Evening Shutdown (2 min)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm md:text-base text-slate-700">
              <ol className="list-decimal space-y-1 pl-4">
                <li>Mark wins. Move leftovers to Next/Later.</li>
                <li>Type tomorrow’s top 1–3 outcomes.</li>
                <li>Reset timer. Rest.</li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-8 md:mt-10 text-center text-xs text-slate-500">
          Built with 💙 for TNES — mobile‑first, stored locally on your device.
        </footer>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-t px-3 pt-2 pb-[calc(10px+env(safe-area-inset-bottom))] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge>{isFocus ? "Focus" : "Break"}</Badge>
          <span className="font-semibold tabular-nums">{fmtMMSS(remaining)}</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setRunning((r) => !r)} className="rounded-2xl px-4 py-6 text-base">{running ? (<><Pause className="mr-2 h-4 w-4"/>Pause</>) : (<><Play className="mr-2 h-4 w-4"/>Start</>)}</Button>
          <Button variant="secondary" onClick={resetTimer} className="rounded-2xl px-4 py-6 text-base"><TimerReset className="mr-2 h-4 w-4"/>Reset</Button>
        </div>
      </div>
    </div>
  );
}
