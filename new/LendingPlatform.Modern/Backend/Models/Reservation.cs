using System.Text.Json.Serialization;

namespace LendingPlatform.Backend.Models;

public class Reservation
{
    public int Id { get; set; }
    
    public int BookId { get; set; }
    public int UserId { get; set; }

    public DateTime ReservationDate { get; set; } = DateTime.Now;
    
    // Status: Waiting, Ready, Fulfilled, Canceled
    public string Status { get; set; } = "Waiting";

    // Navigation properties
    [JsonIgnore]
    public Book? Book { get; set; }
    [JsonIgnore]
    public User? User { get; set; }
}
