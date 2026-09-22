using System.Threading.Tasks;
using ConduitLauncher.Domain.Enums;

namespace ConduitLauncher.Application.Interfaces;

public interface IStorageModeManager
{
    Task<string> DeployModFileAsync(string sourceCacheFile, string targetFolder, string fileName, ModStorageMode mode);
}
