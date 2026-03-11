using PersonalFinanceManager.Api.DTOs;

namespace PersonalFinanceManager.Api.Services;

public enum TransactionWriteResult { Success, CategoryNotFound }

public interface ITransactionService
{
    Task<IEnumerable<TransactionResponse>> GetAllAsync(int? year, int? month);
    Task<TransactionResponse?> GetByIdAsync(Guid id);
    Task<(TransactionWriteResult Result, TransactionResponse? Transaction)> CreateAsync(CreateTransactionRequest request);
    Task<(TransactionWriteResult Result, TransactionResponse? Transaction)> UpdateAsync(Guid id, UpdateTransactionRequest request);
    Task<bool> DeleteAsync(Guid id);
}
