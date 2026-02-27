namespace LendingPlatform.Backend.DTOs;

public record BookDto(
    int Id,
    string Title,
    string? ISBN,
    string? Authors,
    string? Publisher,
    int? PublishYear,
    int TotalCopies,
    int AvailableCopies,
    string? Location,
    string? InternalCode,
    string? Barcode,
    string Status,
    string? CoverUrl,
    string? Description,
    string? Keywords,
    int? CategoryId,
    string? CategoryName
);

public record CreateBookDto(
    string Title,
    string? ISBN,
    string? Authors,
    string? Publisher,
    int? PublishYear,
    int TotalCopies,
    string? Location,
    string? InternalCode,
    string? Barcode,
    string? CoverUrl,
    string? Description,
    string? Keywords,
    int? CategoryId
);
