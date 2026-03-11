using PersonalFinanceManager.Api.DTOs;

namespace PersonalFinanceManager.Api.Services;

public interface ISummaryService
{
    Task<SummaryResponse> GetSummaryAsync(int year, int month);
}
