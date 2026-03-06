import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ExpenseUpdateData {
    id: bigint;
    month: string;
    date: string;
    name: string;
    paymentMode: string;
    category: string;
    amount: number;
}
export type Time = bigint;
export interface Investment {
    id: bigint;
    month: string;
    date: string;
    createdAt: Time;
    notes?: string;
    investmentType: string;
    amount: number;
}
export interface Expense {
    id: bigint;
    month: string;
    date: string;
    name: string;
    createdAt: Time;
    paymentMode: string;
    category: string;
    amount: number;
}
export interface UserProfile {
    name: string;
}
export interface Budget {
    month: string;
    amount: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addExpense(name: string, amount: number, category: string, paymentMode: string, date: string, month: string): Promise<bigint>;
    addInvestment(investmentType: string, amount: number, date: string, month: string, notes: string | null): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteExpense(id: bigint): Promise<void>;
    deleteInvestment(id: bigint): Promise<void>;
    getAllExpenses(): Promise<Array<Expense>>;
    getAllInvestments(): Promise<Array<Investment>>;
    getAllMonthsWithActivity(): Promise<Array<string>>;
    getBudgetByMonth(month: string): Promise<Budget | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExpensesByMonth(month: string): Promise<Array<Expense>>;
    getInvestmentsByMonth(month: string): Promise<Array<Investment>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setBudget(month: string, amount: number): Promise<void>;
    updateExpense(expenseData: ExpenseUpdateData): Promise<void>;
}
