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
