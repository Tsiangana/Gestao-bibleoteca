using Microsoft.EntityFrameworkCore;
using LendingPlatform.Backend.Data;
using LendingPlatform.Backend.DTOs;
using LendingPlatform.Backend.Services;

namespace LendingPlatform.Backend.Endpoints;

public static class DashboardEndpoints
{
    public static void MapDashboardEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/dashboard").WithTags("Dashboard");

        group.MapGet("/metrics", async (ApplicationDbContext db, NotificationService notifications) =>
        {
            // Automatic overdue check when loading dashboard
            await notifications.CheckOverdueLoansAsync();
            var totalBooks = (await db.Books.ToListAsync()).Sum(b => b.TotalCopies);
            var activeLoans = await db.Loans.CountAsync(l => !l.ActualReturnDate.HasValue);
            var activeUsers = await db.Users.CountAsync(u => u.Status == "Active");
            var pendingFines = await db.Fines.Where(f => !f.IsPaid).ToListAsync();
            var pendingFinesTotal = pendingFines.Sum(f => f.Amount);

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

        group.MapGet("/export-data", async (int? month, int? year, ApplicationDbContext db) =>
        {
            var query = db.Loans
                .Include(l => l.Book)
                .Include(l => l.User)
                .AsQueryable();

            if (year.HasValue)
            {
                query = query.Where(l => l.LoanDate.Year == year.Value);
            }

            if (month.HasValue)
            {
                query = query.Where(l => l.LoanDate.Month == month.Value);
            }

            var loansData = await query
                .OrderByDescending(l => l.LoanDate)
                .ToListAsync();

            var loans = loansData.Select(l => new LoanDto(
                l.Id, l.BookId, l.Book?.Title ?? "Título Indisponível", l.UserId, l.User?.FullName ?? "Usuário Desconhecido", 
                l.LoanDate, l.ExpectedReturnDate, l.ActualReturnDate, 
                l.Status, l.IsOverdue, l.DaysOverdue))
                .ToList();

            return Results.Ok(loans);
        });

        group.MapGet("/search", async (string q, ApplicationDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(q)) return Results.Ok(new { books = new List<BookDto>(), users = new List<UserDto>() });

            var queryStr = q.ToLower();

            var booksData = await db.Books.Include(b => b.Category)
                .Where(b => b.Title.ToLower().Contains(queryStr) || 
                            b.Authors!.ToLower().Contains(queryStr) || 
                            b.ISBN!.ToLower().Contains(queryStr))
                .Take(5)
                .ToListAsync();

            var books = booksData.Select(b => new BookDto(
                    b.Id, b.Title, b.ISBN, b.Authors, b.Publisher, b.PublishYear, 
                    b.TotalCopies, b.AvailableCopies, b.Location, b.InternalCode, b.Barcode, 
                    b.Status, b.CoverUrl, b.Description, b.Keywords, b.CategoryId, b.Category?.Name))
                .ToList();

            var usersData = await db.Users
                .Where(u => u.FullName.ToLower().Contains(queryStr) || 
                            (u.Email != null && u.Email.ToLower().Contains(queryStr)) || 
                            (u.StudentNumber != null && u.StudentNumber.ToLower().Contains(queryStr)))
                .Take(5)
                .ToListAsync();

            var users = usersData.Select(u => new UserDto(u.Id, u.FullName, u.StudentNumber, u.DocumentId, u.Email, u.Phone, u.Address, u.PhotoUrl, u.Role, u.Status))
                .ToList();

            return Results.Ok(new { books, users });
        });
    }
}
