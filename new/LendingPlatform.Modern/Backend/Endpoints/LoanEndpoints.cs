using Microsoft.EntityFrameworkCore;
using LendingPlatform.Backend.Data;
using LendingPlatform.Backend.DTOs;
using LendingPlatform.Backend.Models;

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

        group.MapPost("/", async (CreateLoanDto dto, ApplicationDbContext db) =>
        {
            // Business Logic Check
            var user = await db.Users.FindAsync(dto.UserId);
            var book = await db.Books.FindAsync(dto.BookId);

            if (user is null || book is null) return Results.BadRequest("User or Book not found.");
            if (user.Status == "Blocked" || user.Status == "Suspended") return Results.BadRequest("User is blocked or suspended and cannot borrow books.");
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

            return Results.Created($"/api/loans/{loan.Id}", loan);
        });

        group.MapPut("/{id}/return", async (int id, ApplicationDbContext db) =>
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

            // Fine calculation if overdue
            if (loan.IsOverdue && loan.User is not null)
            {
                var fine = new Fine
                {
                    UserId = loan.UserId,
                    LoanId = loan.Id,
                    Amount = loan.DaysOverdue * 2.0m, // Rule: 2 per day
                    IsPaid = false
                };
                db.Fines.Add(fine);
                loan.User.Status = "Blocked"; // Automatically block user with fine
            }

            await db.SaveChangesAsync();
            return Results.Ok();
        });
    }
}
