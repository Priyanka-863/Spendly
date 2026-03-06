import Text "mo:core/Text";
import List "mo:core/List";
import Float "mo:core/Float";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  type Expense = {
    id : Nat;
    name : Text;
    amount : Float;
    category : Text;
    paymentMode : Text;
    date : Text;
    month : Text;
    createdAt : Time.Time;
  };

  type Investment = {
    id : Nat;
    investmentType : Text;
    amount : Float;
    date : Text;
    month : Text;
    notes : ?Text;
    createdAt : Time.Time;
  };

  type Budget = {
    month : Text;
    amount : Float;
  };

  type ExpenseUpdateData = {
    id : Nat;
    name : Text;
    amount : Float;
    category : Text;
    paymentMode : Text;
    date : Text;
    month : Text;
  };

  module ExpenseUpdateData {
    public func fromExpense(expense : Expense) : ExpenseUpdateData {
      {
        id = expense.id;
        name = expense.name;
        amount = expense.amount;
        category = expense.category;
        paymentMode = expense.paymentMode;
        date = expense.date;
        month = expense.month;
      };
    };
  };

  type UserData = {
    expenses : Map.Map<Nat, Expense>;
    investments : Map.Map<Nat, Investment>;
    budgets : Map.Map<Text, Budget>;
    expenseCounter : Nat;
    investmentCounter : Nat;
  };

  let users = Map.empty<Principal, UserData>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  func getUserData(caller : Principal) : UserData {
    switch (users.get(caller)) {
      case (null) {
        let newData = {
          expenses = Map.empty<Nat, Expense>();
          investments = Map.empty<Nat, Investment>();
          budgets = Map.empty<Text, Budget>();
          expenseCounter = 0;
          investmentCounter = 0;
        };
        users.add(caller, newData);
        newData;
      };
      case (?data) { data };
    };
  };

  func getUserDataReadOnly(caller : Principal) : ?UserData {
    users.get(caller);
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Expense Management
  public shared ({ caller }) func addExpense(name : Text, amount : Float, category : Text, paymentMode : Text, date : Text, month : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add expenses");
    };
    let userData = getUserData(caller);
    let newId = userData.expenseCounter + 1;

    let expense = {
      id = newId;
      name;
      amount;
      category;
      paymentMode;
      date;
      month;
      createdAt = Time.now();
    };

    userData.expenses.add(newId, expense);
    users.add(
      caller,
      {
        userData with
        expenseCounter = newId;
      },
    );
    newId;
  };

  public shared ({ caller }) func updateExpense(expenseData : ExpenseUpdateData) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update expenses");
    };
    let userData = getUserData(caller);
    switch (userData.expenses.get(expenseData.id)) {
      case (null) {
        Runtime.trap("Expense not found");
      };
      case (?existing) {
        let updatedExpense = {
          id = expenseData.id;
          name = expenseData.name;
          amount = expenseData.amount;
          category = expenseData.category;
          paymentMode = expenseData.paymentMode;
          date = expenseData.date;
          month = expenseData.month;
          createdAt = existing.createdAt;
        };
        userData.expenses.add(expenseData.id, updatedExpense);
      };
    };
  };

  public shared ({ caller }) func deleteExpense(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete expenses");
    };
    let userData = getUserData(caller);
    if (not userData.expenses.containsKey(id)) {
      Runtime.trap("Expense does not exist");
    };
    userData.expenses.remove(id);
  };

  // Investment Management
  public shared ({ caller }) func addInvestment(investmentType : Text, amount : Float, date : Text, month : Text, notes : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add investments");
    };
    let userData = getUserData(caller);
    let newId = userData.investmentCounter + 1;

    let investment = {
      id = newId;
      investmentType;
      amount;
      date;
      month;
      notes;
      createdAt = Time.now();
    };

    userData.investments.add(newId, investment);
    users.add(
      caller,
      {
        userData with
        investmentCounter = newId;
      },
    );
    newId;
  };

  public shared ({ caller }) func deleteInvestment(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete investments");
    };
    let userData = getUserData(caller);
    if (not userData.investments.containsKey(id)) {
      Runtime.trap("Investment does not exist");
    };
    userData.investments.remove(id);
  };

  // Budget Management
  public shared ({ caller }) func setBudget(month : Text, amount : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set budgets");
    };
    let userData = getUserData(caller);
    let budget = { month; amount };
    userData.budgets.add(month, budget);
  };

  // Query Functions
  public query ({ caller }) func getExpensesByMonth(month : Text) : async [Expense] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expenses");
    };
    switch (getUserDataReadOnly(caller)) {
      case (null) { [] };
      case (?userData) {
        let expenses = List.empty<Expense>();
        userData.expenses.values().forEach(
          func(expense) {
            if (expense.month == month) {
              expenses.add(expense);
            };
          }
        );
        expenses.toArray();
      };
    };
  };

  public query ({ caller }) func getInvestmentsByMonth(month : Text) : async [Investment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view investments");
    };
    switch (getUserDataReadOnly(caller)) {
      case (null) { [] };
      case (?userData) {
        let investments = List.empty<Investment>();
        userData.investments.values().forEach(
          func(investment) {
            if (investment.month == month) {
              investments.add(investment);
            };
          }
        );
        investments.toArray();
      };
    };
  };

  public query ({ caller }) func getBudgetByMonth(month : Text) : async ?Budget {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view budgets");
    };
    switch (getUserDataReadOnly(caller)) {
      case (null) { null };
      case (?userData) {
        userData.budgets.get(month);
      };
    };
  };

  public query ({ caller }) func getAllMonthsWithActivity() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view activity");
    };
    switch (getUserDataReadOnly(caller)) {
      case (null) { [] };
      case (?userData) {
        let months = List.empty<Text>();

        userData.expenses.values().forEach(
          func(expense) {
            months.add(expense.month);
          }
        );

        userData.investments.values().forEach(
          func(investment) {
            months.add(investment.month);
          }
        );

        months.toArray();
      };
    };
  };

  public query ({ caller }) func getAllExpenses() : async [Expense] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expenses");
    };
    switch (getUserDataReadOnly(caller)) {
      case (null) { [] };
      case (?userData) {
        userData.expenses.values().toArray();
      };
    };
  };

  public query ({ caller }) func getAllInvestments() : async [Investment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view investments");
    };
    switch (getUserDataReadOnly(caller)) {
      case (null) { [] };
      case (?userData) {
        userData.investments.values().toArray();
      };
    };
  };
};
