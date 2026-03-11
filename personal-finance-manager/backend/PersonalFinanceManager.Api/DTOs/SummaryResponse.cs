using PersonalFinanceManager.Api.Models;

namespace PersonalFinanceManager.Api.DTOs;

public class SummaryResponse
{
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal Balance { get; set; }
    public List<CategoryBreakdown> CategoryBreakdowns { get; set; } = [];
    public TopExpenseCategory? HighestExpenseCategory { get; set; }
}

public class CategoryBreakdown
{
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public CategoryType CategoryType { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal? BudgetAmount { get; set; }

    /// <summary>Budget - TotalAmount. Negative means over budget.</summary>
    public decimal? BudgetDifference { get; set; }
}

public class TopExpenseCategory
{
    public string CategoryName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
