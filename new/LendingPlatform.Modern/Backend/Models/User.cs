using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LendingPlatform.Backend.Models;

public class User
{
    public int Id { get; set; }
    [Required]
    public string FullName { get; set; } = string.Empty;
    public string? StudentNumber { get; set; }
    public string? DocumentId { get; set; } // CPF, RG, Passport, etc.
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? PhotoUrl { get; set; }

    // Roles: Admin, Librarian, Student, Professor
    [Required]
    public string Role { get; set; } = "Student";
    
    // Status: Active, Suspended, Blocked
    public string Status { get; set; } = "Active";

    // Navigation properties
    [JsonIgnore]
    public ICollection<Loan> Loans { get; set; } = new List<Loan>();
    [JsonIgnore]
    public ICollection<Fine> Fines { get; set; } = new List<Fine>();
    [JsonIgnore]
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
