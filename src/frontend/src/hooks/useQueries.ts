import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Budget,
  Expense,
  ExpenseUpdateData,
  Investment,
} from "../backend.d";
import { useActor } from "./useActor";

export function useExpensesByMonth(month: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Expense[]>({
    queryKey: ["expenses", month],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExpensesByMonth(month);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useInvestmentsByMonth(month: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Investment[]>({
    queryKey: ["investments", month],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInvestmentsByMonth(month);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllExpenses() {
  const { actor, isFetching } = useActor();
  return useQuery<Expense[]>({
    queryKey: ["expenses", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllExpenses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllInvestments() {
  const { actor, isFetching } = useActor();
  return useQuery<Investment[]>({
    queryKey: ["investments", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInvestments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBudgetByMonth(month: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Budget | null>({
    queryKey: ["budget", month],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBudgetByMonth(month);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllMonthsWithActivity() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["months"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMonthsWithActivity();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      amount,
      category,
      paymentMode,
      date,
      month,
    }: {
      name: string;
      amount: number;
      category: string;
      paymentMode: string;
      date: string;
      month: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addExpense(name, amount, category, paymentMode, date, month);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["expenses", variables.month],
      });
      queryClient.invalidateQueries({ queryKey: ["expenses", "all"] });
      queryClient.invalidateQueries({ queryKey: ["months"] });
    },
  });
}

export function useUpdateExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expenseData: ExpenseUpdateData) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateExpense(expenseData);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["expenses", variables.month],
      });
      queryClient.invalidateQueries({ queryKey: ["expenses", "all"] });
    },
  });
}

export function useDeleteExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      month: _month,
    }: { id: bigint; month: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteExpense(id);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["expenses", variables.month],
      });
      queryClient.invalidateQueries({ queryKey: ["expenses", "all"] });
      queryClient.invalidateQueries({ queryKey: ["months"] });
    },
  });
}

export function useAddInvestment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      investmentType,
      amount,
      date,
      month,
      notes,
    }: {
      investmentType: string;
      amount: number;
      date: string;
      month: string;
      notes: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addInvestment(investmentType, amount, date, month, notes);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["investments", variables.month],
      });
      queryClient.invalidateQueries({ queryKey: ["investments", "all"] });
      queryClient.invalidateQueries({ queryKey: ["months"] });
    },
  });
}

export function useDeleteInvestment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      month: _month,
    }: { id: bigint; month: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteInvestment(id);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["investments", variables.month],
      });
      queryClient.invalidateQueries({ queryKey: ["investments", "all"] });
      queryClient.invalidateQueries({ queryKey: ["months"] });
    },
  });
}

export function useSetBudget() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      month,
      amount,
    }: { month: string; amount: number }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setBudget(month, amount);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budget", variables.month] });
    },
  });
}
