namespace LendingPlatform.Backend.DTOs;

public record UserDto(
    int Id,
    string FullName,
    string? StudentNumber,
    string? DocumentId,
    string? Email,
    string? Phone,
    string? Address,
    string? PhotoUrl,
    string Role,
    string Status
);

public record CreateUserDto(
    string FullName,
    string? StudentNumber,
    string? DocumentId,
    string? Email,
    string? Phone,
    string? Address,
    string? PhotoUrl,
    string Role = "Student" // Admin, Librarian, Student, Professor
);

public record UpdateUserStatusDto(string Status);

public record LoginDto(string Email, string Password);

public record RegisterDto(
    string FullName,
    string Email,
    string Password,
    string? StudentNumber = null,
    string? DocumentId = null,
    string? Phone = null,
    string? Address = null,
    string? PhotoUrl = null,
    string Role = "Student"
);
