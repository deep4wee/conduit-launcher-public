using System.Threading;
using System.Threading.Tasks;
using ConduitLauncher.Domain.Shared;

namespace ConduitLauncher.Application.Interfaces;

public class MicrosoftAuthResult
{
    public string Username { get; set; } = "";
    public string AccessToken { get; set; } = "";
}

public interface IMicrosoftAuthService
{
    Task<Result<MicrosoftAuthResult>> AuthenticateInteractivelyAsync(CancellationToken cancellationToken = default);
}
