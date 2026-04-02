import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MonthlyEntry, computeEntry } from "@/lib/financial-data";

// Shape returned from the DB
interface TrackingRow {
  id: string;
  month: string;
  mrr: number;
  costs: number;
  draw: number;
  trust_percent: number;
  created_at: string | null;
  user_id: string | null;
}

function rowToEntry(row: TrackingRow): MonthlyEntry {
  return {
    id: row.id,
    month: row.month,
    mrr: row.mrr,
    costs: row.costs,
    draw: row.draw,
    trustPercent: row.trust_percent,
  };
}

function entryToInsert(entry: MonthlyEntry, userId: string) {
  return {
    id: entry.id,
    month: entry.month,
    mrr: entry.mrr,
    costs: entry.costs,
    draw: entry.draw,
    trust_percent: entry.trustPercent,
    user_id: userId,
  };
}

const QUERY_KEY = ["tracking_model"];

export function useTrackingModel() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: rawEntries = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    enabled: !!user,
    queryFn: async (): Promise<MonthlyEntry[]> => {
      const { data, error } = await supabase
        .from("tracking_model")
        .select("*")
        .order("month", { ascending: true });
      if (error) throw error;
      return (data as TrackingRow[]).map(rowToEntry);
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (entry: MonthlyEntry) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("tracking_model")
        .upsert(entryToInsert(entry, user.id), { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tracking_model").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const bulkUpsert = useCallback(
    async (entries: MonthlyEntry[]) => {
      if (!user) return;
      const { error } = await supabase
        .from("tracking_model")
        .upsert(entries.map((e) => entryToInsert(e, user.id)), { onConflict: "id" });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
    [user, qc]
  );

  const entries = rawEntries.map(computeEntry);

  return {
    rawEntries,
    entries,
    isLoading,
    upsertEntry: upsertMutation.mutateAsync,
    deleteEntry: deleteMutation.mutateAsync,
    bulkUpsert,
  };
}
