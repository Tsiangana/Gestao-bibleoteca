namespace LendingPlatform.Backend.DTOs;

public record FineDto(
    int Id,
    int UserId,
    string UserName,
    int? LoanId,
    string? BookTitle,
    decimal Amount,
    bool IsPaid,
    DateTime CreatedAt,
    DateTime? PaymentDate
);

public record CreateFineDto(
    int UserId,
    int? LoanId,
    decimal Amount
);

public record PayFineDto(
    bool IsPaid = true
);
