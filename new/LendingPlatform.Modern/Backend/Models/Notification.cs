using System;

namespace LendingPlatform.Backend.Models;

public class Notification
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    
    // Type: info, success, warning, danger
    public string Type { get; set; } = "info";
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public bool IsRead { get; set; } = false;
}
