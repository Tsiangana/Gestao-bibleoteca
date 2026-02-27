namespace LendingPlatform.Backend.Models;

public class Person
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? NationalNo { get; set; }
}
