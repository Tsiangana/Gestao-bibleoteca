using System.Text.Json.Serialization;

namespace LendingPlatform.Backend.Models;

public class Fine
{
    public int Id { get; set; }
    
    public int UserId { get; set; }
    public int? LoanId { get; set; } // May be null if fine is manual/other reason

    public decimal Amount { get; set; }
    public decimal DailyRateApplied { get; set; } = 2.0m;

    public bool IsPaid { get; set; } = false;
    public DateTime? PaymentDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation properties
    [JsonIgnore]
    public User? User { get; set; }
    [JsonIgnore]
    public Loan? Loan { get; set; }
}
