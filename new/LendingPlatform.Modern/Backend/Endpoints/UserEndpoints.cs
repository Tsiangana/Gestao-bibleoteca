using Microsoft.EntityFrameworkCore;
using LendingPlatform.Backend.Data;
using LendingPlatform.Backend.DTOs;
using LendingPlatform.Backend.Models;
using LendingPlatform.Backend.Services;

namespace LendingPlatform.Backend.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/users").WithTags("Users");

        group.MapGet("/", async (ApplicationDbContext db) =>
        {
            var users = await db.Users
                .Select(u => new UserDto(u.Id, u.FullName, u.StudentNumber, u.DocumentId, u.Email, u.Phone, u.Address, u.PhotoUrl, u.Role, u.Status))
                .ToListAsync();
            return Results.Ok(users);
        });

        group.MapGet("/{id}", async (int id, ApplicationDbContext db) =>
        {
            var u = await db.Users.FindAsync(id);
            if (u is null) return Results.NotFound();
            return Results.Ok(new UserDto(u.Id, u.FullName, u.StudentNumber, u.DocumentId, u.Email, u.Phone, u.Address, u.PhotoUrl, u.Role, u.Status));
        });

        group.MapPost("/", async (CreateUserDto dto, ApplicationDbContext db, NotificationService notifications) =>
        {
            var user = new User
            {
                FullName = dto.FullName,
                StudentNumber = dto.StudentNumber,
                DocumentId = dto.DocumentId,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                PhotoUrl = dto.PhotoUrl,
                Role = dto.Role,
                Status = "Active"
            };
            db.Users.Add(user);
            await db.SaveChangesAsync();

            Console.WriteLine($"[USER_ENDPOINTS] New user created: {user.FullName}. Triggering notification...");
            await notifications.CreateNotificationAsync(
                "Novo Usuário", 
                $"O usuário {user.FullName} foi cadastrado no sistema.", 
                "info"
            );

            return Results.Created($"/api/users/{user.Id}", new UserDto(user.Id, user.FullName, user.StudentNumber, user.DocumentId, user.Email, user.Phone, user.Address, user.PhotoUrl, user.Role, user.Status));
        });

        group.MapPut("/{id}/status", async (int id, UpdateUserStatusDto dto, ApplicationDbContext db) =>
        {
            var u = await db.Users.FindAsync(id);
            if (u is null) return Results.NotFound();
            
            u.Status = dto.Status;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        group.MapGet("/{id}/history", async (int id, ApplicationDbContext db) =>
        {
            var user = await db.Users
                .Include(u => u.Loans).ThenInclude(l => l.Book)
                .Include(u => u.Fines)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user is null) return Results.NotFound();

            var activeLoansCount = user.Loans.Count(l => l.Status == "Active");
            var totalUnpaidFines = user.Fines.Where(f => !f.IsPaid).Sum(f => f.Amount);
            
            // Limit: 3 books max, and no unpaid fines
            var canBorrowMore = activeLoansCount < 3 && totalUnpaidFines == 0;

            var history = new UserHistoryDto(
                user.Loans.Count,
                activeLoansCount,
                canBorrowMore,
                totalUnpaidFines,
                user.Loans.Select(l => new LoanDto(
                    l.Id, l.BookId, l.Book!.Title, l.UserId, user.FullName, 
                    l.LoanDate, l.ExpectedReturnDate, l.ActualReturnDate, 
                    l.Status, l.IsOverdue, l.DaysOverdue)).ToList()
            );

            return Results.Ok(history);
        });
    }
}
