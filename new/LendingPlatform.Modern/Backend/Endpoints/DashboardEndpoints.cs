using Microsoft.EntityFrameworkCore;
using LendingPlatform.Backend.Data;

namespace LendingPlatform.Backend.Endpoints;

public static class DashboardEndpoints
{
    public static void MapDashboardEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/dashboard").WithTags("Dashboard");

        group.MapGet("/metrics", async (ApplicationDbContext db) =>
        {
            var totalBooks = await db.Books.SumAsync(b => b.TotalCopies);
            var activeLoans = await db.Loans.CountAsync(l => !l.ActualReturnDate.HasValue);
            var activeUsers = await db.Users.CountAsync(u => u.Status == "Active");
            var pendingFinesTotal = await db.Fines.Where(f => !f.IsPaid).SumAsync(f => f.Amount);

            return Results.Ok(new
            {
                TotalBooks = totalBooks,
                ActiveLoans = activeLoans,
                ActiveUsers = activeUsers,
                PendingFinesTotal = pendingFinesTotal
            });
        });

        group.MapGet("/top-books", async (ApplicationDbContext db) =>
        {
            var topBooks = await db.Loans
                .GroupBy(l => new { l.BookId, l.Book!.Title })
                .Select(g => new { BookId = g.Key.BookId, Title = g.Key.Title, LoanCount = g.Count() })
                .OrderByDescending(x => x.LoanCount)
                .Take(5)
                .ToListAsync();

            return Results.Ok(topBooks);
        });
    }
}
