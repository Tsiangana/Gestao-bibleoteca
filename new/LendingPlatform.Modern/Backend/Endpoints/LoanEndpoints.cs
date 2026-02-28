using Microsoft.EntityFrameworkCore;
using LendingPlatform.Backend.Data;
using LendingPlatform.Backend.DTOs;
using LendingPlatform.Backend.Models;
using LendingPlatform.Backend.Services;

namespace LendingPlatform.Backend.Endpoints;

public static class LoanEndpoints
{
    public static void MapLoanEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/loans").WithTags("Loans");

        group.MapGet("/", async (ApplicationDbContext db) =>
        {
            var loans = await db.Loans
                .Include(l => l.Book)
                .Include(l => l.User)
                .Select(l => new LoanDto(
                    l.Id, l.BookId, l.Book!.Title, l.UserId, l.User!.FullName, 
                    l.LoanDate, l.ExpectedReturnDate, l.ActualReturnDate, 
                    l.Status, l.IsOverdue, l.DaysOverdue))
                .ToListAsync();
            return Results.Ok(loans);
        });

        group.MapPost("/", async (CreateLoanDto dto, ApplicationDbContext db, NotificationService notifications) =>
        {
            // Business Logic Check
            var user = await db.Users.Include(u => u.Loans).Include(u => u.Fines).FirstOrDefaultAsync(u => u.Id == dto.UserId);
            var book = await db.Books.FindAsync(dto.BookId);

            if (user is null || book is null) return Results.BadRequest("User or Book not found.");
            if (user.Status == "Blocked" || user.Status == "Suspended") return Results.BadRequest("User is blocked or suspended and cannot borrow books.");
            
            // New limits: Max 3 active loans
            var activeLoansCount = user.Loans.Count(l => l.Status == "Active");
            if (activeLoansCount >= 3) return Results.BadRequest("User has reached the maximum limit of 3 active loans.");

            // New limits: No unpaid fines
            var hasUnpaidFines = user.Fines.Any(f => !f.IsPaid);
            if (hasUnpaidFines) return Results.BadRequest("User has unpaid fines and cannot borrow new books.");

            if (book.AvailableCopies <= 0) return Results.BadRequest("Book has no available copies.");

            var loan = new Loan
            {
                BookId = dto.BookId,
                UserId = dto.UserId,
                ExpectedReturnDate = DateTime.Now.AddDays(dto.DaysToLoan),
                Status = "Active"
            };

            book.AvailableCopies--;
            if (book.AvailableCopies == 0) book.Status = "Lent";

            db.Loans.Add(loan);
            await db.SaveChangesAsync();

            Console.WriteLine($"[LOAN_ENDPOINTS] New loan created for: {user.FullName}. Triggering notification...");
            await notifications.CreateNotificationAsync(
                "Novo Empréstimo", 
                $"O livro '{book.Title}' foi emprestado para {user.FullName}.", 
                "info"
            );

            return Results.Created($"/api/loans/{loan.Id}", loan);
        });

        group.MapPut("/{id}/return", async (int id, ApplicationDbContext db, NotificationService notifications) =>
        {
            var loan = await db.Loans.Include(l => l.Book).Include(l => l.User).FirstOrDefaultAsync(l => l.Id == id);
            if (loan is null || loan.ActualReturnDate.HasValue) return Results.BadRequest("Loan not found or already returned.");

            loan.ActualReturnDate = DateTime.Now;
            loan.Status = "Returned";
            
            if (loan.Book is not null)
            {
                loan.Book.AvailableCopies++;
                if (loan.Book.AvailableCopies > 0 && loan.Book.Status == "Lent") loan.Book.Status = "Available";
            }

            // Fine calculation if overdue: 500 Kz per day
            if (loan.IsOverdue && loan.User is not null)
            {
                var fine = new Fine
                {
                    UserId = loan.UserId,
                    LoanId = loan.Id,
                    Amount = loan.DaysOverdue * 500.0m, // Rule: 500 Kz per day
                    IsPaid = false,
                    CreatedAt = DateTime.Now
                };
                db.Fines.Add(fine);
                loan.User.Status = "Blocked"; // Automatically block user with fine
            }

            await db.SaveChangesAsync();

            Console.WriteLine($"[LOAN_ENDPOINTS] Book returned by: {loan.User?.FullName}. Triggering notification...");
            await notifications.CreateNotificationAsync(
                "Livro Devolvido", 
                $"O livro '{loan.Book?.Title}' foi devolvido por {loan.User?.FullName}.", 
                "success"
            );

            return Results.Ok();
        });
    }
}
