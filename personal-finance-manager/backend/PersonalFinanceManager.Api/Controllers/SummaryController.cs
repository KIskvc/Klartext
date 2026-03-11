using Microsoft.AspNetCore.Mvc;
using PersonalFinanceManager.Api.Services;

namespace PersonalFinanceManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SummaryController(ISummaryService summaryService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int? year, [FromQuery] int? month)
    {
        if (year is null || month is null)
            return BadRequest(new { message = "Query parameters 'year' and 'month' are required." });

        var result = await summaryService.GetSummaryAsync(year.Value, month.Value);
        return Ok(result);
    }
}
