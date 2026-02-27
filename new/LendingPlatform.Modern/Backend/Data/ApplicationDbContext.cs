using Microsoft.EntityFrameworkCore;
using LendingPlatform.Backend.Models;

namespace LendingPlatform.Backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Book> Books { get; set; } = null!;
    public DbSet<Loan> Loans { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Reservation> Reservations { get; set; } = null!;
    public DbSet<Fine> Fines { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // --- Relationships ---
        
        // User -> Loans (1:N)
        modelBuilder.Entity<Loan>()
            .HasOne(l => l.User)
            .WithMany(u => u.Loans)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Book -> Loans (1:N)
        modelBuilder.Entity<Loan>()
            .HasOne(l => l.Book)
            .WithMany(b => b.Loans)
            .HasForeignKey(l => l.BookId)
            .OnDelete(DeleteBehavior.Cascade);

        // Category -> Books (1:N)
        modelBuilder.Entity<Book>()
            .HasOne(b => b.Category)
            .WithMany(c => c.Books)
            .HasForeignKey(b => b.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        // User -> Reservations (1:N)
        modelBuilder.Entity<Reservation>()
            .HasOne(r => r.User)
            .WithMany(u => u.Reservations)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Book -> Reservations (1:N)
        modelBuilder.Entity<Reservation>()
            .HasOne(r => r.Book)
            .WithMany(b => b.Reservations)
            .HasForeignKey(r => r.BookId)
            .OnDelete(DeleteBehavior.Cascade);

        // User -> Fines (1:N)
        modelBuilder.Entity<Fine>()
            .HasOne(f => f.User)
            .WithMany(u => u.Fines)
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Loan -> Fines (1:N)
        modelBuilder.Entity<Fine>()
            .HasOne(f => f.Loan)
            .WithMany(l => l.Fines)
            .HasForeignKey(f => f.LoanId)
            .OnDelete(DeleteBehavior.SetNull);


        // --- Seed Data ---
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Ficção Científica", Description = "Livros sobre futuros e tecnologia" },
            new Category { Id = 2, Name = "Literatura Brasileira", Description = "Clássicos nacionais" },
            new Category { Id = 3, Name = "Tecnologia", Description = "Programação, Redes, Hardware" }
        );

        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, FullName = "Admin Sistema", Email = "admin@lenda.com", Role = "Admin", Status = "Active" },
            new User { Id = 2, FullName = "João Silva", Email = "joao@estudante.edu", StudentNumber = "2023001", Role = "Student", Status = "Active" },
            new User { Id = 3, FullName = "Maria Oliveira", Email = "maria@professora.edu", Role = "Professor", Status = "Active" },
            new User { Id = 4, FullName = "Carlos Bloqueado", Email = "carlos@estudante.edu", StudentNumber = "2023002", Role = "Student", Status = "Blocked" }
        );

        modelBuilder.Entity<Book>().HasData(
            new Book { Id = 1, Title = "O Guia do Mochileiro das Galáxias", Authors = "Douglas Adams", ISBN = "978-85-99-29657-3", CategoryId = 1, TotalCopies = 5, AvailableCopies = 4, Status = "Available" },
            new Book { Id = 2, Title = "Clean Code", Authors = "Robert C. Martin", ISBN = "978-01-32-35088-4", CategoryId = 3, TotalCopies = 2, AvailableCopies = 0, Status = "Lent" },
            new Book { Id = 3, Title = "Dom Casmurro", Authors = "Machado de Assis", ISBN = "978-85-01-01234-5", CategoryId = 2, TotalCopies = 3, AvailableCopies = 3, Status = "Available" }
        );

        modelBuilder.Entity<Loan>().HasData(
            // Active Loan
            new Loan { Id = 1, UserId = 2, BookId = 1, LoanDate = DateTime.Now.AddDays(-5), ExpectedReturnDate = DateTime.Now.AddDays(9), Status = "Active" },
            // Overdue Loan (Causes blocking)
            new Loan { Id = 2, UserId = 4, BookId = 2, LoanDate = DateTime.Now.AddDays(-30), ExpectedReturnDate = DateTime.Now.AddDays(-16), Status = "Overdue" },
            // Returned Loan
            new Loan { Id = 3, UserId = 3, BookId = 2, LoanDate = DateTime.Now.AddDays(-40), ExpectedReturnDate = DateTime.Now.AddDays(-26), ActualReturnDate = DateTime.Now.AddDays(-28), Status = "Returned" }
        );

        modelBuilder.Entity<Fine>().HasData(
            new Fine { Id = 1, UserId = 4, LoanId = 2, Amount = 32.0m, DailyRateApplied = 2.0m, IsPaid = false, CreatedAt = DateTime.Now.AddDays(-16) }
        );
    }
}
