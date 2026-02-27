using Microsoft.EntityFrameworkCore;
using LendingPlatform.Backend.Data;
using LendingPlatform.Backend.DTOs;
using LendingPlatform.Backend.Models;

namespace LendingPlatform.Backend.Endpoints;

public static class BookEndpoints
{
    public static void MapBookEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/books").WithTags("Books");

        group.MapGet("/", async (ApplicationDbContext db) =>
        {
            var books = await db.Books.Include(b => b.Category)
                .Select(b => new BookDto(
                    b.Id, b.Title, b.ISBN, b.Authors, b.Publisher, b.PublishYear, 
                    b.TotalCopies, b.AvailableCopies, b.Location, b.InternalCode, b.Barcode, 
                    b.Status, b.CoverUrl, b.Description, b.Keywords, b.CategoryId, b.Category != null ? b.Category.Name : null))
                .ToListAsync();
            return Results.Ok(books);
        });

        group.MapGet("/{id}", async (int id, ApplicationDbContext db) =>
        {
            var b = await db.Books.Include(b => b.Category).FirstOrDefaultAsync(b => b.Id == id);
            if (b is null) return Results.NotFound();
            return Results.Ok(new BookDto(
                    b.Id, b.Title, b.ISBN, b.Authors, b.Publisher, b.PublishYear, 
                    b.TotalCopies, b.AvailableCopies, b.Location, b.InternalCode, b.Barcode, 
                    b.Status, b.CoverUrl, b.Description, b.Keywords, b.CategoryId, b.Category != null ? b.Category.Name : null));
        });

        group.MapPost("/", async (CreateBookDto dto, ApplicationDbContext db) =>
        {
            var book = new Book
            {
                Title = dto.Title,
                ISBN = dto.ISBN,
                Authors = dto.Authors,
                Publisher = dto.Publisher,
                PublishYear = dto.PublishYear,
                TotalCopies = dto.TotalCopies,
                AvailableCopies = dto.TotalCopies, // New books are fully available
                Location = dto.Location,
                InternalCode = dto.InternalCode,
                Barcode = dto.Barcode,
                CoverUrl = dto.CoverUrl,
                Description = dto.Description,
                Keywords = dto.Keywords,
                CategoryId = dto.CategoryId,
                Status = "Available"
            };
            db.Books.Add(book);
            await db.SaveChangesAsync();
            return Results.Created($"/api/books/{book.Id}", book);
        });

        group.MapPut("/{id}/status", async (int id, string status, ApplicationDbContext db) =>
        {
            var b = await db.Books.FindAsync(id);
            if (b is null) return Results.NotFound();
            b.Status = status;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
