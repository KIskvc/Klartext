using System.ComponentModel.DataAnnotations;

namespace PersonalFinanceManager.Api.DTOs;

public class UpdateTransactionRequest
{
    [Required(ErrorMessage = "CategoryId is required.")]
    public Guid CategoryId { get; set; }

    [Required(ErrorMessage = "Amount is required.")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
    public decimal Amount { get; set; }

    [StringLength(500, ErrorMessage = "Description must be at most 500 characters.")]
    public string? Description { get; set; }

    [Required(ErrorMessage = "Date is required.")]
    public DateOnly Date { get; set; }
}
