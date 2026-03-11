using PersonalFinanceManager.Api.Models;

namespace PersonalFinanceManager.Api.DTOs;

public class CategoryResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public CategoryType Type { get; set; }
    public DateTime CreatedAt { get; set; }
}
