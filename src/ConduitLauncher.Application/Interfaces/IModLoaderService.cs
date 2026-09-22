using System.Threading.Tasks;

namespace ConduitLauncher.Application.Interfaces;

public interface IModLoaderService
{
    Task<string> InstallLoaderAsync(string instanceRootPath, string mcVersion, string loaderType, string loaderVersion, string javaPath);
}
    