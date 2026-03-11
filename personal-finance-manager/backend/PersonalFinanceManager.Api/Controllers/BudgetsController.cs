using Microsoft.AspNetCore.Mvc;
using PersonalFinanceManager.Api.DTOs;
using PersonalFinanceManager.Api.Services;

namespace PersonalFinanceManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BudgetsController(IBudgetService budgetService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? year, [FromQuery] int? month) =>
        Ok(await budgetService.GetAllAsync(year, month));

    [HttpPut]
    public async Task<IActionResult> Set(SetBudgetRequest request)
    {
        var (result, budget) = await budgetService.SetAsync(request);

        return result switch
        {
            BudgetSetResult.CategoryNotFound => NotFound(new { message = $"Category '{request.CategoryId}' was not found." }),
            BudgetSetResult.CategoryNotExpense => BadRequest(new { message = "Budgets can only be set for expense categories." }),
            _ => Ok(budget)
        };
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await budgetService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
