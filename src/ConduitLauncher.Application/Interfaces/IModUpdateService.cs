using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ConduitLauncher.Domain.Entities;
using ConduitLauncher.Application.Features.Mods;
using ConduitLauncher.Domain.Shared;

namespace ConduitLauncher.Application.Interfaces;

public interface IModUpdateService
{
    Task<List<ModUpdateDto>> CheckUpdatesAsync(string instanceId, CancellationToken ct = default);
    Task<Result> ApplyUpdateAsync(string instanceId, string projectId, string targetVersionId, CancellationToken ct = default);
}
