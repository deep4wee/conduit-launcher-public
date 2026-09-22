using System.Threading.Tasks;
using ConduitLauncher.Domain.Entities;

namespace ConduitLauncher.Application.Interfaces;

public interface IPreferencesStore
{
    Task<LauncherPrefs> LoadAsync();
    Task SaveAsync(LauncherPrefs prefs);
}
    