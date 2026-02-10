import { NextRequest, NextResponse } from "next/server";
import { getDbInstance, isFirebaseConfigured } from "@/lib/firebase";
import { Lead, LeadStatus, LeadSource, LeadPriority } from "@/lib/types";
import { calculateInitialScore, getLeadPriority } from "@/lib/lead-scoring";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";

// GET /api/leads - Fetch all leads for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status") as LeadStatus | null;
    const source = searchParams.get("source") as LeadSource | null;
    const limitCount = parseInt(searchParams.get("limit") || "50");

    if (!isFirebaseConfigured) {
      return NextResponse.json(
        { error: "Firebase not configured" },
        { status: 500 },
      );
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const db = getDbInstance();
    const leadsQuery = query(
      collection(db, "leads"),
      where("user_id", "==", userId),
      orderBy("created_at", "desc"),
      limit(limitCount),
    );

    // Note: Firestore requires composite indexes for multiple where clauses
    // For production, you'd need to create these indexes

    const snapshot = await getDocs(leadsQuery);
    const leads: Lead[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      leads.push({
        id: doc.id,
        ...data,
        created_at:
          data.created_at?.toDate?.()?.toISOString() || data.created_at,
        updated_at:
          data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
      } as Lead);
    });

    // Filter in memory if status/source provided (for simplicity)
    let filteredLeads = leads;
    if (status) {
      filteredLeads = filteredLeads.filter((l) => l.status === status);
    }
    if (source) {
      filteredLeads = filteredLeads.filter((l) => l.source === source);
    }

    return NextResponse.json({ leads: filteredLeads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 },
    );
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    if (!isFirebaseConfigured) {
      return NextResponse.json(
        { error: "Firebase not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const {
      userId,
      name,
      phone,
      email,
      source,
      budget,
      location,
      property_type,
      notes,
    } = body;

    if (!userId || !name || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Calculate lead score and priority
    const leadSource = (source || "manual") as LeadSource;
    const score = calculateInitialScore(leadSource, !!budget);
    const priority: LeadPriority = getLeadPriority(score);

    const leadData = {
      user_id: userId,
      name,
      phone,
      email: email || null,
      source: leadSource,
      budget: budget ? Number(budget) : null,
      location: location || null,
      property_type: property_type || null,
      notes: notes || null,
      status: "new" as LeadStatus,
      score,
      priority,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    };

    const db = getDbInstance();
    const docRef = await addDoc(collection(db, "leads"), leadData);

    return NextResponse.json({
      success: true,
      lead: { id: docRef.id, ...leadData },
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 },
    );
  }
}
