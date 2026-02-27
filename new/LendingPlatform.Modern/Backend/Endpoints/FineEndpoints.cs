using Microsoft.EntityFrameworkCore;
using LendingPlatform.Backend.Data;
using LendingPlatform.Backend.DTOs;
using LendingPlatform.Backend.Models;

namespace LendingPlatform.Backend.Endpoints;

public static class FineEndpoints
{
    public static void MapFineEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/fines").WithTags("Fines");

        group.MapGet("/", async (ApplicationDbContext db) =>
        {
            var fines = await db.Fines
                .Include(f => f.User)
                .Include(f => f.Loan).ThenInclude(l => l!.Book)
                .Select(f => new FineDto(
                    f.Id, f.UserId, f.User!.FullName, 
                    f.LoanId, f.Loan != null && f.Loan.Book != null ? f.Loan.Book.Title : null, 
                    f.Amount, f.IsPaid, f.CreatedAt, f.PaymentDate))
                .ToListAsync();
            return Results.Ok(fines);
        });

        group.MapPost("/", async (CreateFineDto dto, ApplicationDbContext db) =>
        {
            var fine = new Fine
            {
                UserId = dto.UserId,
                LoanId = dto.LoanId,
                Amount = dto.Amount,
                IsPaid = false,
                CreatedAt = DateTime.Now
            };
            db.Fines.Add(fine);
            
            // Optionally block the user immediately
            var user = await db.Users.FindAsync(dto.UserId);
            if(user != null) user.Status = "Blocked";

            await db.SaveChangesAsync();
            return Results.Created($"/api/fines/{fine.Id}", fine);
        });

        group.MapPut("/{id}/pay", async (int id, PayFineDto dto, ApplicationDbContext db) =>
        {
            var fine = await db.Fines.Include(f => f.User).FirstOrDefaultAsync(f => f.Id == id);
            if (fine is null || fine.IsPaid) return Results.BadRequest("Fine not found or already paid.");

            fine.IsPaid = true;
            fine.PaymentDate = DateTime.Now;

            // Check if the user has other unpaid fines. If not, unblock them.
            if (fine.User != null)
            {
                var hasOtherFines = await db.Fines.AnyAsync(f => f.UserId == fine.UserId && !f.IsPaid && f.Id != id);
                if (!hasOtherFines)
                {
                    fine.User.Status = "Active"; // Reactivate the user
                }
            }

            await db.SaveChangesAsync();
            return Results.Ok();
        });
    }
}
