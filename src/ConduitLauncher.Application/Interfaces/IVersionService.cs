using System.Collections.Generic;
using System.Threading.Tasks;
using ConduitLauncher.Domain.Shared;

namespace ConduitLauncher.Application.Interfaces;

public class GameVersionDto
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string ReleaseTime { get; set; } = string.Empty;
}

public interface IVersionService
{
    Task<Result<List<GameVersionDto>>> GetVanillaVersionsAsync();
    Task<Result<List<string>>> GetFabricLoadersAsync();
    Task<Result<List<string>>> GetForgeLoadersAsync(string mcVersion);
    Task<Result<List<string>>> GetForgeSupportedVersionsAsync();
    Task<Result<List<string>>> GetNeoForgeLoadersAsync(string mcVersion);
    Task<Result<List<string>>> GetQuiltLoadersAsync();
    Task<Result<List<string>>> GetLiteLoaderLoadersAsync(string mcVersion);
}
