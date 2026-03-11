using System.ComponentModel.DataAnnotations;

namespace PersonalFinanceManager.Api.DTOs;

public class CreateTransactionRequest
{
    [Required(ErrorMessage = "CategoryId is required.")]
    public Guid CategoryId { get; set; }

    [Required(ErrorMessage = "Amount is required.")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
    public decimal Amount { get; set; }

    [Required(ErrorMessage = "Description is required.")]
    [StringLength(500, MinimumLength = 1, ErrorMessage = "Description must be between 1 and 500 characters.")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Date is required.")]
    public DateOnly Date { get; set; }
}
