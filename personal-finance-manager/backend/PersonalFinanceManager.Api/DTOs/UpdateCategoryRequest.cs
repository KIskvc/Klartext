using System.ComponentModel.DataAnnotations;
using PersonalFinanceManager.Api.Models;

namespace PersonalFinanceManager.Api.DTOs;

public class UpdateCategoryRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Name must be between 1 and 100 characters.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Type is required.")]
    [EnumDataType(typeof(CategoryType), ErrorMessage = "Type must be 'Income' or 'Expense'.")]
    public CategoryType Type { get; set; }
}
