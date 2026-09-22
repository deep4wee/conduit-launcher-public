using System.Collections.Generic;
namespace ConduitLauncher.Domain.Entities;

public class Manifest
{
    public string PackName { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string MinecraftVersion { get; set; } = string.Empty;
    public string LoaderVersion { get; set; } = string.Empty; // e.g. "fabric-0.15.7"

    public List<ModDefinition> Mods { get; set; } = new();
}