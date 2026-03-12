using Microsoft.EntityFrameworkCore;
using PersonalFinanceManager.Api.Data;
using PersonalFinanceManager.Api.DTOs;
using PersonalFinanceManager.Api.Models;

namespace PersonalFinanceManager.Api.Services;

public class TransactionService(AppDbContext db) : ITransactionService
{
    public async Task<IEnumerable<TransactionResponse>> GetAllAsync(int? year, int? month)
    {
        var query = db.Transactions
            .AsNoTracking()
            .Include(t => t.Category)
            .AsQueryable();

        if (year.HasValue)
            query = query.Where(t => t.Date.Year == year.Value);

        if (month.HasValue)
            query = query.Where(t => t.Date.Month == month.Value);

        return await query
            .OrderByDescending(t => t.Date)
            .Select(t => ToResponse(t))
            .ToListAsync();
    }

    public async Task<TransactionResponse?> GetByIdAsync(Guid id)
    {
        var transaction = await db.Transactions
            .AsNoTracking()
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id);

        return transaction is null ? null : ToResponse(transaction);
    }

    public async Task<(TransactionWriteResult Result, TransactionResponse? Transaction)> CreateAsync(CreateTransactionRequest request)
    {
        var categoryExists = await db.Categories.AnyAsync(c => c.Id == request.CategoryId);
        if (!categoryExists)
            return (TransactionWriteResult.CategoryNotFound, null);

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            CategoryId = request.CategoryId,
            Amount = request.Amount,
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            Date = request.Date,
            CreatedAt = DateTime.UtcNow
        };

        db.Transactions.Add(transaction);
        await db.SaveChangesAsync();

        await db.Entry(transaction).Reference(t => t.Category).LoadAsync();
        return (TransactionWriteResult.Success, ToResponse(transaction));
    }

    public async Task<(TransactionWriteResult Result, TransactionResponse? Transaction)> UpdateAsync(Guid id, UpdateTransactionRequest request)
    {
        var transaction = await db.Transactions.FindAsync(id);
        if (transaction is null)
            return (TransactionWriteResult.Success, null);

        var categoryExists = await db.Categories.AnyAsync(c => c.Id == request.CategoryId);
        if (!categoryExists)
            return (TransactionWriteResult.CategoryNotFound, null);

        transaction.CategoryId = request.CategoryId;
        transaction.Amount = request.Amount;
        transaction.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        transaction.Date = request.Date;

        await db.SaveChangesAsync();

        await db.Entry(transaction).Reference(t => t.Category).LoadAsync();
        return (TransactionWriteResult.Success, ToResponse(transaction));
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var transaction = await db.Transactions.FindAsync(id);
        if (transaction is null) return false;

        db.Transactions.Remove(transaction);
        await db.SaveChangesAsync();
        return true;
    }

    private static TransactionResponse ToResponse(Transaction t) => new()
    {
        Id = t.Id,
        CategoryId = t.CategoryId,
        CategoryName = t.Category.Name,
        CategoryType = t.Category.Type,
        Amount = t.Amount,
        Description = t.Description,
        Date = t.Date,
        CreatedAt = t.CreatedAt
    };
}
