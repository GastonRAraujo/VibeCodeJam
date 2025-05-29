"use client";

import type { Reminder } from '@/types/reminder';
import { ReminderCard } from './ReminderCard';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

interface ReminderListProps {
  reminders: Reminder[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (reminder: Reminder) => void;
  onDelete: (reminderId: string) => void;
  onAddNew: () => void;
  onComplete: (reminderId: string) => void;
  onSnooze: (reminderId: string) => void;
  isCompleting: boolean;
  isSnoozing: boolean;
}

export function ReminderList({ 
  reminders, 
  isLoading, 
  error, 
  onEdit, 
  onDelete, 
  onAddNew,
  onComplete,
  onSnooze,
  isCompleting,
  isSnoozing
}: ReminderListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading reminders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="mt-4 text-lg text-destructive">Error loading reminders: {error.message}</p>
        <p className="text-sm text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Image 
          src="https://placehold.co/300x200.png" 
          alt="No reminders illustration" 
          width={300} 
          height={200}
          className="opacity-70 rounded-lg shadow-md"
          data-ai-hint="empty state checklist"
        />
        <h3 className="mt-8 text-2xl font-semibold text-foreground">No Reminders Yet!</h3>
        <p className="mt-2 text-muted-foreground">Looks like your schedule is clear. Add a new reminder to get started.</p>
        <Button onClick={onAddNew} className="mt-6 bg-accent hover:bg-accent/90">
          Add Your First Reminder
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {reminders.map((reminder) => (
        <ReminderCard 
          key={reminder.id} 
          reminder={reminder} 
          onEdit={onEdit} 
          onDelete={onDelete}
          onComplete={onComplete}
          onSnooze={onSnooze}
          isCompleting={isCompleting}
          isSnoozing={isSnoozing}
        />
      ))}
    </div>
  );
}
