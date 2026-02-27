namespace LendingPlatform.Backend.DTOs;

public record LoanDto(
    int Id,
    int BookId,
    string BookTitle,
    int UserId,
    string UserName,
    DateTime LoanDate,
    DateTime ExpectedReturnDate,
    DateTime? ActualReturnDate,
    string Status,
    bool IsOverdue,
    int DaysOverdue
);

public record CreateLoanDto(
    int BookId,
    int UserId,
    int DaysToLoan = 14
);

public record ReservationDto(
    int Id,
    int BookId,
    string BookTitle,
    int UserId,
    string UserName,
    DateTime ReservationDate,
    string Status
);

public record CreateReservationDto(
    int BookId,
    int UserId
);
