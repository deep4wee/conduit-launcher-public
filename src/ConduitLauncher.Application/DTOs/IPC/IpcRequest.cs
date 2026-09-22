using System.Text.Json;

namespace ConduitLauncher.Application.DTOs.IPC;

public class IpcRequest
{
    public string Id { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public JsonElement? Payload { get; set; }
}
    