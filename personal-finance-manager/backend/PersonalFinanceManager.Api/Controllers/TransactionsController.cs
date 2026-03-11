using Microsoft.AspNetCore.Mvc;
using PersonalFinanceManager.Api.DTOs;
using PersonalFinanceManager.Api.Services;

namespace PersonalFinanceManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController(ITransactionService transactionService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? year, [FromQuery] int? month) =>
        Ok(await transactionService.GetAllAsync(year, month));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await transactionService.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTransactionRequest request)
    {
        var (result, transaction) = await transactionService.CreateAsync(request);

        return result switch
        {
            TransactionWriteResult.CategoryNotFound => NotFound(new { message = $"Category with id '{request.CategoryId}' was not found." }),
            _ => CreatedAtAction(nameof(GetById), new { id = transaction!.Id }, transaction)
        };
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateTransactionRequest request)
    {
        var (result, transaction) = await transactionService.UpdateAsync(id, request);

        return result switch
        {
            TransactionWriteResult.CategoryNotFound => NotFound(new { message = $"Category with id '{request.CategoryId}' was not found." }),
            _ => transaction is null ? NotFound() : Ok(transaction)
        };
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await transactionService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
