"use client";

import { createPortal } from "react-dom";
import {
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Eye,
  FilePlus2,
  LockKeyhole,
  MoreHorizontal,
  PanelRight,
  Pencil,
  Plus,
  Send,
  Settings2,
  Share2,
  Tag,
  Trash2,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { useWorkspaceProfile } from "@/components/auth/workspace-profile";
import { Avatar } from "@/components/layout/Avatar";
import {
  createSubtask,
  createTaskComment,
  deleteSubtask,
  type SubtaskWriteInput,
  updateSubtask,
  updateTaskDetail,
} from "@/services/tasks-api";
import { MemberAvatar } from "./MemberAvatar";
import { getWorkspaceTaskStatus } from "./task-sections";
import type {
  Subtask,
  TaskActivity,
  TaskComment,
  TaskDetail,
  TaskPriority,
  TaskStatus,
} from "./types";

const statusOptions: Array<{ value: TaskStatus; label: string; className: string }> = [
  { value: "todo", label: "To Do", className: "text-zinc-500" },
  { value: "on-hold", label: "On Hold", className: "text-red-500" },
  { value: "doing", label: "Doing", className: "text-amber-600" },
  { value: "completed", label: "Completed", className: "text-emerald-600" },
];

const priorityOptions: Array<{ value: TaskPriority; label: string; className: string }> = [
  { value: "urgent", label: "Urgent", className: "text-red-600" },
  { value: "high", label: "High", className: "text-red-500" },
  { value: "medium", label: "Medium", className: "text-amber-500" },
  { value: "low", label: "Low", className: "text-zinc-400" },
  { value: "no-priority", label: "No Priority", className: "text-muted" },
];

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function labelForStatus(status: TaskStatus): string {
  const workspaceStatus = getWorkspaceTaskStatus(status);

  return statusOptions.find((option) => option.value === workspaceStatus)?.label ?? workspaceStatus;
}

function labelForPriority(priority: TaskPriority): string {
  return priorityOptions.find((option) => option.value === priority)?.label ?? priority;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "No due date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatActivityDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function toDateId(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function localDateId(date: Date): string {
  return [date.getFullYear(), `${date.getMonth() + 1}`.padStart(2, "0"), `${date.getDate()}`.padStart(2, "0")].join("-");
}

function PriorityBars({ priority }: { priority: TaskPriority }) {
  const option = priorityOptions.find((item) => item.value === priority);
  const activeBars = priority === "urgent" ? 3 : priority === "high" ? 3 : priority === "medium" ? 2 : priority === "low" ? 1 : 0;
  const colorClass = option?.className ?? "text-muted";

  if (activeBars === 0) {
    return <CircleDot className={`h-3.5 w-3.5 ${colorClass}`} aria-hidden="true" />;
  }

  return (
    <span className={`inline-flex h-3.5 items-end gap-[2px] ${colorClass}`} aria-hidden="true">
      {[5, 9, 13].map((height, index) => (
        <span
          key={height}
          className={`w-[2px] rounded-full ${index < activeBars ? "bg-current" : "bg-current/20"}`}
          style={{ height }}
        />
      ))}
    </span>
  );
}

function StatusMark({ status }: { status: TaskStatus }) {
  const option = statusOptions.find(
    (item) => item.value === getWorkspaceTaskStatus(status),
  );
  return <CircleDot className={`h-3.5 w-3.5 ${option?.className ?? "text-muted"}`} aria-hidden="true" />;
}

function FloatingPopover({
  open,
  anchorRef,
  onClose,
  width = 260,
  children,
}: {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  width?: number;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
      const below = rect.bottom + 8;
      const top = Math.min(below, window.innerHeight - 220);
      setPosition({ top: Math.max(12, top), left });
    };

    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        !anchorRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        onClose();
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [anchorRef, onClose, open, width]);

  if (!open || !position || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={panelRef}
      className="fixed z-[70] max-h-[min(440px,calc(100dvh-24px))] overflow-y-auto rounded-[12px] border border-border bg-background p-1.5 shadow-[0_16px_36px_rgba(0,0,0,0.14)]"
      style={{ top: position.top, left: position.left, width: `min(${width}px, calc(100vw - 24px))` }}
    >
      {children}
    </div>,
    document.body,
  );
}

function CollapsibleCard({
  title,
  open,
  onToggle,
  action,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[14px] border border-border bg-background">
      <div className="flex min-h-12 items-center gap-2 px-4">
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-7 w-7 items-center justify-center rounded-[5px] text-muted transition-colors hover:bg-surface hover:text-foreground"
          aria-expanded={open}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "" : "-rotate-90"}`} aria-hidden="true" />
        </button>
        <h2 className="text-[16px] font-semibold text-foreground">{title}</h2>
        <div className="ml-auto">{action}</div>
      </div>
      {open ? <div className="border-t border-transparent px-4 pb-4">{children}</div> : null}
    </section>
  );
}

function DetailValueButton({
  buttonRef,
  onClick,
  children,
}: {
  buttonRef: RefObject<HTMLButtonElement | null>;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      className="inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-[7px] px-2 text-left text-[13px] text-foreground transition-colors hover:bg-surface"
    >
      {children}
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
    </button>
  );
}

function CalendarPicker({
  value,
  onSelect,
}: {
  value: string | null;
  onSelect: (value: string) => void;
}) {
  const selected = toDateId(value);
  const [month, setMonth] = useState(() => {
    const date = selected ? new Date(`${selected}T12:00:00`) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(month);
  const start = month.getDay();
  const numberOfDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: start + numberOfDays }, (_, index) => index - start + 1);

  return (
    <div className="p-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-[14px] font-semibold text-foreground">{monthName}</p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="inline-flex h-7 w-7 items-center justify-center rounded-[5px] text-muted hover:bg-surface"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="inline-flex h-7 w-7 items-center justify-center rounded-[5px] text-muted hover:bg-surface"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day < 1) {
            return <span key={`empty-${index}`} className="h-8" />;
          }
          const id = localDateId(new Date(month.getFullYear(), month.getMonth(), day));
          const active = id === selected;
          return <button key={id} type="button" onClick={() => onSelect(id)} className={`h-8 rounded-full text-[12px] font-medium transition-colors ${active ? "bg-foreground text-background" : "text-foreground hover:bg-surface"}`}>{day}</button>;
        })}
      </div>
    </div>
  );
}

function ActivityRow({ activity }: { activity: TaskActivity }) {
  const isPriority = activity.type === "priority-changed";
  return (
    <div className="flex gap-2.5 py-2.5">
      {isPriority ? <PriorityBars priority="high" /> : <Avatar alt={activity.actorName} initials={getInitials(activity.actorName)} src={activity.actorAvatar} sizeClassName="h-5.5 w-5.5" textClassName="text-[9px]" />}
      <div className="min-w-0 text-[12px] leading-5 text-muted">
        <p><span className="font-medium text-foreground">{activity.actorName}</span> {activity.message}</p>
        <p className="mt-0.5 text-[11px] text-muted">{formatActivityDate(activity.createdAt)}</p>
      </div>
    </div>
  );
}

export function TaskDetailExperience({ initialTask }: { initialTask: TaskDetail }) {
  const profile = useWorkspaceProfile();
  const [task, setTask] = useState(initialTask);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isUpdatesOpen, setIsUpdatesOpen] = useState(true);
  const [isSubtasksOpen, setIsSubtasksOpen] = useState(true);
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState(initialTask.description ?? "");
  const [newLabel, setNewLabel] = useState("");
  const [newTeam, setNewTeam] = useState("");
  const [newResource, setNewResource] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activePopover, setActivePopover] = useState<"status" | "priority" | "start" | "due" | null>(null);
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const priorityButtonRef = useRef<HTMLButtonElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const dueButtonRef = useRef<HTMLButtonElement>(null);

  const actor = useMemo(
    () => ({ actorName: profile.fullName, actorAvatar: profile.avatarUrl }),
    [profile.avatarUrl, profile.fullName],
  );

  const persist = async (input: Parameters<typeof updateTaskDetail>[1]) => {
    try {
      setErrorMessage(null);
      const updated = await updateTaskDetail(task.id, input);
      setTask(updated);
      setDescriptionDraft(updated.description ?? "");
      return updated;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save task changes.");
      return null;
    }
  };

  const addSubtask = async () => {
    const title = newSubtaskTitle.trim();
    if (!title) {
      setIsAddingSubtask(false);
      return;
    }
    try {
      const created = await createSubtask(task.id, { title, priority: "no-priority", ...actor });
      setTask((current) => ({ ...current, subtasks: [...current.subtasks, created] }));
      setNewSubtaskTitle("");
      setIsAddingSubtask(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create subtask.");
    }
  };

  const addComment = async (body: string, parentId?: string) => {
    const trimmedBody = body.trim();
    if (!trimmedBody) {
      return;
    }
    try {
      const comment = await createTaskComment(task.id, {
        body: trimmedBody,
        authorName: profile.fullName,
        authorEmail: profile.email,
        authorAvatar: profile.avatarUrl,
        parentId,
      });
      setTask((current) => ({ ...current, comments: [...current.comments, comment] }));
      if (parentId) {
        setReplyDrafts((current) => ({ ...current, [parentId]: "" }));
      } else {
        setCommentDraft("");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to add comment.");
    }
  };

  const topLevelComments = task.comments.filter((comment) => !comment.parentId);
  const repliesByParent = task.comments.reduce<Record<string, TaskComment[]>>((groups, comment) => {
    if (comment.parentId) {
      groups[comment.parentId] = [...(groups[comment.parentId] ?? []), comment];
    }
    return groups;
  }, {});

  const assigneeName = task.assigneeName || profile.fullName;
  const assigneeInitials = task.assigneeInitials || profile.initials;
  const reporterName = task.reporterName || profile.fullName;

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] font-semibold tracking-[-0.035em] text-foreground sm:text-[30px]">{task.title}</h1>
          {isDescriptionEditing ? (
            <div className="mt-3 max-w-[680px]">
              <textarea value={descriptionDraft} onChange={(event) => setDescriptionDraft(event.target.value)} className="min-h-20 w-full rounded-[8px] border border-border bg-background p-3 text-[13px] text-foreground outline-none focus:border-foreground" placeholder="Add a task description..." autoFocus />
              <div className="mt-2 flex gap-2"><button type="button" onClick={() => { void persist({ description: descriptionDraft, ...actor }); setIsDescriptionEditing(false); }} className="h-8 rounded-[5px] bg-foreground px-3 text-[12px] font-medium text-background">Save</button><button type="button" onClick={() => { setDescriptionDraft(task.description ?? ""); setIsDescriptionEditing(false); }} className="h-8 rounded-[5px] border border-border px-3 text-[12px] font-medium text-foreground">Cancel</button></div>
            </div>
          ) : (
            <button type="button" onClick={() => setIsDescriptionEditing(true)} className="mt-2 block max-w-[680px] text-left text-[14px] leading-6 text-muted transition-colors hover:text-foreground">{task.description || "Add a task description..."}</button>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          {[LockKeyhole, Eye, Share2, MoreHorizontal, PanelRight].map((Icon, index) => <button key={index} type="button" className="inline-flex h-9 min-w-9 items-center justify-center rounded-[7px] border border-border bg-background px-2 text-muted transition-colors hover:bg-surface hover:text-foreground"><Icon className="h-4 w-4" /><span className="sr-only">Task action</span>{Icon === Eye ? <span className="ml-1 text-[11px] text-accent">1</span> : null}</button>)}
        </div>
      </div>

      {errorMessage ? <div className="mb-4 flex items-center justify-between gap-3 rounded-[8px] border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12px] text-red-700"><span>{errorMessage}</span><button type="button" onClick={() => setErrorMessage(null)}><X className="h-4 w-4" /></button></div> : null}

      <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1.62fr)_minmax(320px,0.84fr)]">
        <div className="min-w-0">
          <section className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[122px_minmax(0,1fr)] sm:items-center">
              <p className="text-[13px] text-muted">Properties</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-background px-3 text-[13px] text-foreground"><MemberAvatar assigneeName={assigneeName} assigneeInitials={assigneeInitials} /><span>{assigneeName}</span></span>
                <span className="inline-flex h-9 items-center gap-2 rounded-full bg-red-500/10 px-3 text-[13px] text-red-500"><CalendarDays className="h-3.5 w-3.5" />{formatDate(task.dueDate)}</span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[122px_minmax(0,1fr)] sm:items-center">
              <p className="text-[13px] text-muted">Labels</p>
              <div className="flex flex-wrap items-center gap-1.5">
                {task.labels.map((label) => <span key={label} className="inline-flex h-8 items-center gap-1 rounded-full border border-border bg-background px-2.5 text-[12px] text-foreground"><Tag className="h-3.5 w-3.5 text-muted" />{label}</span>)}
                <form onSubmit={(event) => { event.preventDefault(); const label = newLabel.trim(); if (label && !task.labels.includes(label)) { void persist({ labels: [...task.labels, label], ...actor }); setNewLabel(""); } }} className="inline-flex"><input id="task-detail-label-input" value={newLabel} onChange={(event) => setNewLabel(event.target.value)} className="h-8 w-20 rounded-full border border-dashed border-border bg-background px-2 text-[12px] text-foreground outline-none placeholder:text-muted focus:w-32" placeholder="+ Add" /></form>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[122px_minmax(0,1fr)] sm:items-center">
              <p className="text-[13px] text-muted">Resources</p>
              <form onSubmit={(event) => { event.preventDefault(); const resource = newResource.trim(); if (resource) { void persist({ resources: [...task.resources, resource], ...actor }); setNewResource(""); } }} className="flex max-w-[540px] gap-2"><input value={newResource} onChange={(event) => setNewResource(event.target.value)} className="h-11 min-w-0 flex-1 rounded-[9px] border border-dashed border-border bg-background px-3 text-[13px] text-foreground outline-none placeholder:text-muted focus:border-foreground" placeholder="+ Add document or link..." /><FilePlus2 className="mt-3 h-4 w-4 text-muted" /></form>
              {task.resources.length > 0 ? <div className="sm:col-start-2 flex flex-wrap gap-2">{task.resources.map((resource) => <a key={resource} href={resource.startsWith("http") ? resource : undefined} className="max-w-full truncate text-[12px] text-accent underline-offset-2 hover:underline">{resource}</a>)}</div> : null}
            </div>
          </section>

          <section className="mt-10">
            <div className="mb-3 flex items-center gap-2"><button type="button" onClick={() => setIsSubtasksOpen((current) => !current)} className="inline-flex h-7 w-7 items-center justify-center rounded-[5px] text-muted hover:bg-surface"><ChevronDown className={`h-4 w-4 transition-transform ${isSubtasksOpen ? "" : "-rotate-90"}`} /></button><h2 className="text-[16px] font-semibold text-foreground">Subtasks</h2></div>
            {isSubtasksOpen ? <div className="overflow-x-auto rounded-[14px] border border-border bg-background"><div className="min-w-[670px]">
              <div className="grid grid-cols-[minmax(180px,1.3fr)_132px_150px_150px_88px] items-center border-b border-border px-5 py-4 text-[13px] font-medium text-foreground"><span>Task</span><span>Priority</span><span>Members</span><span>Due Date</span><span className="text-right">Actions</span></div>
              {isAddingSubtask ? <div className="border-b border-border bg-surface px-5 py-2"><input value={newSubtaskTitle} onChange={(event) => setNewSubtaskTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void addSubtask(); } if (event.key === "Escape") { setNewSubtaskTitle(""); setIsAddingSubtask(false); } }} className="h-9 w-full rounded-[6px] bg-transparent px-1 text-[13px] text-foreground outline-none placeholder:text-muted" placeholder="+ Subtask title... (Enter to save, Esc to cancel)" autoFocus /></div> : null}
              {task.subtasks.map((subtask) => <SubtaskRow key={subtask.id} subtask={subtask} editing={editingSubtaskId === subtask.id} onStartEdit={() => setEditingSubtaskId(subtask.id)} onCancelEdit={() => setEditingSubtaskId(null)} onUpdate={async (input) => { const updated = await updateSubtask(task.id, subtask.id, { ...input, ...actor }); setTask((current) => ({ ...current, subtasks: current.subtasks.map((item) => item.id === updated.id ? updated : item) })); setEditingSubtaskId(null); }} onDelete={async () => { try { await deleteSubtask(task.id, subtask.id); setTask((current) => ({ ...current, subtasks: current.subtasks.filter((item) => item.id !== subtask.id) })); } catch (error) { setErrorMessage(error instanceof Error ? error.message : "Unable to delete subtask."); } }} />)}
              <button type="button" onClick={() => setIsAddingSubtask(true)} className="flex h-12 w-full items-center gap-2 px-5 text-[13px] text-muted transition-colors hover:bg-surface hover:text-foreground"><Plus className="h-4 w-4" />Add Subtask</button>
            </div></div> : null}
          </section>

          <section className="mt-8 border-t border-border pt-6">
            <div className="space-y-4">{topLevelComments.map((comment) => <CommentThread key={comment.id} comment={comment} replies={repliesByParent[comment.id] ?? []} replyDraft={replyDrafts[comment.id] ?? ""} onReplyDraftChange={(value) => setReplyDrafts((current) => ({ ...current, [comment.id]: value }))} onSubmitReply={() => void addComment(replyDrafts[comment.id] ?? "", comment.id)} />)}</div>
            <form onSubmit={(event) => { event.preventDefault(); void addComment(commentDraft); }} className="mt-5 flex items-end gap-2 rounded-[10px] border border-border bg-background p-2"><Avatar alt={profile.fullName} initials={profile.initials} src={profile.avatarUrl} sizeClassName="h-7 w-7" textClassName="text-[10px]" /><textarea value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void addComment(commentDraft); } }} className="min-h-8 flex-1 resize-none bg-transparent px-1.5 py-1 text-[13px] text-foreground outline-none placeholder:text-muted" placeholder="Add a comment..." /><button type="submit" className="inline-flex h-8 w-8 items-center justify-center rounded-[5px] text-muted transition-colors hover:bg-surface hover:text-foreground"><Send className="h-4 w-4" /></button></form>
          </section>
        </div>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-4 xl:self-start">
          <CollapsibleCard title="Details" open={isDetailsOpen} onToggle={() => setIsDetailsOpen((current) => !current)} action={<div className="flex items-center gap-1"><button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-[5px] text-muted hover:bg-surface"><Plus className="h-4 w-4" /></button><button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-[5px] text-muted hover:bg-surface"><Settings2 className="h-4 w-4" /></button></div>}>
            <div className="mt-2 space-y-3.5">
              <DetailRow label="Status"><DetailValueButton buttonRef={statusButtonRef} onClick={() => setActivePopover("status")}><StatusMark status={task.status} /><span className={statusOptions.find((option) => option.value === getWorkspaceTaskStatus(task.status))?.className}>{labelForStatus(task.status)}</span></DetailValueButton></DetailRow>
              <DetailRow label="Priority"><DetailValueButton buttonRef={priorityButtonRef} onClick={() => setActivePopover("priority")}><PriorityBars priority={task.priority} /><span className={priorityOptions.find((option) => option.value === task.priority)?.className}>{labelForPriority(task.priority)}</span></DetailValueButton></DetailRow>
              <DetailRow label="Members"><button type="button" onClick={() => void persist({ assigneeName: profile.fullName, assigneeInitials: profile.initials, ...actor })} className="inline-flex h-8 items-center gap-2 rounded-[7px] px-2 text-[13px] hover:bg-surface"><Avatar alt={assigneeName} initials={assigneeInitials} sizeClassName="h-6 w-6" textClassName="text-[10px]" /><span>{assigneeName}</span><UserPlus className="h-4 w-4 text-muted" /></button></DetailRow>
              <DetailRow label="Dates"><div className="flex min-w-0 flex-wrap items-center gap-1"><button ref={startButtonRef} type="button" onClick={() => setActivePopover("start")} className="h-8 max-w-[132px] truncate rounded-full border border-border px-3 text-[12px] text-muted hover:bg-surface">{task.startDate ? formatDate(task.startDate) : "+ Start"}</button><ChevronRight className="h-3.5 w-3.5 text-muted" /><button ref={dueButtonRef} type="button" onClick={() => setActivePopover("due")} className="h-8 max-w-[132px] truncate rounded-full border border-border px-3 text-[12px] text-foreground hover:bg-surface">{task.dueDate ? formatDate(task.dueDate) : "+ Due"}</button></div></DetailRow>
              <DetailRow label="Labels"><div className="flex flex-wrap gap-1">{task.labels.map((label) => <span key={label} className="inline-flex h-7 items-center rounded-full border border-border px-2 text-[11px] text-muted">{label}</span>)}<button type="button" onClick={() => document.getElementById("task-detail-label-input")?.focus()} className="inline-flex h-7 items-center rounded-full border border-dashed border-border px-2 text-[11px] text-muted hover:bg-surface">+ Add</button></div></DetailRow>
              <DetailRow label="Teams"><div className="flex flex-wrap gap-1">{task.teams.map((team) => <span key={team} className="inline-flex h-7 items-center gap-1 rounded-full border border-border px-2 text-[11px] text-muted"><UsersRound className="h-3 w-3" />{team}</span>)}<input value={newTeam} onChange={(event) => setNewTeam(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); const team = newTeam.trim(); if (team && !task.teams.includes(team)) { void persist({ teams: [...task.teams, team], ...actor }); setNewTeam(""); } } }} className="h-7 w-14 rounded-full border border-dashed border-border bg-transparent px-2 text-[11px] outline-none placeholder:text-muted focus:w-24" placeholder="+ Add" /></div></DetailRow>
              <DetailRow label="Reporter"><div className="inline-flex items-center gap-2 px-2 text-[13px] text-foreground"><Avatar alt={reporterName} initials={getInitials(reporterName)} src={task.reporterAvatar} sizeClassName="h-6 w-6" textClassName="text-[10px]" />{reporterName}</div></DetailRow>
            </div>
          </CollapsibleCard>
          <CollapsibleCard title="Updates" open={isUpdatesOpen} onToggle={() => setIsUpdatesOpen((current) => !current)}><div className="mt-1 divide-y divide-border/70">{task.activities.length > 0 ? task.activities.map((activity) => <ActivityRow key={activity.id} activity={activity} />) : <p className="py-3 text-[12px] text-muted">Changes to this task will appear here.</p>}</div></CollapsibleCard>
        </aside>
      </div>

      <FloatingPopover open={activePopover === "status"} anchorRef={statusButtonRef} onClose={() => setActivePopover(null)} width={250}><div className="p-1">{statusOptions.map((option) => <button key={option.value} type="button" onClick={() => { void persist({ status: option.value, ...actor }); setActivePopover(null); }} className={`flex h-10 w-full items-center gap-2 rounded-[7px] px-2 text-left text-[13px] transition-colors hover:bg-surface ${getWorkspaceTaskStatus(task.status) === option.value ? "bg-surface" : ""}`}><StatusMark status={option.value} /><span className={`flex-1 ${option.className}`}>{option.label}</span>{getWorkspaceTaskStatus(task.status) === option.value ? <Check className="h-4 w-4" /> : null}</button>)}</div></FloatingPopover>
      <FloatingPopover open={activePopover === "priority"} anchorRef={priorityButtonRef} onClose={() => setActivePopover(null)} width={250}><div className="p-1">{priorityOptions.map((option) => <button key={option.value} type="button" onClick={() => { void persist({ priority: option.value, ...actor }); setActivePopover(null); }} className={`flex h-10 w-full items-center gap-2 rounded-[7px] px-2 text-left text-[13px] transition-colors hover:bg-surface ${task.priority === option.value ? "bg-surface" : ""}`}><PriorityBars priority={option.value} /><span className={`flex-1 ${option.className}`}>{option.label}</span>{task.priority === option.value ? <Check className="h-4 w-4" /> : null}</button>)}</div></FloatingPopover>
      <FloatingPopover open={activePopover === "start"} anchorRef={startButtonRef} onClose={() => setActivePopover(null)} width={320}><CalendarPicker value={task.startDate} onSelect={(startDate) => { void persist({ startDate, ...actor }); setActivePopover(null); }} /></FloatingPopover>
      <FloatingPopover open={activePopover === "due"} anchorRef={dueButtonRef} onClose={() => setActivePopover(null)} width={320}><CalendarPicker value={task.dueDate} onSelect={(dueDate) => { void persist({ dueDate, ...actor }); setActivePopover(null); }} /></FloatingPopover>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return <div className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-2"><span className="pt-1.5 text-[13px] text-muted">{label}</span><div className="min-w-0">{children}</div></div>;
}

function SubtaskRow({
  subtask,
  editing,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
}: {
  subtask: Subtask;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (input: Partial<SubtaskWriteInput>) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [title, setTitle] = useState(subtask.title);
  const [priority, setPriority] = useState<TaskPriority>(subtask.priority);
  const [dueDate, setDueDate] = useState(toDateId(subtask.dueDate) ?? "");

  if (editing) {
    return <div className="grid grid-cols-[minmax(180px,1.3fr)_132px_150px_150px_88px] items-center gap-2 border-b border-border bg-surface px-5 py-2"><input value={title} onChange={(event) => setTitle(event.target.value)} className="h-8 rounded-[5px] border border-border bg-background px-2 text-[12px] outline-none" autoFocus /><select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)} className="h-8 rounded-[5px] border border-border bg-background px-2 text-[12px]">{priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><span className="text-[12px] text-muted">{subtask.assigneeName ?? "Unassigned"}</span><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="h-8 rounded-[5px] border border-border bg-background px-2 text-[12px]" /><div className="flex justify-end gap-1"><button type="button" onClick={() => void onUpdate({ title, priority, dueDate })} className="inline-flex h-7 items-center rounded-[4px] bg-foreground px-2 text-[11px] text-background">Save</button><button type="button" onClick={onCancelEdit} className="inline-flex h-7 items-center rounded-[4px] border border-border px-2 text-[11px]">Cancel</button></div></div>;
  }

  return <div className="grid grid-cols-[minmax(180px,1.3fr)_132px_150px_150px_88px] items-center border-b border-border px-5 py-3"><span className="truncate text-[13px] font-medium text-foreground">{subtask.title}</span><span className={`inline-flex items-center gap-1.5 text-[12px] ${priorityOptions.find((option) => option.value === subtask.priority)?.className}`}><PriorityBars priority={subtask.priority} />{labelForPriority(subtask.priority)}</span><MemberAvatar assigneeName={subtask.assigneeName} assigneeInitials={subtask.assigneeInitials} /><span className="text-[12px] text-muted">{formatDate(subtask.dueDate)}</span><div className="flex justify-end gap-1"><button type="button" onClick={onStartEdit} className="inline-flex h-7 w-7 items-center justify-center rounded-[5px] text-muted hover:bg-surface"><Pencil className="h-3.5 w-3.5" /></button><button type="button" onClick={() => void onDelete()} className="inline-flex h-7 w-7 items-center justify-center rounded-[5px] text-muted hover:bg-red-500/10 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></div></div>;
}

function CommentThread({
  comment,
  replies,
  replyDraft,
  onReplyDraftChange,
  onSubmitReply,
}: {
  comment: TaskComment;
  replies: TaskComment[];
  replyDraft: string;
  onReplyDraftChange: (value: string) => void;
  onSubmitReply: () => void;
}) {
  return <article className="rounded-[12px] border border-border bg-background p-3"><div className="flex items-start gap-2.5"><Avatar alt={comment.authorName} initials={getInitials(comment.authorName)} src={comment.authorAvatar} sizeClassName="h-7 w-7" textClassName="text-[10px]" /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-[13px] font-medium text-foreground">{comment.authorName}</span><span className="text-[11px] text-muted">{formatActivityDate(comment.createdAt)}</span><MoreHorizontal className="ml-auto h-4 w-4 text-muted" /></div><p className="mt-2 whitespace-pre-wrap text-[13px] leading-5 text-foreground">{comment.body}</p>{replies.map((reply) => <div key={reply.id} className="mt-3 flex gap-2 border-l border-border pl-3"><Avatar alt={reply.authorName} initials={getInitials(reply.authorName)} src={reply.authorAvatar} sizeClassName="h-6 w-6" textClassName="text-[9px]" /><div><p className="text-[12px] font-medium text-foreground">{reply.authorName}</p><p className="mt-1 text-[12px] text-muted">{reply.body}</p></div></div>)}<form onSubmit={(event) => { event.preventDefault(); onSubmitReply(); }} className="mt-3 flex items-center gap-2"><input value={replyDraft} onChange={(event) => onReplyDraftChange(event.target.value)} className="h-9 min-w-0 flex-1 rounded-[6px] border border-border bg-background px-3 text-[12px] outline-none placeholder:text-muted focus:border-foreground" placeholder="Leave a reply..." /><button type="submit" className="inline-flex h-8 w-8 items-center justify-center rounded-[5px] text-muted hover:bg-surface"><Send className="h-4 w-4" /></button></form></div></div></article>;
}
