import { NextRequest, NextResponse } from "next/server";
import { getDbInstance, isFirebaseConfigured } from "@/lib/firebase";
import { DashboardStats, Lead, Task } from "@/lib/types";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { DUMMY_DASHBOARD_STATS } from "@/lib/dummy-data";

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const isGuest = searchParams.get("guest") === "true";

    // Return dummy data for guest mode
    if (isGuest || !isFirebaseConfigured) {
      return NextResponse.json({ stats: DUMMY_DASHBOARD_STATS });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const db = getDbInstance();

    // Get date ranges
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Query leads
    const leadsRef = collection(db, "leads");
    const userLeadsQuery = query(
      leadsRef,
      where("user_id", "==", userId),
      orderBy("created_at", "desc"),
      limit(100),
    );
    const leadsSnapshot = await getDocs(userLeadsQuery);

    let totalLeads = 0;
    let hotLeads = 0;
    let warmLeads = 0;
    let coldLeads = 0;
    let closedWon = 0;
    const leadsByStatus: Record<string, number> = {};
    const leadsBySource: Record<string, number> = {};
    const recentLeads: Lead[] = [];

    leadsSnapshot.forEach((doc) => {
      const lead = doc.data() as Lead;
      lead.id = doc.id;
      totalLeads++;

      // Count by priority
      if (lead.lead_priority === "HOT") hotLeads++;
      else if (lead.lead_priority === "WARM") warmLeads++;
      else coldLeads++;

      // Count by status
      leadsByStatus[lead.status] = (leadsByStatus[lead.status] || 0) + 1;

      // Count by source
      leadsBySource[lead.source] = (leadsBySource[lead.source] || 0) + 1;

      // Count closed won
      if (lead.status === "closed_won") {
        closedWon++;
      }

      // Add to recent leads (first 5)
      if (recentLeads.length < 5) {
        recentLeads.push(lead);
      }
    });

    // Query tasks due today
    const tasksRef = collection(db, "tasks");
    const userTasksQuery = query(
      tasksRef,
      where("user_id", "==", userId),
      where("status", "==", "pending"),
    );
    const tasksSnapshot = await getDocs(userTasksQuery);

    let followupsDueToday = 0;
    const dueTasks: Task[] = [];

    tasksSnapshot.forEach((doc) => {
      const task = doc.data() as Task;
      task.id = doc.id;

      const dueDate =
        task.due_date?.toDate?.() ||
        new Date(task.due_date as unknown as string);
      if (dueDate >= startOfDay && dueDate < endOfDay) {
        followupsDueToday++;
        dueTasks.push(task);
      }
    });

    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? (closedWon / totalLeads) * 100 : 0;

    const stats: DashboardStats = {
      total_leads: totalLeads,
      hot_leads: hotLeads,
      warm_leads: warmLeads,
      cold_leads: coldLeads,
      followups_due_today: followupsDueToday,
      conversion_rate: Math.round(conversionRate * 100) / 100,
      leads_by_source: leadsBySource as Record<string, number>,
      leads_by_status: leadsByStatus as Record<string, number>,
      recent_leads: recentLeads,
      due_tasks: dueTasks,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
