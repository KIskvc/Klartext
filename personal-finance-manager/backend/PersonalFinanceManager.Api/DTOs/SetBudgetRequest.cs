using System.ComponentModel.DataAnnotations;

namespace PersonalFinanceManager.Api.DTOs;

public class SetBudgetRequest
{
    public Guid CategoryId { get; set; }

    [Range(2020, 2100)]
    public int Year { get; set; }

    [Range(1, 12)]
    public int Month { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
    public decimal Amount { get; set; }
}
