using System.Collections.Generic;
namespace ConduitLauncher.Domain.Entities;
// Локальний кеш лаунчера гравця
public class LocalState
{
    // Key: Mod ID, Value: Встановлена версія моду
    public Dictionary<string, ModDefinition> InstalledMods { get; set; } = new();

    // Reference Counting: Key: Dependency ID, Value: Список Mod IDs, які її вимагають
    public Dictionary<string, List<string>> DependencyGraph { get; set; } = new();
}