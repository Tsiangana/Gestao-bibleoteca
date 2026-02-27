using Microsoft.EntityFrameworkCore;
using LendingPlatform.Backend.Data;
using LendingPlatform.Backend.DTOs;
using LendingPlatform.Backend.Models;

namespace LendingPlatform.Backend.Endpoints;

public static class ReservationEndpoints
{
    public static void MapReservationEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/reservations").WithTags("Reservations");

        group.MapGet("/", async (ApplicationDbContext db) =>
        {
            var reservations = await db.Reservations
                .Include(r => r.User)
                .Include(r => r.Book)
                .Select(r => new ReservationDto(
                    r.Id, r.BookId, r.Book!.Title, r.UserId, r.User!.FullName, 
                    r.ReservationDate, r.Status))
                .ToListAsync();
            return Results.Ok(reservations);
        });

        group.MapPost("/", async (CreateReservationDto dto, ApplicationDbContext db) =>
        {
            var book = await db.Books.FindAsync(dto.BookId);
            var user = await db.Users.FindAsync(dto.UserId);

            if(book is null || user is null) return Results.BadRequest("Book or User not found.");
            
            if(book.AvailableCopies > 0) return Results.BadRequest("Book is currently available, you can borrow it directly.");

            var reservation = new Reservation
            {
                BookId = dto.BookId,
                UserId = dto.UserId,
                ReservationDate = DateTime.Now,
                Status = "Waiting"
            };

            db.Reservations.Add(reservation);
            await db.SaveChangesAsync();

            return Results.Created($"/api/reservations/{reservation.Id}", reservation);
        });

        group.MapPut("/{id}/fulfill", async (int id, ApplicationDbContext db) =>
        {
            var r = await db.Reservations.Include(res => res.Book).FirstOrDefaultAsync(res => res.Id == id);
            if(r is null || r.Status != "Waiting") return Results.BadRequest("Invalid reservation ID or status.");

            r.Status = "Fulfilled";
            await db.SaveChangesAsync();
            return Results.Ok();
        });
    }
}
