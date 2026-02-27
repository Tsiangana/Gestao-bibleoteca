using Microsoft.EntityFrameworkCore;
using LendingPlatform.Backend.Data;
using LendingPlatform.Backend.DTOs;
using LendingPlatform.Backend.Models;

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

        group.MapPost("/", async (CreateUserDto dto, ApplicationDbContext db) =>
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
    }
}
