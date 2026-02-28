using Microsoft.EntityFrameworkCore;
using LendingPlatform.Backend.Data;
using LendingPlatform.Backend.DTOs;
using LendingPlatform.Backend.Models;

namespace LendingPlatform.Backend.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/login", async (LoginDto dto, ApplicationDbContext db) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.Password == dto.Password);
            
            if (user is null) return Results.Unauthorized();
            
            return Results.Ok(new UserDto(
                user.Id, user.FullName, user.StudentNumber, user.DocumentId, 
                user.Email, user.Phone, user.Address, user.PhotoUrl, 
                user.Role, user.Status));
        });

        group.MapPost("/register", async (RegisterDto dto, ApplicationDbContext db) =>
        {
            var existing = await db.Users.AnyAsync(u => u.Email == dto.Email);
            if (existing) return Results.Conflict("Email já cadastrado.");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Password = dto.Password,
                StudentNumber = dto.StudentNumber,
                DocumentId = dto.DocumentId,
                Phone = dto.Phone,
                Address = dto.Address,
                PhotoUrl = dto.PhotoUrl,
                Role = dto.Role,
                Status = "Active"
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            return Results.Ok(new UserDto(
                user.Id, user.FullName, user.StudentNumber, user.DocumentId, 
                user.Email, user.Phone, user.Address, user.PhotoUrl, 
                user.Role, user.Status));
        });
    }
}
