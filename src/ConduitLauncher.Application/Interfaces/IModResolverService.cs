using System.Threading;
using System.Threading.Tasks;
using ConduitLauncher.Domain.Shared;

namespace ConduitLauncher.Application.Interfaces;

public interface IModResolverService
{
    Task<Result> ResolveAndDownloadDependenciesAsync(string initialVersionId, string instanceId, string mcVersion, string loaderType, CancellationToken ct);
}
