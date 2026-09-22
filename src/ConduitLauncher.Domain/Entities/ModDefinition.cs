using ConduitLauncher.Domain.Enums;
namespace ConduitLauncher.Domain.Entities;

public class ModDefinition
{
    public string Id { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string Version { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public ModEnvironment Environment { get; set; } = ModEnvironment.Both;
    public string DownloadUrl { get; set; } = string.Empty;
    public string Hash { get; set; } = string.Empty; // SHA1 або SHA512 для перевірки
    
    // Metadata for Dashboard & Export
    public ModEnvironment AutoEnvironment { get; set; } = ModEnvironment.Both;
    public ModEnvironment? UserEnvironmentOverride { get; set; } = null;
    
    public string? ProjectId { get; set; }
    public string? VersionId { get; set; }
    public string Source { get; set; } = "Unknown"; // e.g. "Modrinth", "CurseForge"
    public bool IsRoughDetection { get; set; } = false;
}