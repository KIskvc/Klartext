using PersonalFinanceManager.Api.Models;

namespace PersonalFinanceManager.Api.DTOs;

public class TransactionResponse
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public CategoryType CategoryType { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public DateOnly Date { get; set; }
    public DateTime CreatedAt { get; set; }
}
