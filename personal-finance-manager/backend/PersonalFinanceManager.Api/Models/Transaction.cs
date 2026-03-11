namespace PersonalFinanceManager.Api.Models;

public class Transaction
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public DateOnly Date { get; set; }
    public DateTime CreatedAt { get; set; }

    public Category Category { get; set; } = null!;
}
