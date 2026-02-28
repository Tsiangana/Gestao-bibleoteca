using LendingPlatform.Backend.Models;

namespace LendingPlatform.Backend.DTOs;

public record UserHistoryDto(
    int TotalBooksBorrowed,
    int ActiveLoansCount,
    bool CanBorrowMore,
    decimal TotalUnpaidFines,
    List<LoanDto> Loans
);
