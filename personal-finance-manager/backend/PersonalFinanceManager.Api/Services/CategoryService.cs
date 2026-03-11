using Microsoft.EntityFrameworkCore;
using PersonalFinanceManager.Api.Data;
using PersonalFinanceManager.Api.DTOs;
using PersonalFinanceManager.Api.Models;

namespace PersonalFinanceManager.Api.Services;

public class CategoryService(AppDbContext db) : ICategoryService
{
    public async Task<IEnumerable<CategoryResponse>> GetAllAsync() =>
        await db.Categories
            .AsNoTracking()
            .Select(c => ToResponse(c))
            .ToListAsync();

    public async Task<CategoryResponse?> GetByIdAsync(Guid id)
    {
        var category = await db.Categories.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);
        return category is null ? null : ToResponse(category);
    }

    public async Task<CategoryResponse> CreateAsync(CreateCategoryRequest request)
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Type = request.Type,
            CreatedAt = DateTime.UtcNow
        };
        db.Categories.Add(category);
        await db.SaveChangesAsync();
        return ToResponse(category);
    }

    public async Task<CategoryResponse?> UpdateAsync(Guid id, UpdateCategoryRequest request)
    {
        var category = await db.Categories.FindAsync(id);
        if (category is null) return null;

        category.Name = request.Name.Trim();
        category.Type = request.Type;
        await db.SaveChangesAsync();
        return ToResponse(category);
    }

    public async Task<DeleteCategoryResult> DeleteAsync(Guid id)
    {
        var category = await db.Categories.FindAsync(id);
        if (category is null) return DeleteCategoryResult.NotFound;

        bool hasTransactions = await db.Transactions.AnyAsync(t => t.CategoryId == id);
        if (hasTransactions) return DeleteCategoryResult.HasTransactions;

        db.Categories.Remove(category);
        await db.SaveChangesAsync();
        return DeleteCategoryResult.Success;
    }

    private static CategoryResponse ToResponse(Category c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Type = c.Type,
        CreatedAt = c.CreatedAt
    };
}
