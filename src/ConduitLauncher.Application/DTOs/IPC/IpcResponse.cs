namespace ConduitLauncher.Application.DTOs.IPC;

public class IpcResponse
{
    public string? Id { get; set; } // Null, якщо це глобальна подія (Broadcast)
    public string Type { get; set; } = string.Empty; // "SUCCESS", "ERROR", "EVENT"
    public string? EventName { get; set; }
    public object? Data { get; set; }
}
    