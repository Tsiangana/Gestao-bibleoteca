using Microsoft.EntityFrameworkCore;
using LendingPlatform.Backend.Data;
using LendingPlatform.Backend.Models;

namespace LendingPlatform.Backend.Endpoints;

public static class NotificationEndpoints
{
    public static void MapNotificationEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/notifications").WithTags("Notifications");

        group.MapGet("/", async (ApplicationDbContext db) =>
        {
            var notifications = await db.Notifications
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
            Console.WriteLine($"[NOTIFICATION_ENDPOINTS] Fetched {notifications.Count} notifications.");
            return notifications;
        });

        group.MapPut("/{id}/read", async (int id, ApplicationDbContext db) =>
        {
            var notification = await db.Notifications.FindAsync(id);
            if (notification == null) return Results.NotFound();

            notification.IsRead = true;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        group.MapDelete("/", async (ApplicationDbContext db) =>
        {
            var notifications = await db.Notifications.ToListAsync();
            db.Notifications.RemoveRange(notifications);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
        
        group.MapDelete("/{id}", async (int id, ApplicationDbContext db) =>
        {
            var notification = await db.Notifications.FindAsync(id);
            if (notification == null) return Results.NotFound();

            db.Notifications.Remove(notification);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
