using System.Text.Json.Serialization;

namespace LendingPlatform.Backend.Models;

public class Loan
{
    public int Id { get; set; }
    
    // Foreign Keys
    public int BookId { get; set; }
    public int UserId { get; set; }

    public DateTime LoanDate { get; set; } = DateTime.Now;
    public DateTime ExpectedReturnDate { get; set; }
    public DateTime? ActualReturnDate { get; set; }

    // Status: Active, Overdue, Returned
    public string Status { get; set; } = "Active";
    public string? Notes { get; set; }

    // Navigation properties
    [JsonIgnore]
    public Book? Book { get; set; }
    [JsonIgnore]
    public User? User { get; set; }
    [JsonIgnore]
    public ICollection<Fine> Fines { get; set; } = new List<Fine>();

    // Computed property
    public bool IsOverdue => !ActualReturnDate.HasValue && DateTime.Now > ExpectedReturnDate;
    public int DaysOverdue => IsOverdue ? (DateTime.Now - ExpectedReturnDate).Days : 0;
}
