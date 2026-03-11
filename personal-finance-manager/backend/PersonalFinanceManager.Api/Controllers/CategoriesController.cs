using Microsoft.AspNetCore.Mvc;
using PersonalFinanceManager.Api.DTOs;
using PersonalFinanceManager.Api.Services;

namespace PersonalFinanceManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController(ICategoryService categoryService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await categoryService.GetAllAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await categoryService.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCategoryRequest request)
    {
        var created = await categoryService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateCategoryRequest request)
    {
        var result = await categoryService.UpdateAsync(id, request);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await categoryService.DeleteAsync(id);
        return result switch
        {
            DeleteCategoryResult.NotFound       => NotFound(),
            DeleteCategoryResult.HasTransactions => Conflict(new { message = "Category cannot be deleted because it has associated transactions." }),
            _                                   => NoContent()
        };
    }
}
