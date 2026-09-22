using System.Threading.Tasks;
using ConduitLauncher.Domain.Entities;

namespace ConduitLauncher.Application.Interfaces;

public interface IStorageManager
{
    Task InitializeDirectoriesAsync();
    Task<StorageMetrics> GetMetricsAsync();
    
    string GetRootPath();
    string GetGlobalCachePath();
    string GetJavaCachePath();
    string GetTempPath();
    string GetInstancePath(string instanceId);
    string GetInstanceModsPath(string instanceId);
    string GetGlobalModsRepositoryPath();
}