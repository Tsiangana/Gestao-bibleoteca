using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LendingPlatform.Backend.Models;

public class Category
{
    public int Id { get; set; }
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    [JsonIgnore]
    public ICollection<Book> Books { get; set; } = new List<Book>();
}

public class Book
{
    public int Id { get; set; }
    [Required]
    public string Title { get; set; } = string.Empty;
    public string? ISBN { get; set; }
    public string? Authors { get; set; }
    public string? Publisher { get; set; }
    public int? PublishYear { get; set; }
    
    // Inventory
    public int TotalCopies { get; set; } = 1;
    public int AvailableCopies { get; set; } = 1;
    
    public string? Location { get; set; } // e.g., "A1-Shelf-3"
    public string? InternalCode { get; set; } // e.g., a custom library barcode
    public string? Barcode { get; set; } // Actual UPC/EAN if scanned
    
    public string Status { get; set; } = "Available"; // Available, Lent, Reserved, Lost
    public string? CoverUrl { get; set; }
    public string? Description { get; set; }
    public string? Keywords { get; set; }

    // Relationships
    public int? CategoryId { get; set; }
    public Category? Category { get; set; }
    
    [JsonIgnore]
    public ICollection<Loan> Loans { get; set; } = new List<Loan>();
    [JsonIgnore]
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
