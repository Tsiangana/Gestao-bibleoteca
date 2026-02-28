using LendingPlatform.Backend.Data;
using LendingPlatform.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace LendingPlatform.Backend.Services;

public class NotificationService
{
    private readonly ApplicationDbContext _db;

    public NotificationService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task CreateNotificationAsync(string title, string message, string type = "info")
    {
        Console.WriteLine($"[NOTIFICATION_SERVICE] Creating: {title} - {message}");
        var notification = new Notification
        {
            Title = title,
            Message = message,
            Type = type,
            CreatedAt = DateTime.Now,
            IsRead = false
        };

        try {
            _db.Notifications.Add(notification);
            await _db.SaveChangesAsync();
            Console.WriteLine($"[NOTIFICATION_SERVICE] Saved successfully.");
        } catch (Exception ex) {
            Console.WriteLine($"[NOTIFICATION_SERVICE] ERROR: {ex.Message}");
        }
    }

    public async Task CheckOverdueLoansAsync()
    {
        var overdueLoans = await _db.Loans
            .Include(l => l.Book)
            .Include(l => l.User)
            .Where(l => l.Status == "Active" && DateTime.Now > l.ExpectedReturnDate)
            .ToListAsync();

        foreach (var loan in overdueLoans)
        {
            var daysOverdue = (DateTime.Now - loan.ExpectedReturnDate).Days;
            
            // Trigger 1: Exactly when it becomes overdue (within the first day of detection)
            // Trigger 2: Every 10 days of being overdue
            
            bool shouldNotify = false;
            string message = "";

            if (daysOverdue == 0 || daysOverdue == 1) // Initial detection
            {
                shouldNotify = !await _db.Notifications.AnyAsync(n => 
                    n.Title == "Livro Atrasado" && 
                    n.Message.Contains(loan.Book!.Title) && 
                    n.Message.Contains(loan.User!.FullName) &&
                    n.CreatedAt > DateTime.Now.AddDays(-1));
                
                message = $"O livro '{loan.Book!.Title}' emprestado para {loan.User!.FullName} está atrasado.";
            }
            else if (daysOverdue > 0 && daysOverdue % 10 == 0) // Every 10 days
            {
                // Check if we already notified for this 10-day milestone
                shouldNotify = !await _db.Notifications.AnyAsync(n => 
                    n.Title == "Atraso Persistente" && 
                    n.Message.Contains(loan.Book!.Title) && 
                    n.Message.Contains(daysOverdue.ToString()) &&
                    n.CreatedAt > DateTime.Now.AddHours(-12));
                
                message = $"ALERTA: O livro '{loan.Book!.Title}' está atrasado há {daysOverdue} dias (Usuário: {loan.User!.FullName}).";
            }

            if (shouldNotify)
            {
                var title = daysOverdue % 10 == 0 ? "Atraso Persistente" : "Livro Atrasado";
                var type = daysOverdue % 10 == 0 ? "danger" : "warning";
                
                _db.Notifications.Add(new Notification
                {
                    Title = title,
                    Message = message,
                    Type = type,
                    CreatedAt = DateTime.Now,
                    IsRead = false
                });
            }
        }

        await _db.SaveChangesAsync();
    }
}
