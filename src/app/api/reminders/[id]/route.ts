import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { 
  reminders as dbReminders, 
  userData,
  saveUserData,
  SNOOZE_PENALTY,
  QUICK_COMPLETION_WINDOW_MINUTES,
  QUICK_COMPLETION_BONUS_XP,
  STREAK_BONUS_XP_PER_CONSECUTIVE_DAY,
  DEFAULT_REMINDER_ICON,
  getTodayDateString,
  getYesterdayDateString
} from '@/lib/db';
import type { Reminder, CompletionDetails } from '@/types/reminder';
import { differenceInMinutes, parseISO } from 'date-fns';


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const reminder = dbReminders.find(r => r.id === id);
  await new Promise(resolve => setTimeout(resolve, 300));
  if (reminder) {
    return NextResponse.json(reminder);
  }
  return NextResponse.json({ message: 'Reminder not found' }, { status: 404 });
}


export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  const id = await Promise.resolve(context.params.id);
  try {
    const body = await request.json();
    const reminderIndex = dbReminders.findIndex(r => r.id === id);

    if (reminderIndex === -1) {
      return NextResponse.json({ message: 'Reminder not found' }, { status: 404 });
    }

    const reminderToUpdate = dbReminders[reminderIndex];
    let completionDetails: CompletionDetails | undefined = undefined;

    if (body.action) {
      if (body.action === 'complete' && !reminderToUpdate.completed) {
        reminderToUpdate.completed = true;
        
        let xpEarnedBase = reminderToUpdate.xpValue;
        let xpEarnedQuickBonus = 0;
        let xpEarnedStreakBonus = 0;
        
        // Quick Completion Bonus
        const now = new Date();
        const createdAt = parseISO(reminderToUpdate.createdAt);
        if (reminderToUpdate.frequency === 'Once' && differenceInMinutes(now, createdAt) <= QUICK_COMPLETION_WINDOW_MINUTES) {
          xpEarnedQuickBonus = QUICK_COMPLETION_BONUS_XP;
        }

        // Streak Bonus
        const todayStr = getTodayDateString();
        const yesterdayStr = getYesterdayDateString();

        if (userData.lastCompletionDate === yesterdayStr) {
          userData.currentStreak += 1;
        } else if (userData.lastCompletionDate !== todayStr) {
          // Streak broken or first completion of a new streak period
          userData.currentStreak = 1;
        }

        if (userData.currentStreak > 1) {
          xpEarnedStreakBonus = (userData.currentStreak - 1) * STREAK_BONUS_XP_PER_CONSECUTIVE_DAY;
        }
        userData.lastCompletionDate = todayStr;

        const totalXpFromThisCompletion = xpEarnedBase + xpEarnedQuickBonus + xpEarnedStreakBonus;
        userData.xp += totalXpFromThisCompletion;
        
        // Save userData to localStorage
        saveUserData();

        let bonusMessage = `You earned ${xpEarnedBase} XP!`;
        if (xpEarnedQuickBonus > 0) bonusMessage += ` +${xpEarnedQuickBonus} XP (Quick Completion!)`;
        if (xpEarnedStreakBonus > 0) bonusMessage += ` +${xpEarnedStreakBonus} XP (${userData.currentStreak}-day streak!)`;
        if (xpEarnedQuickBonus > 0 || xpEarnedStreakBonus > 0) bonusMessage += ` Total: ${totalXpFromThisCompletion} XP.`;

        completionDetails = {
          xpEarned: {
            base: xpEarnedBase,
            quickBonus: xpEarnedQuickBonus,
            streakBonus: xpEarnedStreakBonus,
            total: totalXpFromThisCompletion,
          },
          newStreak: userData.currentStreak,
          bonusMessage: bonusMessage,
        };

        // Update the reminder with the new XP value
        dbReminders[reminderIndex] = {
          ...reminderToUpdate,
          completed: true,
          xpValue: totalXpFromThisCompletion
        };

      } else if (body.action === 'snooze' && !reminderToUpdate.completed) {
        userData.xp = Math.max(0, userData.xp - SNOOZE_PENALTY);
        // Reset streak on snooze
        const oldStreak = userData.currentStreak;
        userData.currentStreak = 0;
        userData.lastCompletionDate = null; 
        
        // Save userData to localStorage
        saveUserData();

        completionDetails = {
         xpEarned: { base: -SNOOZE_PENALTY, quickBonus: 0, streakBonus: 0, total: -SNOOZE_PENALTY },
         newStreak: 0,
         bonusMessage: `Reminder snoozed. You lost ${SNOOZE_PENALTY} XP. ${oldStreak > 1 ? `Your ${oldStreak}-day streak was reset.` : ''}`.trim(),
        };
      }
    } else {
      // Regular update for reminder fields if no action
      const { completed, xpValue, ...updateData } = body; 
      const updatedIcon = updateData.icon || reminderToUpdate.icon || DEFAULT_REMINDER_ICON;
      dbReminders[reminderIndex] = { ...reminderToUpdate, ...updateData, icon: updatedIcon };
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    return NextResponse.json({ 
      reminder: dbReminders[reminderIndex], 
      completionDetails,
      userData: { xp: userData.xp, currentStreak: userData.currentStreak }
    });

  } catch (error) {
    console.error("Failed to update reminder:", error);
    return NextResponse.json({ message: "Error updating reminder", error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const id = await Promise.resolve(context.params.id);
  
  // Find the reminder before deleting it
  const reminderToDelete = dbReminders.find(r => r.id === id);
  if (!reminderToDelete) {
    return NextResponse.json(
      { message: 'Reminder not found' },
      { status: 404 }
    );
  }

  // Store the title before deletion
  const deletedTitle = reminderToDelete.title;
  
  // Remove the reminder from the array
  const index = dbReminders.findIndex(r => r.id === id);
  if (index !== -1) {
    dbReminders.splice(index, 1);
  }

  return NextResponse.json(
    { 
      message: 'Reminder deleted successfully',
      deletedTitle: deletedTitle
    },
    { status: 200 }
  );
}
