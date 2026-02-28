using Microsoft.EntityFrameworkCore;
using LendingPlatform.Backend.Data;
using LendingPlatform.Backend.Models;

namespace LendingPlatform.Backend.Endpoints;

public static class CategoryEndpoints
{
    public static void MapCategoryEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/categories").WithTags("Categories");

        group.MapGet("/", async (ApplicationDbContext db) =>
        {
            var categories = await db.Categories
                .OrderBy(c => c.Name)
                .ToListAsync();
            return Results.Ok(categories);
        });

        group.MapGet("/{id}", async (int id, ApplicationDbContext db) =>
        {
            var category = await db.Categories.FindAsync(id);
            return category != null ? Results.Ok(category) : Results.NotFound();
        });
    }
}
