using PersonalFinanceManager.Api.DTOs;

namespace PersonalFinanceManager.Api.Services;

public enum DeleteCategoryResult { Success, NotFound, HasTransactions }

public interface ICategoryService
{
    Task<IEnumerable<CategoryResponse>> GetAllAsync();
    Task<CategoryResponse?> GetByIdAsync(Guid id);
    Task<CategoryResponse> CreateAsync(CreateCategoryRequest request);
    Task<CategoryResponse?> UpdateAsync(Guid id, UpdateCategoryRequest request);
    Task<DeleteCategoryResult> DeleteAsync(Guid id);
}
